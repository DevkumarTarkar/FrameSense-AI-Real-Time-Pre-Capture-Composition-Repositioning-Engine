@echo off
title FrameSense AI - Live Frontend (Next.js 16)

echo ==============================================================
echo        FrameSense AI - Next.js 16 Web Application
echo       http://localhost:3000 - Connecting to Port 8000
echo ==============================================================
echo.

:: 1. Navigate to repository root, then frontend folder
cd /d "%~dp0"
set "FRONTEND_DIR=%~dp0frontend"
if not exist "%FRONTEND_DIR%\package.json" (
    if exist "%~dp0package.json" (
        set "FRONTEND_DIR=%~dp0"
    ) else if exist "%~dp0FrameSense-AI-Real-Time-Pre-Capture-Composition-Repositioning-Engine-main\frontend\package.json" (
        set "FRONTEND_DIR=%~dp0FrameSense-AI-Real-Time-Pre-Capture-Composition-Repositioning-Engine-main\frontend"
    ) else if exist "D:\FrameSense-AI\frontend\package.json" (
        set "FRONTEND_DIR=D:\FrameSense-AI\frontend"
    ) else (
        echo [ERROR] Could not find frontend package.json!
        pause
        exit /b 1
    )
)

cd /d "%FRONTEND_DIR%"
echo [STATUS] Working in: %FRONTEND_DIR%

:: 2. Ensure Node.js and npm are accessible
where node >nul 2>nul
if errorlevel 1 (
    if exist "D:\Node js\node.exe" set "PATH=D:\Node js;%PATH%"
    if exist "C:\Program Files\nodejs\node.exe" set "PATH=C:\Program Files\nodejs;%PATH%"
)

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js was not found in PATH!
    echo Please install Node.js 18 or higher from https://nodejs.org/
    pause
    exit /b 1
)

:: 3. Detect package manager (pnpm or npm)
set "PKG_MGR="
where pnpm >nul 2>nul && set "PKG_MGR=pnpm"
if "%PKG_MGR%"=="" where npm >nul 2>nul && set "PKG_MGR=npm"

if "%PKG_MGR%"=="" (
    if exist "D:\Node js\npm.cmd" (
        set "PKG_MGR=npm"
        set "PATH=D:\Node js;%PATH%"
    ) else (
        echo [ERROR] npm was not found! Please reinstall Node.js.
        pause
        exit /b 1
    )
)

echo [STATUS] Node Version:
call node -v
echo [STATUS] Package Manager: %PKG_MGR%
echo.

:: 4. Install dependencies if node_modules missing
if not exist "%FRONTEND_DIR%\node_modules\" (
    echo [INFO] node_modules not found. Installing frontend dependencies...
    if "%PKG_MGR%"=="pnpm" (
        call pnpm install --dir "%FRONTEND_DIR%"
    ) else (
        call npm install --prefix "%FRONTEND_DIR%"
    )
    if errorlevel 1 (
        echo [ERROR] Dependency installation failed!
        pause
        exit /b 1
    )
)

:: 5. Launch Next.js dev server
echo.
echo ==============================================================
echo  Opening FrameSense AI at: http://localhost:3000
echo ==============================================================
echo.

if "%PKG_MGR%"=="pnpm" (
    call pnpm dev --dir "%FRONTEND_DIR%"
) else (
    call npm run dev --prefix "%FRONTEND_DIR%"
)

if errorlevel 1 (
    echo.
    echo [ERROR] Next.js dev server stopped with error code %errorlevel%.
    pause
)
