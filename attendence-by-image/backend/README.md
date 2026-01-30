# AI Attendance System Backend

FastAPI-based backend for AI-powered attendance tracking using facial recognition.

## 🚀 Quick Deploy to Render

### Prerequisites
1. **Supabase Account** - [Sign up](https://supabase.com)
2. **GitHub Account** - Code must be pushed to GitHub
3. **Render Account** - [Sign up](https://render.com)

### Step 1: Setup Supabase

1. Create a new project on Supabase
2. Run the SQL schema from `schema.sql` in the SQL Editor
3. Get your credentials from **Settings → API**:
   - Project URL
   - Anon/Public Key

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 3: Deploy on Render

**Option A: Using Blueprint (Recommended)**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository: `ajayghanwate/attendence-by-image`
4. Render will detect `render.yaml` automatically
5. Add environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase anon key
6. Click **"Apply"**
7. Wait 15-30 minutes for deployment

**Option B: Manual Web Service**

1. Click **"New +"** → **"Web Service"**
2. Connect repository: `ajayghanwate/attendence-by-image`
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (same as above)
5. Select **Starter plan** ($7/month minimum)
6. Click **"Create Web Service"**

### Step 4: Verify Deployment

Once deployed, visit:
- **API Docs**: `https://your-app.onrender.com/docs`
- **Health Check**: `https://your-app.onrender.com/`

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/teacher/signup` | POST | Register new teacher |
| `/teacher/login` | POST | Teacher login |
| `/register-student` | POST | Register student with face |
| `/take-attendance` | POST | Mark attendance from classroom image |
| `/students` | GET | Get all students |
| `/attendance-history` | GET | Get attendance history |
| `/attendance-history/{session_id}` | GET | Get session details |

## 🔧 Local Development

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Create `.env` file**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run the server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

4. **Visit**: http://localhost:8000/docs

## ⚙️ Tech Stack

- **Framework**: FastAPI
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI/ML**: DeepFace (Facenet model)
- **Computer Vision**: OpenCV
- **Authentication**: Supabase Auth

## ⚠️ Important Notes

### Resource Requirements
- **Build Time**: 15-30 minutes (heavy ML dependencies)
- **First Request**: 30-60 seconds (model loading)
- **Recommended Plan**: Starter ($7/month) or higher
- **Free Tier**: Not recommended (may timeout)

### System Dependencies
The `aptfile` includes required system libraries for OpenCV:
- `libgl1-mesa-glx`
- `libglib2.0-0`

## 🐛 Troubleshooting

### Build Timeout
If build exceeds time limit:
- Ensure you're using **Starter plan** or higher
- Check build logs for specific errors

### OpenCV Import Error
If you see `ImportError: libGL.so.1`:
- Verify `aptfile` is present
- Render should automatically install system dependencies

### Environment Variables Not Set
If service fails to start:
- Check environment variables are set correctly in Render dashboard
- Variables should match your Supabase project

## 📚 Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Supabase Documentation](https://supabase.com/docs)
- [DeepFace GitHub](https://github.com/serengil/deepface)

## 📞 Support

For issues:
1. Check Render service logs
2. Verify Supabase connection
3. Test endpoints using `/docs`
