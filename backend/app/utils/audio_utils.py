import soundfile as sf
from pydub import AudioSegment
import io

def validate_audio_file(file_data: bytes) -> bool:
    """Validate audio file format"""
    try:
        audio = AudioSegment.from_file(io.BytesIO(file_data))
        return True
    except:
        return False

def get_audio_duration(file_path: str) -> float:
    """Get audio duration in seconds"""
    try:
        data, samplerate = sf.read(file_path)
        duration = len(data) / samplerate
        return duration
    except Exception as e:
        raise Exception(f"Failed to read audio: {str(e)}")