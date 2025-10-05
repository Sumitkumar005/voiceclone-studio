import os
import sys
from pathlib import Path

# Add neutts-air to Python path
BACKEND_DIR = Path(__file__).parent.parent.parent
NEUTTS_DIR = BACKEND_DIR / "neutts-air"
sys.path.insert(0, str(NEUTTS_DIR))

print(f"📂 Loading NeuTTS from: {NEUTTS_DIR}")

# Set espeak path
ESPEAK_LIBRARY = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"

if os.path.exists(ESPEAK_LIBRARY):
    from phonemizer.backend.espeak.wrapper import EspeakWrapper
    EspeakWrapper.set_library(ESPEAK_LIBRARY)
    print(f"✅ espeak loaded from: {ESPEAK_LIBRARY}")
else:
    print(f"⚠️ WARNING: espeak not found at {ESPEAK_LIBRARY}")

import torch
import soundfile as sf
from neuttsair.neutts import NeuTTSAir

class NeuTTSService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🎙️ NeuTTS running on: {self.device}")
        
        try:
            print("⏳ Loading NeuTTS models (this takes 30-60 seconds first time)...")
            self.tts = NeuTTSAir(
                backbone_repo="neuphonic/neutts-air-q4-gguf",
                backbone_device="cpu",
                codec_repo="neuphonic/neucodec",
                codec_device=self.device
            )
            print("✅ NeuTTS Air loaded successfully!")
        except Exception as e:
            print(f"❌ Error loading NeuTTS: {e}")
            import traceback
            traceback.print_exc()
            self.tts = None
    
    def clone_and_generate(self, reference_audio: str, text: str, output_path: str):
        if self.tts is None:
            raise Exception("NeuTTS not initialized!")
        
        try:
            print(f"🎤 Encoding reference: {reference_audio}")
            ref_codes = self.tts.encode_reference(reference_audio)
            
            print(f"🎙️ Generating: {text[:50]}...")
            wav = self.tts.infer(text, ref_codes, text)
            
            sf.write(output_path, wav, 24000)
            print(f"✅ Generated audio saved to: {output_path}")
            
            return output_path
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise Exception(f"Voice generation failed: {str(e)}")

# CRITICAL: Load model ONCE at startup, reuse forever
_neutts_instance = None

def get_neutts_service():
    global _neutts_instance
    if _neutts_instance is None:
        print("🔄 Initializing NeuTTS (first time only)...")
        _neutts_instance = NeuTTSService()
    return _neutts_instance