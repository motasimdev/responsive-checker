@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install || goto :fail
)
echo Starting Responsive Preview on http://localhost:5199
call npm run dev
goto :eof

:fail
echo.
echo Install failed. Make sure Node.js 18+ is installed: https://nodejs.org
pause
