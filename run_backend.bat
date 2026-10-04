@echo off
title FrameSense AI - Backend Server (FastAPI + RTX 3050 CUDA)
cd /d "%~dp0"
echo ==============================================================
echo        Starting FrameSense AI Backend Server
echo    Dual-Brain Architecture: MediaPipe + RTX 3050 CUDA NIMA
echo ==============================================================
echo.

if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in venv\
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Starting Uvicorn on http://127.0.0.1:8000 ...
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

pause
