@echo off
REM PHP Windows Requirements Checker
REM This batch script checks if your Windows system meets the requirements for PHP development
REM Author: PHP Installation Guide
REM Version: 1.0

echo.
echo ================================================
echo  PHP Windows Requirements Checker
echo ================================================
echo.

REM Set colors for output
if exist "%SystemRoot%\System32\color.exe" (
    color 07
)

REM Check Windows version
echo Checking Windows version...
ver > temp_version.txt
set /p WINVER=<temp_version.txt
echo Windows Version: %WINVER%
del temp_version.txt

REM Check system architecture
echo.
echo Checking system architecture...
if "%PROCESSOR_ARCHITECTURE%"=="x86" (
    if "%PROCESSOR_ARCHITEW6432%"=="AMD64" (
        echo Architecture: 64-bit (x64)
        set ARCH=x64
    ) else (
        echo Architecture: 32-bit (x86)
        set ARCH=x86
    )
) else (
    echo Architecture: 64-bit (x64)
    set ARCH=x64
)

REM Check available disk space
echo.
echo Checking disk space...
for /f "tokens=3" %%a in ('dir /-c C: ^| find "bytes free"') do set FREESPACE=%%a
echo Free space on C: drive: %FREESPACE%

REM Convert bytes to GB for easier reading
set /a FREESPACE_GB=%FREESPACE:~0,-9%
echo Free space: %FREESPACE_GB% GB

if %FREESPACE_GB% LSS 5 (
    echo WARNING: Less than 5 GB free space. Recommended: 10 GB or more.
) else (
    echo OK: Sufficient disk space available.
)

REM Check RAM
echo.
echo Checking RAM...
for /f "skip=1 tokens=*" %%a in ('wmic computersystem get TotalPhysicalMemory /value') do (
    if not "%%a"=="" (
        for /f "tokens=2 delims==" %%b in ("%%a") do set RAMBYTES=%%b
    )
)

if defined RAMBYTES (
    set /a RAMGB=%RAMBYTES%/1024/1024/1024
    echo Total RAM: %RAMGB% GB
    
    if %RAMGB% LSS 2 (
        echo WARNING: Less than 2 GB RAM. Recommended: 4 GB or more.
    ) else (
        echo OK: Sufficient RAM available.
    )
) else (
    echo Unable to determine RAM size.
)

REM Check if PHP is already installed
echo.
echo Checking for existing PHP installation...
where php >nul 2>&1
if %ERRORLEVEL%==0 (
    echo PHP is already installed:
    php -v
) else (
    echo PHP is not installed or not in PATH.
    echo You will need to install PHP.
)

REM Check if Apache is running
echo.
echo Checking for Apache web server...
sc query apache2.4 >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Apache 2.4 service found.
    sc query apache2.4 | find "RUNNING" >nul
    if %ERRORLEVEL%==0 (
        echo Apache is running.
    ) else (
        echo Apache is installed but not running.
    )
) else (
    sc query apache2.2 >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo Apache 2.2 service found.
        sc query apache2.2 | find "RUNNING" >nul
        if %ERRORLEVEL%==0 (
            echo Apache is running.
        ) else (
            echo Apache is installed but not running.
        )
    ) else (
        echo No Apache service found.
        echo You will need to install a web server (Apache, Nginx, or IIS).
    )
)

REM Check if MySQL is running
echo.
echo Checking for MySQL database...
sc query mysql >nul 2>&1
if %ERRORLEVEL%==0 (
    echo MySQL service found.
    sc query mysql | find "RUNNING" >nul
    if %ERRORLEVEL%==0 (
        echo MySQL is running.
    ) else (
        echo MySQL is installed but not running.
    )
) else (
    echo No MySQL service found.
    echo You will need to install a database server.
)

REM Check for Visual Studio Code
echo.
echo Checking for Visual Studio Code...
if exist "%USERPROFILE%\AppData\Local\Programs\Microsoft VS Code\Code.exe" (
    echo Visual Studio Code is installed.
) else if exist "%ProgramFiles%\Microsoft VS Code\Code.exe" (
    echo Visual Studio Code is installed.
) else if exist "%ProgramFiles(x86)%\Microsoft VS Code\Code.exe" (
    echo Visual Studio Code is installed.
) else (
    echo Visual Studio Code is not installed.
    echo You will need to install a code editor.
)

REM Check for Git
echo.
echo Checking for Git...
where git >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Git is installed:
    git --version
) else (
    echo Git is not installed or not in PATH.
    echo You will need to install Git for version control.
)

REM Check for required ports
echo.
echo Checking for port availability...
echo Checking port 80 (HTTP)...
netstat -ano | findstr :80 >nul
if %ERRORLEVEL%==0 (
    echo WARNING: Port 80 is in use. This may conflict with Apache.
    echo Processes using port 80:
    netstat -ano | findstr :80
) else (
    echo OK: Port 80 is available.
)

echo.
echo Checking port 3306 (MySQL)...
netstat -ano | findstr :3306 >nul
if %ERRORLEVEL%==0 (
    echo WARNING: Port 3306 is in use. This may conflict with MySQL.
    echo Processes using port 3306:
    netstat -ano | findstr :3306
) else (
    echo OK: Port 3306 is available.
)

REM Check for .NET Framework (required for some PHP extensions)
echo.
echo Checking for .NET Framework...
reg query "HKLM\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" /v Release >nul 2>&1
if %ERRORLEVEL%==0 (
    for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" /v Release') do set DOTNETVER=%%a
    if %DOTNETVER% GEQ 528040 (
        echo .NET Framework 4.8 or later is installed.
    ) else if %DOTNETVER% GEQ 461808 (
        echo .NET Framework 4.7.2 is installed.
    ) else if %DOTNETVER% GEQ 461308 (
        echo .NET Framework 4.7.1 is installed.
    ) else if %DOTNETVER% GEQ 460798 (
        echo .NET Framework 4.7 is installed.
    ) else (
        echo WARNING: .NET Framework version may be too old. Some PHP features may not work.
    )
) else (
    echo .NET Framework 4.x not found. Some PHP features may not work.
)

REM Summary
echo.
echo ================================================
echo  SUMMARY
echo ================================================
echo.

echo Your system appears to be ready for PHP development.
echo.
echo RECOMMENDED INSTALLATION METHOD:
echo 1. Download and install XAMPP from https://www.apachefriends.org/
echo 2. This will install Apache, MySQL, PHP, and phpMyAdmin in one package.
echo 3. After installation, start Apache and MySQL from the XAMPP Control Panel.
echo 4. Test your installation by visiting http://localhost in your browser.
echo.
echo ALTERNATIVE METHODS:
echo - WAMP Server: Alternative to XAMPP for Windows
echo - Manual Installation: Install each component separately
echo.
echo NEXT STEPS:
echo 1. Install XAMPP or your preferred PHP stack
echo 2. Install Visual Studio Code for coding
echo 3. Install Git for version control
echo 4. Follow the installation guide for detailed instructions
echo.
echo For more information, see:
echo - php_installation_guide.md
echo - troubleshooting_guide.md
echo.

pause