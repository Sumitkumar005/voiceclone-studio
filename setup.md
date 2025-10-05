# 🚀 VoiceClone Studio - Complete Setup Guide

## 📋 PREREQUISITES

- Python 3.10+
- Node.js 18+
- Git

## 🔧 STEP 1: SUPABASE SETUP (5 minutes)

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up (free)
3. Click "New Project"
4. Name: `voiceclone-studio`
5. Database Password: (save this!)
6. Region: Choose closest to you
7. Click "Create new project" (takes 2 minutes)

### 2. Get API Keys
Once project is ready:
1. Go to Settings → API
2. Copy these values:
   - `Project URL` → This is `SUPABASE_URL`
   - `anon public` key → This is `SUPABASE_ANON_KEY`
   - `service_role` key → This is `SUPABASE_SERVICE_KEY`

### 3. Create Database Tables
1. Go to SQL Editor in Supabase
2. Run this SQL:

```sql
-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email TEXT,
    tier TEXT DEFAULT 'free',
    generations_used INTEGER DEFAULT 0,
    generations_limit INTEGER DEFAULT 10,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Voices table
CREATE TABLE voices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    duration FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Generations table
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    voice_id UUID REFERENCES voices(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Voices policies
CREATE POLICY "Users can view own voices"
    ON voices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voices"
    ON voices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own voices"
    ON voices FOR DELETE
    USING (auth.uid() = user_id);

-- Generations policies
CREATE POLICY "Users can view own generations"
    ON generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
    ON generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, tier, generations_used, generations_limit)
    VALUES (NEW.id, NEW.email, 'free', 0, 10);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Create Storage Buckets
1. Go to Storage in Supabase
2. Create 2 buckets:
   - `voice-samples` (private)
   - `generated-audio` (public)
3. For each bucket, set these policies:

**voice-samples policies:**
```sql
-- INSERT policy
CREATE POLICY "Users can upload own samples"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'voice-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

-- SELECT policy
CREATE POLICY "Users can view own samples"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE policy
CREATE POLICY "Users can delete own samples"
ON storage.objects FOR DELETE
USING (bucket_id = 'voice-samples' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**generated-audio policies:**
```sql
-- INSERT policy
CREATE POLICY "Users can upload generated audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- SELECT policy
CREATE POLICY "Anyone can view generated audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-audio');

-- DELETE policy
CREATE POLICY "Users can delete own audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-audio' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 💳 STEP 2: STRIPE SETUP (5 minutes)

### 1. Create Stripe Account
1. Go to https://stripe.com
2. Sign up (free)
3. Skip onboarding (click "Skip for now")

### 2. Get API Keys (Test Mode)
1. Go to Developers → API keys
2. Toggle "Test mode" ON (top right)
3. Copy:
   - `Publishable key` → This is `STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → Click "Reveal" then copy → This is `STRIPE_SECRET_KEY`

### 3. Create Products & Prices
1. Go to Products → Add Product
2. Create **Pro Product**:
   - Name: `VoiceClone Pro`
   - Description: `500 generations per month`
   - Price: `$9.00 USD`
   - Billing period: `Monthly`
   - Click Save
   - Copy the **Price ID** (starts with `price_...`)

---

## 🛠️ STEP 3: BACKEND SETUP (10 minutes)

### 1. Clone & Setup
```bash
# Clone the repo (or create new folder)
mkdir voiceclone-studio
cd voiceclone-studio

# Create backend folder
mkdir backend
cd backend
```

### 2. Copy Backend Files
Copy all the Python files from the artifact above into `backend/`

### 3. Create .env file
```bash
# backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # Leave empty for now

SECRET_KEY=your-super-secret-key-change-this
ENVIRONMENT=development

GROQ_API_KEY=  # Optional, for future features
```

### 4. Install Python Dependencies
```bash
# Create virtual environment
python -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 5. Setup NeuTTS Air
```bash
# Clone NeuTTS Air repository
cd backend
git clone https://github.com/neuphonic/neutts-air.git
cd neutts-air

# Follow their setup instructions from README
# Typically:
pip install -e .

# Download model weights (check their repo for latest instructions)
# This might be: python download_models.py

cd ..
```

### 6. Update NeuTTS Service
Replace `backend/app/services/neutts_service.py` with actual NeuTTS integration:

```python
# backend/app/services/neutts_service.py
import torch
import torchaudio
from neutts_air import NeuTTS  # Adjust import based on actual package

class NeuTTSService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"NeuTTS running on: {self.device}")
        
        # Load NeuTTS model (check neutts-air docs for exact syntax)
        self.model = NeuTTS.load_model(device=self.device)
        
    def clone_and_generate(self, reference_audio: str, text: str, output_path: str):
        try:
            # Load reference audio
            waveform, sample_rate = torchaudio.load(reference_audio)
            
            # Generate with NeuTTS (check docs for exact API)
            generated_audio = self.model.synthesize(
                text=text,
                reference_audio=waveform,
                sample_rate=sample_rate
            )
            
            # Save output
            torchaudio.save(output_path, generated_audio, sample_rate)
            
            print(f"Generated audio saved to: {output_path}")
            
        except Exception as e:
            raise Exception(f"Voice generation failed: {str(e)}")
