import os
from dotenv import load_dotenv # type: ignore

# Load environment variables from .env file
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY not found in environment variables.")

if not TAVILY_API_KEY:
    print("Warning: TAVILY_API_KEY not found in environment variables.")

if not SUPABASE_URL:
    print("Warning: SUPABASE_URL not found in environment variables.")

if not SUPABASE_KEY:
    print("Warning: SUPABASE_KEY not found in environment variables.")
