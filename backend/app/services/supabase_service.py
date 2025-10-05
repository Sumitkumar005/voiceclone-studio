from supabase import create_client, Client
from app.config import settings

# Initialize Supabase client with SERVICE KEY for storage operations
# This bypasses RLS policies and gives admin access
supabase_client: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_KEY
)