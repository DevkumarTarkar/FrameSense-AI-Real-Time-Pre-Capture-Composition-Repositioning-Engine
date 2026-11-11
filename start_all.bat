@echo off
echo ===================================================
echo   FrameSense AI - One-Click Launcher
echo ===================================================
echo Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "FrameSense AI - Backend" cmd /k "cd /d D:\FrameSense-AI && call venv\Scripts\activate.bat && set PYTHONPATH=D:\FrameSense-AI && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend (Next.js on http://localhost:3000)...
start "FrameSense AI - Frontend" cmd /k "cd /d D:\FrameSense-AI\frontend && npm run dev"

echo.
echo ===================================================
echo   Both services are launching in separate windows!
echo   Once loaded, open: http://localhost:3000/live
echo ===================================================
timeout /t 5
