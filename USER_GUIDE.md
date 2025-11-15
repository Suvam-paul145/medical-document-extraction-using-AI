# Medical Document Extraction - User Guide

## ✅ Your System is Running!

You've successfully started the application. Here's what you need to know:

## 🚀 Quick Start

### 1. Access the Application
Open your browser and go to: **http://localhost:3000**

### 2. Upload a Document
- Drag and drop a medical document (PDF, JPEG, or PNG)
- Or click the upload area to browse files
- Maximum file size: 10MB

### 3. Watch Processing
- See real-time progress through 5 stages
- Watch items being extracted (medications, diagnoses, labs, vitals)
- Beautiful animations show what's happening

### 4. View Results
- Click through tabs: Patient Info, Medications, Diagnoses, Lab Results
- Check confidence scores (green = high, yellow = medium, red = low)
- Verify extracted information

### 5. Export Data
- Click "Export JSON" for developers
- Click "Export CSV" for Excel/spreadsheet
- Click "New Document" to process another file

## 🔧 Common Issues & Fixes

### Upload Fails
**Fix:** The uploads folder is now created automatically. Just restart the server:
1. Press `Ctrl+C` in Command Prompt
2. Run `npm run dev` again
3. Try uploading again

### No Real-Time Updates
**Fix:** Refresh your browser (F5)

### Port Already in Use
**Fix:** Close other applications or change ports in `.env` file

### Cannot Find Module
**Fix:** Run `npm install` again

## 📁 What You Have

### Essential Files
- `src/` - Frontend React code
- `backend/` - Backend Node.js code
- `uploads/` - Uploaded documents (auto-created)
- `package.json` - Dependencies
- `.env` - Configuration

### Documentation (Keep These)
- `README.md` - Project overview
- `START_HERE.md` - Getting started guide
- `SETUP_GUIDE.md` - Detailed setup
- `QUICK_START.md` - Fast guide
- `TROUBLESHOOTING.md` - Problem solving
- `USER_GUIDE.md` - This file

### Scripts
- `start.bat` - Easy startup (double-click)
- `npm run dev` - Start both servers
- `npm run dev:frontend` - Frontend only
- `npm run dev:backend` - Backend only

## 💡 Tips for Success

### Best Practices
1. Keep Command Prompt open while using the app
2. Use clear, readable documents
3. Keep files under 10MB
4. Check confidence scores on results

### Demo Mode
- Works without OpenAI API key
- Shows realistic sample data
- Perfect for testing and learning

### Stopping the App
- Press `Ctrl+C` in Command Prompt
- Close browser
- Done!

## 🎯 What It Does

### Extracts Medical Information
- **Patient Info:** Name, DOB, ID, age, gender
- **Medications:** Drug name, dosage, frequency, duration
- **Diagnoses:** Conditions, ICD codes, severity
- **Lab Results:** Test names, values, units, status
- **Vital Signs:** Blood pressure, heart rate, etc.

### Features
- ✅ Drag-and-drop upload
- ✅ Real-time processing visualization
- ✅ Confidence scoring
- ✅ Multiple export formats
- ✅ Beautiful animations
- ✅ Error handling

## 📞 Need Help?

1. **Check TROUBLESHOOTING.md** for common issues
2. **Read error messages** - they tell you what's wrong
3. **Restart servers** - fixes 90% of issues
4. **Check both Command Prompt and browser console** for errors

## ✨ Next Steps

1. Upload a test document
2. Explore all features
3. Try different export formats
4. Process multiple documents
5. Customize as needed

---

**Your system is complete and ready to use!** 🎉

Just open http://localhost:3000 and start uploading documents!
