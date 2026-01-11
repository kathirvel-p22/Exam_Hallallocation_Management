@echo off
REM Exam Seat Allocation Management System - Windows Launcher
REM 
REM This batch file provides an easy way to start the development server on Windows.
REM It automatically detects PHP installation and provides a user-friendly interface.

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║      Exam Seat Allocation Management System - Launcher       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if PHP is installed
where php >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PHP is not installed or not in PATH
    echo.
    echo Please install PHP and make sure it's added to your system PATH.
    echo You can download PHP from: https://www.php.net/downloads.php
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

REM Change to project directory
cd /d "%~dp0\.."

REM Check if we're in the right directory
if not exist "config/database.php" (
    echo ❌ Configuration files not found
    echo.
    echo Please run this script from the project root directory.
    echo Current directory: %CD%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo ✅ PHP installation found
echo 📁 Project directory: %CD%
echo.

REM Show menu
:menu
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        Main Menu                             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo [1] Start Development Server (Port 8000)
echo [2] Start Demo Mode
echo [3] Run Health Check
echo [4] System Setup
echo [5] Check Server Status
echo [6] Custom Server Options
echo [7] Help
echo [0] Exit
echo.
set /p choice="Please select an option (0-7): "

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto start_demo
if "%choice%"=="3" goto health_check
if "%choice%"=="4" goto setup
if "%choice%"=="5" goto status
if "%choice%"=="6" goto custom_options
if "%choice%"=="7" goto help
if "%choice%"=="0" goto exit
if "%choice%"=="" goto menu

echo ❌ Invalid option. Please try again.
echo.
goto menu

:start_server
echo.
echo 🚀 Starting Development Server...
echo ──────────────────────────────────────
php server/start_server.php
goto end

:start_demo
echo.
echo 🎭 Starting Demo Mode...
echo ──────────────────────────────────────
php server/start_server.php --demo
goto end

:health_check
echo.
echo 🏥 Running Health Check...
echo ──────────────────────────────────────
php server/health_check.php --verbose
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:setup
echo.
echo ⚙️  Running System Setup...
echo ──────────────────────────────────────
php server/cli_manager.php setup
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:status
echo.
echo 📊 Checking Server Status...
echo ──────────────────────────────────────
php server/cli_manager.php status
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:custom_options
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    Custom Options                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
set /p port="Port (default: 8000): "
set /p host="Host (default: localhost): "
set /p verbose="Enable verbose output? (y/n): "

set "args="
if not "%port%"=="" set "args=%args% --port %port%"
if not "%host%"=="" set "args=%args% --host %host%"
if /i "%verbose%"=="y" set "args=%args% --verbose"

echo.
echo 🚀 Starting Server with Custom Options...
echo ──────────────────────────────────────
php server/start_server.php %args%
goto end

:help
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                           Help                               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo This launcher provides easy access to the Exam Seat Allocation
echo Management System development server.
echo.
echo Available Options:
echo   • Start Development Server - Launches the server on port 8000
echo   • Start Demo Mode - Launches server with sample data
echo   • Run Health Check - Verifies system components
echo   • System Setup - Configures database and dependencies
echo   • Check Server Status - Shows current server and database status
echo   • Custom Server Options - Advanced server configuration
echo   • Help - Shows this help message
echo.
echo Requirements:
echo   • PHP 7.4 or higher installed and in PATH
echo   • Project files in the current directory
echo.
echo After starting the server:
echo   • Open your browser to http://localhost:8000
echo   • Use Ctrl+C to stop the server
echo   • Return to this menu by pressing any key
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:exit
echo.
echo 👋 Goodbye!
echo.
exit /b 0

:end
echo.
echo Server stopped.
echo.
echo Press any key to return to menu...
pause >nul
goto menu

REM Error handling
:error
echo.
echo ❌ An error occurred. Please check the error message above.
echo.
echo Press any key to return to menu...
pause >nul
goto menu