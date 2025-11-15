# Medical Document Extraction System

AI-powered medical document extraction with real-time visual feedback.

## 🚀 Quick Start

1. **Install dependencies:**
   ```cmd
   npm install
   ```

2. **Start the application:**
   ```cmd
   npm run dev
   ```
   Or double-click `start.bat`

3. **Open browser:**
   http://localhost:3000

## ✨ Features

- 📄 Upload medical documents (PDF, JPEG, PNG)
- 🤖 AI-powered extraction (demo mode included)
- ⚡ Real-time processing updates
- 🎨 Beautiful animations
- 📊 Confidence scoring
- 📤 Export to JSON, CSV, PDF

## 📖 Documentation

- **USER_GUIDE.md** - How to use the app
- **START_HERE.md** - Complete getting started guide
- **SETUP_GUIDE.md** - Detailed setup instructions
- **TROUBLESHOOTING.md** - Fix common issues

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, TailwindCSS, Framer Motion, Zustand
**Backend:** Node.js, Express, Socket.io, Bull, Multer

## 📝 Commands

- `npm run dev` - Start both servers
- `npm run dev:frontend` - Frontend only (port 3000)
- `npm run dev:backend` - Backend only (port 5000)
- `npm run build` - Build for production

## 🎯 What It Extracts

- Patient demographics (name, DOB, ID, age, gender)
- Medications (drug, dosage, frequency, duration)
- Diagnoses (condition, ICD code, severity)
- Lab results (test name, value, unit, status)
- Vital signs (BP, heart rate, etc.)

## 💡 Demo Mode

Works without OpenAI API key! Uses simulated AI extraction with realistic sample data.

## 🆘 Need Help?

Check **TROUBLESHOOTING.md** or **USER_GUIDE.md**