```

### 7. Run Backend
```bash
# Make sure you're in backend/ folder
cd backend

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend should now be running at http://localhost:8000

---

## 🎨 STEP 4: FRONTEND SETUP (5 minutes)

### 1. Create Frontend Folder
```bash
# Go back to project root
cd ..

# Create frontend
npm create vite@latest frontend -- --template react
cd frontend
```

### 2. Install Dependencies
```bash
npm install
npm install @supabase/supabase-js react-router-dom lucide-react axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Copy Frontend Files
Copy all the JavaScript files from the frontend artifact above into `frontend/src/`

### 4. Create .env file
```bash
# frontend/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5. Update index.html
```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VoiceClone Studio - Clone Your Voice in 30 Seconds</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 6. Run Frontend
```bash
npm run dev
```

Frontend should now be running at http://localhost:5173

---

## ✅ STEP 5: TEST IT OUT (5 minutes)

### 1. Open Browser
Go to http://localhost:5173

### 2. Sign Up
- Create new account with your email
- Check email for verification (might be in spam)
- Click verification link
- Sign in

### 3. Upload Voice Sample
- Record or find a 30-second audio file of your voice
- Click "Upload Voice Sample"
- Name it (e.g., "My Voice")
- Upload

### 4. Generate
- Select your voice
- Type some text
- Click "Generate Voice"
- Wait 5-10 seconds
- Play and download!

---

## 🐛 COMMON ISSUES & FIXES

### Issue: "CORS error"
**Fix:** Make sure backend is running and frontend `.env` has correct `VITE_API_URL`

### Issue: "Supabase auth error"
**Fix:** Check that:
- Supabase URL and keys are correct in both `.env` files
- Email confirmation is enabled in Supabase (Settings → Authentication)

### Issue: "NeuTTS import error"
**Fix:** Make sure you:
- Cloned neutts-air repo into `backend/` folder
- Installed it with `pip install -e .`
- Downloaded model weights

### Issue: "File upload fails"
**Fix:** Check Storage policies in Supabase are set correctly (see Step 1.4)

---

## 🚀 DEPLOYMENT (Railway - FREE)

### Backend Deployment

1. **Create Railway account**: https://railway.app
2. **New Project** → Deploy from GitHub
3. **Connect your repo**
4. **Add environment variables** (all the ones from backend/.env)
5. **Deploy** (Railway auto-detects Python)

### Frontend Deployment

1. **Vercel** (easiest): https://vercel.com
2. **Import Git repository**
3. **Framework**: Vite
4. **Root directory**: `frontend`
5. **Add environment variables** (all from frontend/.env)
6. **Deploy**

---

## 💰 COST BREAKDOWN (REAL NUMBERS)

### Development (Free!)
- Supabase: Free tier (500MB database, 1GB storage)
- Stripe: Free (just 2.9% per transaction)
- Local server: Free

### Production (Month 1)
- Railway: **$0** (500 hours free tier covers 1 server 24/7)
- Vercel: **$0** (free hobby tier)
- Supabase: **$0** (free tier good for 1000+ users)
- **Total: $0/month**

### Production (Growing)
- Railway: **$5/month** (if you exceed free hours)
- Supabase: **$25/month** (if you need Pro tier at 10K+ users)
- **Total: $30/month** (covers you until 10K users)

---

## 📣 MARKETING CHECKLIST (Get Your First 10 Customers)

### Week 1: Launch
- [ ] Post on Reddit (r/SideProject, r/IndieBiz)
- [ ] Tweet launch announcement
- [ ] Post in 5 Facebook groups (YouTube creators)
- [ ] Share on LinkedIn

### Week 2: Direct Outreach
- [ ] Find 50 YouTubers who need voiceovers
- [ ] DM them on Twitter offering free trial
- [ ] Email 20 course creators on LinkedIn

### Week 3: Content
- [ ] Write blog post: "How I Built VoiceClone for $0"
- [ ] Make demo video on YouTube
- [ ] Post on Hacker News

### Week 4: Convert
- [ ] Email free users: upgrade offer
- [ ] Add upgrade prompts in app
- [ ] Offer 50% off first month

---

## 📊 SUCCESS METRICS

### Day 1 Goal:
- ✅ App deployed and working
- ✅ 5 test accounts created
- ✅ 10+ voice generations successful

### Week