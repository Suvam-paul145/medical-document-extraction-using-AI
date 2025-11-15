@echo off
echo ========================================
echo Medical Document Extraction System
echo ========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    echo This may take a few minutes...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

REM Check if .env exists (optional - not required for demo)
if not exist ".env" (
    echo Note: .env file not found. Demo mode will work without it.
    echo To use OpenAI API, create a .env file with OPENAI_API_KEY=your_key
    echo.
)

REM Create uploads folder if it doesn't exist
if not exist "uploads\" (
    echo Creating uploads folder...
    mkdir uploads
    echo.
)

echo ========================================
echo Starting servers...
echo ========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press Ctrl+C to stop the servers
echo ========================================
echo.

REM Start the application
npm run dev
