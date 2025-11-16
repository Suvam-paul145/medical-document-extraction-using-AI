# MedExtract - Medical Document AI System

**Advanced agentic AI-powered medical document extraction for healthcare professionals and researchers**

---

## Overview

**MedExtract** is a sophisticated medical document extraction system powered by **intelligent agentic AI** that extracts, analyzes, and structures medical information from clinical documents with real-time processing visualization. Designed for healthcare professionals, researchers, and medical institutions.

### 🤖 Agentic Extraction

The system uses **OpenAI's function-calling capabilities** to create an intelligent agent that:
- Automatically detects document type (prescription, lab report, medical report, etc.)
- Multi-stage extraction pipeline with real-time progress tracking
- Validates data consistency and flags potential issues
- Provides confidence scores for each extracted item
- Shows live visualization of the agent's thinking process

### Key Features

✅ **Intelligent Agentic Processing**
- 5-stage extraction pipeline with real-time visualization
- Document type auto-detection (prescriptions, reports, labs, etc.)
- OpenAI function-calling for structured data extraction
- Confidence scoring and validation

✅ **Smart Document Processing**
- Automatic text extraction from PDFs and medical images
- Advanced OCR for scanned documents
- Multi-format support (PDF, JPEG, PNG)

✅ **Medical Data Extraction**
- Patient demographics and contact information
- Medication information with dosages and frequency
- Diagnosis identification with severity assessment
- Laboratory results with normal/abnormal flags
- Vital signs
- Data validation and conflict detection

✅ **AI-Powered Analysis**
- GPT-4 powered intelligent extraction
- Real-time confidence scoring
- Live processing updates with stage visualization
- Extracted items displayed as they're found

✅ **Professional Features**
- Multiple export formats (JSON, CSV)
- Activity logging and monitoring
- WebSocket real-time updates
- Secure API key management
- Beautiful animations and medical-themed UI

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

