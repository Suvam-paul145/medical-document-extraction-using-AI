# Complete Setup Guide for Beginners

This guide will walk you through setting up the Medical Document Extraction System step by step.

## Prerequisites

Before starting, make sure you have:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Install with default settings

2. **A code editor** (optional but recommended)
   - VS Code: https://code.visualstudio.com/
   - Or any text editor you prefer

3. **Command Prompt access**
   - On Windows: Press `Win + R`, type `cmd`, press Enter

## Step-by-Step Installation

### Step 1: Verify Node.js Installation

Open Command Prompt and run:
```cmd
node --version
```

You should see something like `v18.x.x` or higher. If you get an error, Node.js is not installed correctly.

### Step 2: Install Dependencies

In your project folder, run:
```cmd
npm install
```

This will download all required packages. It may take 2-5 minutes.

**What if you see errors?**
- If you see "npm not found": Node.js is not installed correctly
- If you see "permission denied": Run Command Prompt as Administrator
- If installation fails: Delete the `node_modules` folder and try again

### Step 3: Create Environment File

1. Copy the example environment file:
   ```cmd
   copy .env.example .env
   ```

2. Open `.env` in a text editor

3. (Optional) Add your OpenAI API key:
   - Get a key from: https://platform.openai.com/api-keys
   - Replace `your_openai_api_key_here` with your actual key
   - **Note:** The system will work in demo mode without an API key

### Step 4: Create Uploads Folder

Create a folder for uploaded documents:
```cmd
mkdir uploads
```

### Step 5: Start the Application

Start both frontend and backend servers:
```cmd
npm run dev
```

**What you should see:**
- Backend server starting on port 5000
- Frontend server starting on port 3000
- Messages about compilation and server ready

**If you see errors:**
- "Port already in use": Another app is using port 3000 or 5000
  - Close other applications or change ports in `.env` and `vite.config.ts`
- "Cannot find module": Run `npm install` again

### Step 6: Open the Application

1. Open your web browser
2. Go to: http://localhost:3000
3. You should see the Medical Document Extraction interface

## Using the Application

### Upload a Document

1. **Drag and drop** a medical document (PDF, JPEG, or PNG) onto the upload area
   - OR click the upload area to browse for a file

2. **Wait for upload** - You'll see a progress bar

3. **Watch the processing** - The system will show:
   - Current processing stage
   - Progress percentage
   - Items being extracted in real-time

4. **View results** - Once complete, you'll see:
   - Patient information
   - Medications
   - Diagnoses
   - Lab results

5. **Export data** - Click export buttons to download:
   - JSON format (for developers)
   - CSV format (for Excel)
   - PDF format (for printing)

## Demo Mode (Without OpenAI API Key)

The system includes demo data that works without an API key:
- Upload any valid PDF/image file
- The system will simulate processing
- You'll see sample medical data extracted
- All features work normally

## Troubleshooting

### Problem: "npm install" fails

**Solution:**
1. Delete `node_modules` folder and `package-lock.json` file
2. Run `npm cache clean --force`
3. Run `npm install` again

### Problem: Servers won't start

**Solution:**
1. Check if ports 3000 and 5000 are available
2. Close other applications using these ports
3. Try running frontend and backend separately:
   ```cmd
   npm run dev:backend
   ```
   Then in another Command Prompt:
   ```cmd
   npm run dev:frontend
   ```

### Problem: Upload fails

**Solution:**
1. Check file size (must be under 10MB)
2. Check file type (only PDF, JPEG, PNG)
3. Make sure `uploads` folder exists
4. Check backend server is running

### Problem: No real-time updates

**Solution:**
1. Check browser console for WebSocket errors (F12 → Console tab)
2. Make sure backend server is running
3. Try refreshing the page

## Project Structure Explained

```
medical-document-extraction/
├── src/                      # Frontend code (React)
│   ├── components/          # UI components
│   │   ├── DocumentUpload.tsx    # Upload interface
│   │   ├── ProcessingView.tsx    # Processing animation
│   │   └── ResultsView.tsx       # Results display
│   ├── services/            # API and WebSocket
│   │   ├── api.ts          # HTTP requests
│   │   └── websocket.ts    # Real-time updates
│   ├── store/              # State management
│   │   └── documentStore.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
│
├── backend/                 # Backend code (Node.js)
│   ├── routes/             # API endpoints
│   │   ├── upload.js       # File upload
│   │   └── export.js       # Data export
│   ├── services/           # Business logic
│   │   ├── extraction.js   # AI extraction
│   │   ├── queue.js        # Job queue
│   │   ├── validation.js   # File validation
│   │   └── export.js       # Export functions
│   └── server.js           # Main server
│
├── uploads/                # Uploaded files (created automatically)
├── package.json            # Dependencies
├── .env                    # Configuration (you create this)
└── README.md              # Documentation
```

## Next Steps

1. **Test with sample documents**
   - Try uploading different types of medical documents
   - Check accuracy of extracted information

2. **Customize the system**
   - Modify extraction logic in `backend/services/extraction.js`
   - Adjust UI styling in component files
   - Add new data fields in `src/types/index.ts`

3. **Add real AI extraction**
   - Get OpenAI API key
   - Update `.env` file
   - Modify `extraction.js` to use real AI

4. **Deploy to production**
   - Build frontend: `npm run build`
   - Deploy backend to a server
   - Set up proper database (PostgreSQL)
   - Configure Redis for job queue

## Getting Help

If you're stuck:

1. **Check the console**
   - Backend: Look at Command Prompt where server is running
   - Frontend: Press F12 in browser → Console tab

2. **Common issues**
   - Most problems are solved by running `npm install` again
   - Make sure both servers are running
   - Check file permissions on `uploads` folder

3. **Read error messages carefully**
   - They usually tell you exactly what's wrong
   - Google the error message if unclear

## Tips for Beginners

- **Don't close Command Prompt** while using the app - servers need to keep running
- **Use Ctrl+C** in Command Prompt to stop servers
- **Refresh browser** (F5) if something looks broken
- **Check both servers** are running if features don't work
- **Start simple** - test with one small file first

## What Each Command Does

- `npm install` - Downloads all required packages
- `npm run dev` - Starts both frontend and backend
- `npm run dev:frontend` - Starts only frontend (port 3000)
- `npm run dev:backend` - Starts only backend (port 5000)
- `npm run build` - Creates production-ready files

## Understanding the Technology

- **React** - Creates the user interface
- **TypeScript** - Adds type safety to JavaScript
- **Node.js** - Runs the backend server
- **Express** - Handles HTTP requests
- **Socket.io** - Enables real-time updates
- **Framer Motion** - Creates smooth animations
- **TailwindCSS** - Styles the interface
- **Zustand** - Manages application state

You don't need to understand all of this to use the system, but it helps if you want to customize it!

## Success Checklist

- [ ] Node.js installed and verified
- [ ] Dependencies installed (`npm install` completed)
- [ ] `.env` file created
- [ ] `uploads` folder created
- [ ] Both servers start without errors
- [ ] Can access http://localhost:3000
- [ ] Can upload a test file
- [ ] See processing animation
- [ ] View extraction results
- [ ] Can export data

If all items are checked, you're ready to go! 🎉
