import os
import sys
from pathlib import Path

# Add neutts-air to path
NEUTTS_DIR = Path(__file__).parent / "neutts-air"
sys.path.insert(0, str(NEUTTS_DIR))

print(f"📂 NeuTTS directory: {NEUTTS_DIR}")
print(f"📂 Exists? {NEUTTS_DIR.exists()}")

# Set espeak
ESPEAK_LIBRARY = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"
if os.path.exists(ESPEAK_LIBRARY):
    from phonemizer.backend.espeak.wrapper import EspeakWrapper
    EspeakWrapper.set_library(ESPEAK_LIBRARY)
    print(f"✅ espeak loaded")
else:
    print(f"❌ espeak NOT FOUND!")
    exit(1)

# Test import
try:
    from neuttsair.neutts import NeuTTSAir
    print("✅ NeuTTS import successful!")
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Try to load model
try:
    print("🎙️ Loading NeuTTS Air model...")
    tts = NeuTTSAir(
        backbone_repo="neuphonic/neutts-air-q4-gguf",
        backbone_device="cpu",
        codec_repo="neuphonic/neucodec",
        codec_device="cpu"
    )
    print("✅ NeuTTS loaded successfully!")
    print("🎉 TEST PASSED!")
except Exception as e:
    print(f"❌ Loading failed: {e}")
    import traceback
    traceback.print_exc()