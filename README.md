# VoiceClone Studio

AI-powered voice cloning application. Upload a voice sample, generate speech in that voice.

## Tech Stack

- **Backend**: FastAPI, NeuTTS Air, Supabase
- **Frontend**: React, Vite, TailwindCSS
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage

## Features

- Voice sample upload
- AI voice generation
- User authentication
- Usage tracking (free tier: 10 generations/month)

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Clone NeuTTS Air
git clone https://github.com/neuphonic/neutts-air.git
cd neutts-air
pip install -r requirements.txt
cd ..

# Create .env file
cp .env.example .env
# Fill in your Supabase and Stripe keys

# Run server
uvicorn app.main:app --reload