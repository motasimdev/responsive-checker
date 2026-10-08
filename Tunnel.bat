@echo off
rem Optional helper: starts a Cloudflare Quick Tunnel to your local website.
rem Start your website first (npm run dev), then run this in a second window.
set PORT=5173
set /p PORT=Local port of your website (default 5173):
where cloudflared >nul 2>nul
if errorlevel 1 (
  echo.
  echo cloudflared was not found. Install it with:
  echo   winget install --id Cloudflare.cloudflared
  echo Then close this window and run Tunnel.bat again.
  pause
  exit /b 1
)
echo.
echo Starting tunnel to http://localhost:%PORT%
echo Copy the https://....trycloudflare.com address below into Responsive Preview.
echo Keep this window open while you preview.
echo.
cloudflared tunnel --url http://localhost:%PORT%
pause
