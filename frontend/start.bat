@echo off
echo 🚀 Starting Innovate UK Chatbot Frontend
echo ================================================

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Error installing dependencies
    pause
    exit /b 1
)

echo Starting development server...
call npm run dev

pause
