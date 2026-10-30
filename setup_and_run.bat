@echo off
title FrameSense AI - One-Click Setup & Launch
cd /d "%~dp0"
echo ==============================================================
echo        FrameSense AI - One-Click Setup Script
echo    Dual-Brain Architecture: MediaPipe + RTX 3050 CUDA NIMA
echo ==============================================================
echo.

:: Step 1: Create venv if not exists
if not exist "venv\Scripts\python.exe" (
    echo [SETUP] Creating Python 3.11 virtual environment...
    python -m venv venv
    echo [SETUP] Virtual environment created.
) else (
    echo [SETUP] Virtual environment already exists.
)
echo.

:: Step 2: Activate venv
call venv\Scripts\activate.bat

:: Step 3: Upgrade pip
echo [SETUP] Upgrading pip...
python -m pip install --upgrade pip --timeout 120 -q

:: Step 4: Install backend dependencies
echo [SETUP] Installing backend dependencies...
pip install -r backend\requirements.txt --timeout 120
echo.

:: Step 5: Install mediapipe separately (avoids resolver conflicts)
echo [SETUP] Installing MediaPipe Face Detection...
pip install mediapipe>=0.10.14 --timeout 120
echo.

:: Step 6: Install PyTorch with CUDA support for RTX 3050
echo [SETUP] Installing PyTorch with CUDA 12.4 for RTX 3050 GPU...
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124 --timeout 300
echo.

:: Step 7: Install PyIQA (NIMA neural aesthetic scoring)
echo [SETUP] Installing PyIQA NIMA metric...
pip install pyiqa --timeout 120
echo.

:: Step 8: Install frontend dependencies
echo [SETUP] Installing frontend dependencies...
cd frontend
if not exist "node_modules\" (
    call pnpm install --no-frozen-lockfile
) else (
    echo [SETUP] Frontend node_modules already exists.
)
cd ..
echo.

:: Step 9: Run unit tests
echo [VERIFY] Running AI Engine unit tests...
python -m pytest ai_engine/tests -v
echo.

:: Step 10: Verify GPU detection
echo [VERIFY] Checking GPU/CUDA availability...
python -c "import torch; print('PyTorch:', torch.__version__); print('CUDA Available:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU mode')"
echo.

echo ==============================================================
echo        SETUP COMPLETE! Now choose what to launch:
echo ==============================================================
echo.
echo   [1] Start Backend Only    (FastAPI on port 8000)
echo   [2] Start Frontend Only   (Next.js on port 3000)
echo   [3] Start BOTH            (Backend + Frontend)
echo   [4] Exit
echo.
set /p choice="Enter choice (1/2/3/4): "

if "%choice%"=="1" goto backend_only
if "%choice%"=="2" goto frontend_only
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end

:backend_only
echo Starting Backend Server...
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload --reload-dir backend
goto end

:frontend_only
cd frontend
pnpm dev
goto end

:both
echo Starting Backend Server in background...
start "FrameSense Backend" cmd /c "call venv\Scripts\activate.bat && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload --reload-dir backend"
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul
echo Starting Frontend Server...
cd frontend
pnpm dev
goto end

:end
echo.
echo FrameSense AI session ended.
pause
