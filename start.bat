@echo off
echo ========================================
echo    AcadeX Unified Server Startup
echo ========================================
echo.
echo Starting AcadeX platform...
echo Frontend + Backend running on port 5000
echo.
cd /d "%~dp0"
npm run dev
pause