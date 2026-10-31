@echo off
title FrameSense AI - Backend Server (FastAPI + RTX 3050 CUDA)

echo ==============================================================
echo        FrameSense AI - Real-Time AI Backend Engine
echo       FastAPI + MediaPipe + RTX 3050 CUDA NIMA Scoring
echo ==============================================================
echo.

:: 1. Navigate to repository root
cd /d "%~dp0"
set "ROOT_DIR=%~dp0"

:: If run from an outer unzipped folder, detect inner root
if not exist "%ROOT_DIR%backend\main.py" (
    if exist "%ROOT_DIR%FrameSense-AI-Real-Time-Pre-Capture-Composition-Repositioning-Engine-main\backend\main.py" (
        set "ROOT_DIR=%ROOT_DIR%FrameSense-AI-Real-Time-Pre-Capture-Composition-Repositioning-Engine-main\"
        cd /d "%ROOT_DIR%"
    )
)

echo [STATUS] Project Root: %ROOT_DIR%

:: 2. Locate or Auto-Create Python Virtual Environment
set "PYTHON_EXE=%ROOT_DIR%venv\Scripts\python.exe"

if not exist "%PYTHON_EXE%" (
    if exist "D:\FrameSense-AI\venv\Scripts\python.exe" (
        echo [INFO] Using virtual environment at D:\FrameSense-AI\venv
        set "PYTHON_EXE=D:\FrameSense-AI\venv\Scripts\python.exe"
    ) else (
        echo [INFO] Virtual environment not found in venv\
        echo [SETUP] Searching for installed Python to create venv...
        
        set "BASE_PY="
        if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe" (
            set "BASE_PY=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe"
        )
        if "%BASE_PY%"=="" where py >nul 2>nul && set "BASE_PY=py -3.11"
        if "%BASE_PY%"=="" where python >nul 2>nul && set "BASE_PY=python"
        
        if "%BASE_PY%"=="" (
            echo [ERROR] Python was not found on your system!
            echo Please install Python 3.11 from https://www.python.org/downloads/
            echo and ensure "Add python.exe to PATH" is checked during installation.
            pause
            exit /b 1
        )
        
        echo [SETUP] Creating virtual environment using %BASE_PY%...
        %BASE_PY% -m venv "%ROOT_DIR%venv"
        if not exist "%ROOT_DIR%venv\Scripts\python.exe" (
            echo [ERROR] Failed to create virtual environment!
            pause
            exit /b 1
        )
        set "PYTHON_EXE=%ROOT_DIR%venv\Scripts\python.exe"
        
        echo [SETUP] Installing dependencies from backend\requirements.txt...
        "%PYTHON_EXE%" -m pip install --upgrade pip -q
        "%PYTHON_EXE%" -m pip install -r "%ROOT_DIR%backend\requirements.txt"
        echo [SETUP] Python dependencies successfully installed.
    )
)

echo.
echo [STATUS] Using Python: %PYTHON_EXE%
"%PYTHON_EXE%" -c "import sys; print('         Python Version:', sys.version.split()[0])"
"%PYTHON_EXE%" -c "import torch; print('         PyTorch CUDA:', 'Available (' + torch.cuda.get_device_name(0) + ')' if torch.cuda.is_available() else 'CPU Mode')" 2>nul

echo.
echo ==============================================================
echo  Server URL : http://127.0.0.1:8000
echo  API Docs   : http://127.0.0.1:8000/docs
echo  WebSocket  : ws://127.0.0.1:8000/ws/live
echo ==============================================================
echo.
echo Starting Uvicorn Server (Press Ctrl+C to stop)...
echo.

cd /d "%ROOT_DIR%"
"%PYTHON_EXE%" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

if errorlevel 1 (
    echo.
    echo [ERROR] Backend server stopped unexpectedly with error code %errorlevel%.
    pause
)
