@echo off
cd /d "%~dp0"
if not exist node_modules (
  call npm install || goto :fail
)
call npm run build || goto :fail
echo.
echo Build complete. Output is in the dist folder.
pause
goto :eof

:fail
echo.
echo Build failed. See the messages above.
pause
