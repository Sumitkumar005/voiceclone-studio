from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header, Depends
from fastapi.responses import FileResponse
import os
import uuid
import tempfile
import asyncio
from datetime import datetime
from pathlib import Path

from app.services.neutts_service import get_neutts_service
from app.services.supabase_service import supabase_client
from app.config import settings
from app.utils.audio_utils import get_audio_duration

router = APIRouter()

# Windows-compatible temp directory
TEMP_DIR = Path(tempfile.gettempdir()) / "voiceclone"
TEMP_DIR.mkdir(exist_ok=True)

async def get_current_user(authorization: str = Header(None)):
    """Get current user from token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.split(" ")[1]
    try:
        user = supabase_client.auth.get_user(token)
        return user.user
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

async def check_usage_limit(user_id: str):
    """Check if user has generations remaining"""
    try:
        response = supabase_client.table("profiles")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        profile = response.data[0]
        
        if profile["generations_used"] >= profile["generations_limit"]:
            raise HTTPException(
                status_code=403,
                detail="Generation limit reached. Upgrade to Pro for more."
            )
        
        return profile
    except HTTPException:
        raise
    except Exception as e:
        print(f"Usage check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-voice")
async def upload_voice_sample(
    file: UploadFile = File(...),
    voice_name: str = Form(...),
    user: dict = Depends(get_current_user)
):
    """Upload voice sample for cloning"""
    temp_path = None
    try:
        print(f"Upload request from user: {user.id}")
        
        # Validate audio file
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be audio")
        
        # Read file
        audio_data = await file.read()
        print(f"Audio data size: {len(audio_data)} bytes")
        
        # Save to temp file for validation
        temp_path = TEMP_DIR / f"{uuid.uuid4()}.wav"
        with open(temp_path, "wb") as f:
            f.write(audio_data)
        
        # Validate duration
        duration = get_audio_duration(str(temp_path))
        print(f"Audio duration: {duration}s")
        
        if duration > settings.MAX_AUDIO_LENGTH_SECONDS:
            os.remove(temp_path)
            raise HTTPException(
                status_code=400,
                detail=f"Audio must be under {settings.MAX_AUDIO_LENGTH_SECONDS}s"
            )
        
        # Upload to Supabase Storage
        voice_id = str(uuid.uuid4())
        storage_path = f"{user.id}/voices/{voice_id}.wav"
        
        print(f"Uploading to Supabase: {storage_path}")
        supabase_client.storage.from_("voice-samples").upload(
            storage_path,
            audio_data,
            {"content-type": "audio/wav"}
        )
        
        # Save to database
        print(f"Saving to database: {voice_id}")
        supabase_client.table("voices").insert({
            "id": voice_id,
            "user_id": user.id,
            "name": voice_name,
            "storage_path": storage_path,
            "duration": duration,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        # Cleanup
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        
        print(f"Upload successful: {voice_id}")
        return {
            "voice_id": voice_id,
            "name": voice_name,
            "message": "Voice sample uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {e}")
        import traceback
        traceback.print_exc()
        
        # Cleanup on error
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_voice(
    voice_id: str = Form(...),
    text: str = Form(...),
    user: dict = Depends(get_current_user)
):
    """Generate audio from text using cloned voice"""
    temp_voice_path = None
    output_path = None
    
    def run_generation():
        neutts = get_neutts_service()
        return neutts.clone_and_generate(
            reference_audio=str(temp_voice_path),
            text=text,
            output_path=str(output_path)
        )
    
    try:
        print(f"Generate request from user: {user.id}")
        
        # Check usage limit
        profile = await check_usage_limit(user.id)
        
        # Validate text length
        if len(text) > settings.MAX_TEXT_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Text too long (max {settings.MAX_TEXT_LENGTH} chars)"
            )
        
        # Get voice sample
        voice_response = supabase_client.table("voices")\
            .select("*")\
            .eq("id", voice_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not voice_response.data or len(voice_response.data) == 0:
            raise HTTPException(status_code=404, detail="Voice not found")
        
        voice = voice_response.data[0]
        print(f"Using voice: {voice['name']}")
        
        # Download voice sample from storage
        print(f"Downloading voice sample: {voice['storage_path']}")
        voice_sample_data = supabase_client.storage\
            .from_("voice-samples")\
            .download(voice["storage_path"])
        
        temp_voice_path = TEMP_DIR / f"voice_{uuid.uuid4()}.wav"
        with open(temp_voice_path, "wb") as f:
            f.write(voice_sample_data)
        
        # Generate audio with NeuTTS
        output_path = TEMP_DIR / f"output_{uuid.uuid4()}.wav"
        print(f"Generating audio with text: {text[:50]}...")
        
        # Run blocking generation in thread pool
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, run_generation)
        
        print("Audio generation complete")
        
        # Upload generated audio to storage
        generation_id = str(uuid.uuid4())
        storage_path = f"{user.id}/generations/{generation_id}.wav"
        
        with open(output_path, "rb") as f:
            audio_data = f.read()
        
        print(f"Uploading generated audio: {storage_path}")
        supabase_client.storage.from_("generated-audio").upload(
            storage_path,
            audio_data,
            {"content-type": "audio/wav"}
        )
        
        # Save generation record
        supabase_client.table("generations").insert({
            "id": generation_id,
            "user_id": user.id,
            "voice_id": voice_id,
            "text": text,
            "storage_path": storage_path,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        # Update usage count
        supabase_client.table("profiles")\
            .update({"generations_used": profile["generations_used"] + 1})\
            .eq("user_id", user.id)\
            .execute()
        
        # Cleanup temp files
        if temp_voice_path and os.path.exists(temp_voice_path):
            os.remove(temp_voice_path)
        if output_path and os.path.exists(output_path):
            os.remove(output_path)
        
        # Get download URL
        download_url = supabase_client.storage\
            .from_("generated-audio")\
            .get_public_url(storage_path)
        
        print(f"Generation successful: {generation_id}")
        
        return {
            "generation_id": generation_id,
            "download_url": download_url,
            "text": text,
            "generations_remaining": profile["generations_limit"] - profile["generations_used"] - 1
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Generation error: {e}")
        import traceback
        traceback.print_exc()
        
        # Cleanup on error
        if temp_voice_path and os.path.exists(temp_voice_path):
            os.remove(temp_voice_path)
        if output_path and os.path.exists(output_path):
            os.remove(output_path)
        
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-voices")
async def get_my_voices(user: dict = Depends(get_current_user)):
    """Get all voices for current user"""
    try:
        voices = supabase_client.table("voices")\
            .select("*")\
            .eq("user_id", user.id)\
            .order("created_at", desc=True)\
            .execute()
        
        return {"voices": voices.data if voices.data else []}
    except Exception as e:
        print(f"Get voices error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-generations")
async def get_my_generations(user: dict = Depends(get_current_user)):
    """Get all generations for current user"""
    try:
        generations = supabase_client.table("generations")\
            .select("*")\
            .eq("user_id", user.id)\
            .order("created_at", desc=True)\
            .limit(50)\
            .execute()
        
        # Add download URLs
        if generations.data:
            for gen in generations.data:
                gen["download_url"] = supabase_client.storage\
                    .from_("generated-audio")\
                    .get_public_url(gen["storage_path"])
        
        return {"generations": generations.data if generations.data else []}
    except Exception as e:
        print(f"Get generations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usage")
async def get_usage(user: dict = Depends(get_current_user)):
    """Get current usage stats"""
    try:
        response = supabase_client.table("profiles")\
            .select("*")\
            .eq("user_id", user.id)\
            .execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=404, 
                detail="Profile not found. Please contact support."
            )
        
        profile = response.data[0]
        
        return {
            "tier": profile["tier"],
            "generations_used": profile["generations_used"],
            "generations_limit": profile["generations_limit"],
            "generations_remaining": profile["generations_limit"] - profile["generations_used"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get usage error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))