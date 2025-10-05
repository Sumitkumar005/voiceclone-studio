from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.services.supabase_service import supabase_client

router = APIRouter()

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def sign_up(request: SignUpRequest):
    """Sign up new user"""
    try:
        response = supabase_client.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        
        if response.user:
            # Create user profile in database
            supabase_client.table("profiles").insert({
                "user_id": response.user.id,
                "email": request.email,
                "tier": "free",
                "generations_used": 0,
                "generations_limit": 10
            }).execute()
            
            return {
                "user": response.user,
                "session": response.session
            }
        else:
            raise HTTPException(status_code=400, detail="Signup failed")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/signin")
async def sign_in(request: SignInRequest):
    """Sign in existing user"""
    try:
        response = supabase_client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        return {
            "user": response.user,
            "session": response.session
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/signout")
async def sign_out():
    """Sign out user"""
    try:
        supabase_client.auth.sign_out()
        return {"message": "Signed out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def get_current_user(token: str):
    """Get current user info"""
    try:
        user = supabase_client.auth.get_user(token)
        
        # Get profile
        profile = supabase_client.table("profiles")\
            .select("*")\
            .eq("user_id", user.user.id)\
            .single()\
            .execute()
        
        return {
            "user": user.user,
            "profile": profile.data
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
