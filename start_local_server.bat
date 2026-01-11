@echo off
echo ╔══════════════════════════════════════════════════════════════╗
echo ║      Exam Seat Allocation Management System - Local Server   ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Starting Local Development Server...
echo.
echo Note: This will start a basic PHP server without MySQL.
echo You can view the interface but database features will be limited.
echo.
echo To stop the server, press Ctrl+C
echo.
echo Starting server on http://localhost:8000...
echo.
cd /d "%~dp0"
php -S localhost:8000 -t public
echo.
echo Server stopped.
echo.
echo Press any key to exit...
pause >nul