# MedExtract - Medical Document AI Setup Guide

## Overview

**MedExtract** is an advanced AI-powered medical document extraction system designed for healthcare professionals and researchers. It intelligently extracts and analyzes medical information from documents including prescriptions, lab reports, and clinical records.

## Features

✨ **Advanced Extraction**
- Patient demographics extraction
- Medication information (drugs, dosage, frequency)
- Diagnosis identification with ICD codes
- Laboratory results and vital signs
- Physician information

🚀 **Performance**
- Real-time processing with WebSocket updates
- Multi-stage processing pipeline (OCR → Analysis → Extraction → Validation)
- Confidence scoring for all extracted data

🔒 **Security & Privacy**
- API key-based authentication
- Secure local storage of configuration
- No default outputs without proper setup

📊 **Professional Features**
- High-confidence extraction results
- Multiple export formats (JSON, CSV)
- Real-time processing status updates
- Activity logging and monitoring

## System Requirements

- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **OpenAI API Key** (for AI-powered extraction)
- **Redis** (optional, for production deployment)

## Installation

### 1. Clone or Extract the Project

```bash
cd "c:\Users\suvam\Desktop\VS code\Projects\medical-document-extraction using AI"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React & Vite (Frontend)
- Express.js (Backend)
- OpenAI SDK
- Socket.io (Real-time updates)
- Tesseract.js (OCR)
- And more...

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Backend Configuration
PORT=5000
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your_key_here

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_TIMEOUT=300000
```

**Important:** The API key is NOT required in the `.env` file. Users will configure it through the Settings panel in the application.

## Getting Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **+ Create new secret key**
5. Copy your API key (starts with `sk-`)
6. Keep it secure - never share it publicly

## Running the Application

### Development Mode

Run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:5000 (Express server)

### Production Build

```bash
npm run build
```

Then preview:

```bash
npm run preview
```

## First Time Setup Checklist

- [ ] Clone/extract project
- [ ] Run `npm install`
- [ ] Configure `.env` file
- [ ] Start development server with `npm run dev`
- [ ] Open browser to http://localhost:5173
- [ ] Click Settings (⚙️) in header
- [ ] Enter your OpenAI API key
- [ ] Save and confirm API is active
- [ ] Upload a medical document to test

## Using MedExtract

### Step 1: Configure API Key

1. Click the **Settings** (⚙️) button in the top-right corner
2. Enter your OpenAI API key
3. Click **Save API Key**
4. You should see "API Active" status indicator

### Step 2: Upload Document

1. Drag and drop a medical document, or click to browse
2. Supported formats: PDF, JPEG, PNG
3. Maximum file size: 10MB

### Step 3: Monitor Processing

Watch real-time processing stages:
- **OCR**: Document text extraction
- **Analyzing**: Content analysis
- **Extracting**: Medical data extraction
- **Validating**: Quality validation

### Step 4: View Results

Results are organized by category:
- **Patient Info**: Demographics, contact details
- **Medications**: Drug information with dosages
- **Diagnoses**: Medical conditions and ICD codes
- **Lab Results**: Test values and reference ranges

### Step 5: Export Data

Export extracted data in multiple formats:
- **JSON**: For technical integration
- **CSV**: For spreadsheet analysis
- **Copy to Clipboard**: For quick sharing

## API Key Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Rotate keys** regularly
4. **Use separate keys** for development and production
5. **Monitor API usage** in OpenAI dashboard
6. **Set spending limits** to prevent unexpected charges

### In This Application

- API keys are stored **locally in browser** (localStorage)
- Keys are **never sent to external servers**
- Keys are **encrypted** and not logged
- Each user manages their own key

## Troubleshooting

### "API Key Required" Error

**Problem**: Cannot upload documents
**Solution**: 
- Click Settings button in header
- Enter valid OpenAI API key (starts with `sk-`)
- Ensure key is active in OpenAI dashboard

### Connection Issues

**Problem**: Backend not connecting
**Solution**:
```bash
# Kill any existing processes on port 5000
# Restart development server
npm run dev
```

### File Upload Fails

**Problem**: Cannot upload medical document
**Solution**:
- Check file format (PDF, JPEG, PNG only)
- Verify file size < 10MB
- Check browser console for errors
- Ensure API key is configured

### Processing Timeout

**Problem**: Document takes too long to process
**Solution**:
- Complex documents may take longer
- Try splitting large documents
- Check backend logs for errors
- Ensure sufficient API quota

## File Structure

```
medical-document-extraction/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── Header.tsx       # Navigation header
│   │   ├── DocumentUpload.tsx
│   │   ├── ProcessingView.tsx
│   │   └── ResultsView.tsx
│   ├── services/            # API and WebSocket services
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript types
│   └── App.tsx
├── backend/
│   ├── server.js            # Express server
│   ├── routes/              # API routes
│   └── services/            # Business logic
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (frontend + backend)
npm run dev

# Frontend only (Vite)
npm run dev:frontend

# Backend only (Node watch mode)
npm run dev:backend

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment type | `development` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | `sk-...` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `MAX_FILE_SIZE` | Max upload size in bytes | `10485760` |

## Support & Issues

If you encounter issues:

1. Check the browser console (F12) for error messages
2. Check backend logs in terminal
3. Verify all dependencies are installed
4. Ensure OpenAI API key is valid and has credits
5. Check network connectivity

## Performance Optimization

For better performance:

1. **Enable Redis** for job queue (optional)
2. **Use PDF documents** instead of images for faster processing
3. **Optimize large documents** by splitting them
4. **Clear browser cache** periodically
5. **Monitor API usage** to stay within limits

## Next Steps

- Read the [README.md](./README.md) for overview
- Explore supported extraction types
- Test with various medical documents
- Configure additional settings as needed
- Integrate with your systems via APIs

## License & Attribution

This project uses open-source libraries:
- React & Vite
- Express.js
- OpenAI API
- Tesseract.js
- Socket.io
- Tailwind CSS
- Framer Motion

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready

For the latest updates and documentation, check the project repository.
