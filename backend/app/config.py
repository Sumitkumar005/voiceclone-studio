from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str
    
    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    
    # App
    SECRET_KEY: str = "286dbcf448e71ce969c674403b052fa86ecdbb869baa51f76b8dbd46e91badd2"
    ENVIRONMENT: str = "development"
    
    # Groq (if needed for future features)
    GROQ_API_KEY: str = ""
    
    # Limits
    FREE_TIER_LIMIT: int = 10
    PRO_TIER_LIMIT: int = 500
    MAX_AUDIO_LENGTH_SECONDS: int = 30
    MAX_TEXT_LENGTH: int = 5000
    
    class Config:
        env_file = ".env"

settings = Settings()
