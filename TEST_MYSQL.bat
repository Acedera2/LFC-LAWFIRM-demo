REM MySQL Connection Test and Setup - Windows

@echo off
REM Check Node version
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VER=%%i
if "%NODE_VER%"=="" (
    echo ❌ Node.js not found! Please install Node.js 20.11.0+
    pause
    exit /b 1
)
echo ✓ Node.js version: %NODE_VER%

REM Test each common MySQL password
echo.
echo Testing MySQL connections...
echo.

setlocal enabledelayedexpansion

REM Try different common credentials
set passwords=
set passwords=!passwords! ""
set passwords=!passwords! "root"
set passwords=!passwords! "password"  
set passwords=!passwords! "admin"
set passwords=!passwords! "123456"
set passwords=!passwords! "password123"
set passwords=!passwords! "Admin@123"

for %%P in (%passwords%) do (
    echo Testing: root / %%P
    mysql -u root -p%%P -e "SELECT VERSION();" 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo.
        echo ✅ SUCCESS! MySQL credentials are: root / %%P
        echo.
        echo Update your .env file with:
        echo DATABASE_URL="mysql://root:%%P@localhost:3306/legal_field_consultancy"
        echo.
        pause
        exit /b 0
    )
)

echo.
echo ❌ None of the standard passwords worked.
echo.
echo Options:
echo 1. Your MySQL password is different (check MySQL installation notes)
echo 2. MySQL isn't running (run: net start MySQL80)
echo 3. MySQL isn't installed (download from mysql.com)
echo.
echo To reset MySQL root password:
echo   1. net stop MySQL80
echo   2. mysqld --skip-grant-tables
echo   3. (in new window) mysql -u root
echo   4. Run: FLUSH PRIVILEGES;
echo   5. Run: ALTER USER 'root'@'localhost' IDENTIFIED BY 'Admin@123';
echo   6. Exit and restart MySQL: net start MySQL80
echo.
pause