### 3. Configure OpenAI API Key
1. Click Settings (⚙️) in the header
2. Enter your OpenAI API key (get it from [platform.openai.com](https://platform.openai.com/api-keys))
3. Click "Save API Key"

### 4. Upload & Extract
1. Drag and drop a medical document
2. Monitor real-time agentic processing
3. Review extracted results with confidence scores
4. Export in your preferred format

---

## 🤖 Agentic Extraction Pipeline

The system uses an intelligent AI agent that processes documents in 5 stages:

```
📄 INPUT → [OCR] → [Analysis] → [Extraction] → [Validation] → [Complete] → 📊 OUTPUT
```

### Processing Stages

| Stage | Progress | Action |
|-------|----------|--------|
| **Text Extraction** | 10-40% | Extracts text from PDF/image |
| **Document Analysis** | 40-50% | Agent classifies document type |
| **Information Extraction** | 50-85% | Agent extracts medical entities |
| **Data Validation** | 85-95% | Agent validates data consistency |
| **Completion** | 95-100% | Final extraction with confidence scores |

### Document Type Detection

The agent automatically detects:
- 💊 Prescriptions
- 🧪 Lab Reports  
- 📋 Medical Reports
- 🖼️ Imaging Reports
- 📤 Discharge Summaries
- 📝 Progress Notes

### Extracted Information

For each document, the agent extracts:
- 👤 **Patient Info** - Name, DOB, Gender, MRN, Age
- 💊 **Medications** - Name, dosage, frequency, route, indication
- 🏥 **Diagnoses** - Condition, ICD code, status, severity
- 🧬 **Lab Results** - Test name, value, unit, status
- ❤️ **Vitals** - Temperature, BP, HR, O2 saturation, etc.
- ✅ **Validation** - Data consistency checks, issues, recommendations

### Real-Time Visualization

See the agent's thinking process:
- Multi-stage progress timeline
- Real-time extracted items display
- Confidence indicators for each item
- Document type badge with confidence
- Validation status and warnings

**For detailed agentic extraction guide, see [AGENTIC_EXTRACTION_GUIDE.md](./AGENTIC_EXTRACTION_GUIDE.md)**

---

## System Requirements

- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **OpenAI API Key** (required for extraction)
- **2GB RAM** minimum (4GB recommended)

---

## Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Zustand (state management)

**Backend:**
- Node.js + Express.js
- Socket.io (real-time updates)
- Multer (file uploads)
- PDF-Parse + Tesseract.js (document processing)
- OpenAI API (AI extraction)

---

## Project Structure

```
medical-document-extraction/
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   ├── Header.tsx            # Navigation header
│   │   ├── SettingsModal.tsx     # API key configuration
│   │   ├── DocumentUpload.tsx    # Upload interface
│   │   ├── ProcessingView.tsx    # Processing status
│   │   └── ResultsView.tsx       # Results display
│   ├── services/                 # API and WebSocket services
│   ├── store/                    # Zustand state
│   ├── types/                    # TypeScript definitions
│   └── App.tsx                   # Main component
├── backend/                      # Backend source
│   ├── server.js                 # Express server
│   ├── routes/                   # API routes
│   └── services/                 # Business logic
├── SETUP.md                      # Detailed setup guide
├── README.md                     # This file
└── package.json                  # Dependencies
```

---

## Supported Medical Documents

- ✅ Prescriptions
- ✅ Lab Reports
- ✅ Medical Records
- ✅ Clinical Notes
- ✅ Vital Signs Reports
- ✅ Pathology Reports

---

## API Key Setup

### Get Your OpenAI API Key

1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign in or create account
3. Go to API Keys section
4. Create new secret key
5. Copy and save securely

### Configure in MedExtract

1. Start the application
2. Click Settings button (⚙️)
3. Enter your API key
4. Save - you'll see "API Active" status

⚠️ **Security Notes:**
- Keys are stored locally in your browser
- Never share your API key
- Rotate keys regularly
- Monitor your OpenAI usage

---

## Development Commands

```bash
# Full development mode (frontend + backend)
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Troubleshooting

### "API Key Required" Error
- Click Settings and enter a valid OpenAI API key
- Ensure your key is active in the OpenAI dashboard
- Verify you have API credits available

### Cannot Upload Files
- Check file format (PDF, JPEG, PNG only)
- Ensure file size < 10MB
- Verify API key is configured
- Check browser console (F12) for errors

### Processing Timeout
- Split large documents into smaller sections
- Verify internet connection
- Check OpenAI API status
- Try with a different document

### Backend Connection Issues
```bash
# Restart development server
npm run dev

# Check if ports are available (5000, 5173)
```

---

## Performance Tips

1. **Use PDF documents** instead of scanned images for faster processing
2. **Optimize image quality** if uploading scanned documents
3. **Split large documents** into sections
4. **Monitor API usage** in OpenAI dashboard
5. **Use Redis** for production deployments

---

## Environment Variables

Create `.env` file:

```
PORT=5000
NODE_ENV=development
OPENAI_MODEL=gpt-3.5-turbo
MAX_FILE_SIZE=10485760
UPLOAD_TIMEOUT=300000
```

---

## Use Cases

### 📊 For Researchers
- Extract data from document collections
- Export to CSV for analysis
- Batch process multiple documents

### 🏥 For Healthcare Providers
- Quick patient information retrieval
- Medication reconciliation
- Documentation support

### 📝 For Medical Offices
- Automate data entry
- Improve documentation accuracy
- Reduce manual processing time

---

## Detailed Documentation

- **[SETUP.md](./SETUP.md)** - Comprehensive setup and configuration guide
- Console logs - Check browser console (F12) for error messages
- Backend logs - Check terminal for server messages

---

## Known Limitations

- ⚠️ Requires valid OpenAI API key with available credits
- ⚠️ Processing time depends on document complexity
- ⚠️ Maximum 10MB file size
- ⚠️ API costs apply per extraction

---

## Architecture Highlights

### Processing Pipeline
```
Upload → OCR/Text Extraction → AI Analysis → 
Medical Data Extraction → Validation → Results
```

### Real-time Updates
- WebSocket connection for live processing status
- Real-time item counting
- Activity logging
- Progress visualization

### Secure API Key Management
- Client-side storage only
- No transmission to external servers
- Browser security best practices
- User-controlled settings

---

## Support

For detailed setup instructions, see [SETUP.md](./SETUP.md)

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2024

Made with ❤️ for the medical community


- Patient demographics (name, DOB, ID, age, gender)
- Medications (drug, dosage, frequency, duration)
- Diagnoses (condition, ICD code, severity)
- Lab results (test name, value, unit, status)
- Vital signs (BP, heart rate, etc.)

## 💡 Demo Mode

Works without OpenAI API key! Uses simulated AI extraction with realistic sample data.

## 🆘 Need Help?

Check **TROUBLESHOOTING.md** or **USER_GUIDE.md**
