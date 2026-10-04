@echo off
title FrameSense AI - Live Frontend (Next.js 16 + Cyberpunk HUD)
cd /d "%~dp0frontend"
echo ==============================================================
echo        Starting FrameSense AI Live Frontend
echo       http://localhost:3000 (Connecting to Port 8000)
echo ==============================================================
echo.

if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    npm install
)

echo Starting Next.js Dev Server...
npm run dev

pause
