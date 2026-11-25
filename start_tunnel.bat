@echo off
echo ===================================================
echo   FrameSense AI - Instant Public HTTPS / WSS Tunnel
echo ===================================================
echo This creates an instant public HTTPS/WSS link so you can
echo test on mobile browsers with camera permission enabled.
echo.
echo Make sure start_all.bat is ALREADY running before this!
echo.
pause

echo Starting Cloudflare Tunnel for Frontend (Port 3000)...
start "FrameSense Tunnel - Frontend (HTTPS)" cmd /k "npx --yes localtunnel --port 3000 --subdomain framesense-studio"

echo Starting Cloudflare Tunnel for Backend (Port 8000)...
start "FrameSense Tunnel - Backend (HTTPS/WSS)" cmd /k "npx --yes localtunnel --port 8000 --subdomain framesense-api"

echo.
echo ===================================================
echo   Public HTTPS / WSS URLs are starting!
echo   Frontend: https://framesense-studio.loca.lt
echo   Backend:  https://framesense-api.loca.lt
echo ===================================================
