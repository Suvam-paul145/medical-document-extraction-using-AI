#!/usr/bin/env powershell
# Quick Start Guide - MedExtract

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MedExtract - Medical Document AI" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install from nodejs.org" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Quick Start Instructions:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Install Dependencies" -ForegroundColor Yellow
Write-Host "   npm install" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Start Development Server" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "   - Backend: http://localhost:5000" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Configure OpenAI API Key" -ForegroundColor Yellow
Write-Host "   1. Click Settings (⚙️) in header" -ForegroundColor Gray
Write-Host "   2. Enter OpenAI API key (from platform.openai.com)" -ForegroundColor Gray
Write-Host "   3. Click 'Save API Key'" -ForegroundColor Gray
Write-Host "   4. Verify 'API Active' status" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Upload Medical Document" -ForegroundColor Yellow
Write-Host "   - Drag & drop or click to browse" -ForegroundColor Gray
Write-Host "   - Supported: PDF, JPEG, PNG (max 10MB)" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Monitor Processing" -ForegroundColor Yellow
Write-Host "   - Watch real-time status updates" -ForegroundColor Gray
Write-Host "   - View extracted medical data" -ForegroundColor Gray
Write-Host "   - Export results in preferred format" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Other Useful Commands:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Development:" -ForegroundColor Yellow
Write-Host "  npm run dev           # Run frontend + backend" -ForegroundColor Gray
Write-Host "  npm run dev:frontend  # Frontend only (port 5173)" -ForegroundColor Gray
Write-Host "  npm run dev:backend   # Backend only (port 5000)" -ForegroundColor Gray
Write-Host ""

Write-Host "Build & Deploy:" -ForegroundColor Yellow
Write-Host "  npm run build         # Build for production" -ForegroundColor Gray
Write-Host "  npm run preview       # Preview production build" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  README.md             # Project overview" -ForegroundColor Gray
Write-Host "  SETUP.md              # Detailed setup guide" -ForegroundColor Gray
Write-Host "  PROJECT_SUMMARY.md    # Complete transformation summary" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Getting Your OpenAI API Key:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Visit: https://platform.openai.com/api-keys" -ForegroundColor Gray
Write-Host "2. Sign in or create account" -ForegroundColor Gray
Write-Host "3. Click '+ Create new secret key'" -ForegroundColor Gray
Write-Host "4. Copy the key (starts with 'sk-')" -ForegroundColor Gray
Write-Host "5. Paste into Settings modal in MedExtract" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Structure:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "src/                   # Frontend source" -ForegroundColor Gray
Write-Host "  ├── components/      # React components" -ForegroundColor Gray
Write-Host "  ├── services/        # API & WebSocket" -ForegroundColor Gray
Write-Host "  ├── store/           # State management" -ForegroundColor Gray
Write-Host "  └── types/           # TypeScript types" -ForegroundColor Gray
Write-Host ""
Write-Host "backend/               # Backend source" -ForegroundColor Gray
Write-Host "  ├── routes/          # API endpoints" -ForegroundColor Gray
Write-Host "  └── services/        # Business logic" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Key Features:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Beautiful medical-themed UI" -ForegroundColor Green
Write-Host "✓ Real-time processing updates" -ForegroundColor Green
Write-Host "✓ AI-powered medical data extraction" -ForegroundColor Green
Write-Host "✓ Multiple export formats (JSON, CSV)" -ForegroundColor Green
Write-Host "✓ Secure API key management" -ForegroundColor Green
Write-Host "✓ OCR for scanned documents" -ForegroundColor Green
Write-Host "✓ Confidence scoring" -ForegroundColor Green
Write-Host "✓ Professional animations" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Need Help?" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "See SETUP.md for:" -ForegroundColor Yellow
Write-Host "  - Detailed installation instructions" -ForegroundColor Gray
Write-Host "  - API key configuration guide" -ForegroundColor Gray
Write-Host "  - Troubleshooting section" -ForegroundColor Gray
Write-Host "  - Architecture overview" -ForegroundColor Gray
Write-Host "  - FAQ and best practices" -ForegroundColor Gray
Write-Host ""

Write-Host "Ready to get started? Run:" -ForegroundColor Green
Write-Host "  npm install && npm run dev" -ForegroundColor Cyan
Write-Host ""
