# One-Prompt Google Form Creator

Generate professional Google Forms instantly from natural language prompts using AI. Forms are created directly in users' own Google accounts via OAuth2.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-green) ![Gemini](https://img.shields.io/badge/Gemini-3%20Pro-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Local-green)

## ✨ Features

- **One-Prompt Generation**: Describe your form in natural language, get a complete Google Form
- **User-Owned Forms**: Forms are created directly in users' Google accounts via OAuth2
- **AI-Powered**: Uses Gemini 3 Pro in agentic mode for accurate form schema generation
- **Glassmorphism UI**: Beautiful, modern interface with smooth animations
- **Form History**: Track all your generated forms
- **Type-Safe**: Strict Pydantic validation ensures accurate form creation

## 🏗️ Architecture

```
Frontend (Next.js + Tailwind CSS)
    ↓ HTTP Requests
Backend (FastAPI)
    ↓ OAuth2 Flow
Google APIs (Forms + Drive)
    ↓ AI Generation
Gemini 3 Pro API
    ↓ Storage
MongoDB (Sessions + Tokens + History)
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **MongoDB** Community Edition (local installation)
- **Google Cloud Project** with Forms API and Drive API enabled
- **Gemini API Key**

## 🚀 Setup Instructions

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable APIs:
   - Google Forms API
   - Google Drive API
4. Create OAuth2 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:8000/api/auth/callback`
   - Download credentials JSON

### 2. MongoDB Setup

See [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed Windows installation instructions.

**Quick start:**
```powershell
# Install MongoDB Community Edition from mongodb.com
# Start MongoDB service
net start MongoDB
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
copy .env.template .env

# Edit .env with your credentials:
# - GOOGLE_CLIENT_ID (from Google Cloud)
# - GOOGLE_CLIENT_SECRET (from Google Cloud)
# - GEMINI_API_KEY (from Google AI Studio)
# - SECRET_KEY (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Frontend automatically connects to http://localhost:8000
```

## 🎮 Running the Application

### Start Backend
```bash
cd backend
venv\Scripts\activate
python main.py
```
Backend runs on `http://localhost:8000`

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

### Access the App
Open `http://localhost:3000` in your browser

## 📖 How to Use

1. **Sign In**: Click "Sign in with Google" and authorize the app
2. **Describe Your Form**: Enter a natural language prompt, e.g.:
   - "Create a customer feedback form with name, email, rating (1-5), and comments"
   - "Event registration with name, email, t-shirt size (S/M/L/XL), dietary restrictions (checkbox)"
3. **Generate**: Click "Magic Generate" and wait for AI to create your form
4. **Access Form**: Click the link to open your form in Google Forms
5. **View History**: See all your previously generated forms

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/login` - Get OAuth URL
- `GET /api/auth/callback` - Handle OAuth callback
- `GET /api/auth/status` - Check auth status
- `POST /api/auth/logout` - Logout

### Form Generation
- `POST /api/generate` - Generate form from prompt
  ```json
  {
    "prompt": "Create a survey with..."
  }
  ```

### History
- `GET /api/history?skip=0&limit=20` - Get form history

## 🧪 Testing

### Test Backend
```bash
cd backend
python test_generation.py
```

### Test Frontend Build
```bash
cd frontend
npm run build
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- Tailwind CSS
- Lucide React Icons
- Axios

**Backend:**
- FastAPI
- Pydantic 2.0
- google-api-python-client
- google-auth-oauthlib
- google-generativeai
- PyMongo
- Cryptography

**Database:**
- MongoDB (Local)

**AI:**
- Google Gemini 3 Pro (gemini-2.0-flash-exp)

## 🔒 Security

- OAuth tokens are encrypted using Fernet (AES-128)
- Session cookies are HTTP-only
- CSRF protection via state parameter
- Token refresh handled automatically

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB service is running: `net start MongoDB`
- Check MongoDB URI in `.env`: `mongodb://localhost:27017/`

### OAuth Redirect Mismatch
- Verify redirect URI in Google Cloud Console matches `.env`
- Must be exactly: `http://localhost:8000/api/auth/callback`

### Gemini API Errors
- Check API key is valid
- Ensure you have Gemini API access enabled

### Form Creation Fails
- Verify Google Forms API is enabled
- Check OAuth scopes include `forms.body` and `drive.file`

## 📝 License

MIT License - feel free to use this project for your own purposes!

## 🙏 Acknowledgments

Built with ❤️ using Google's Gemini AI and Google Forms API
