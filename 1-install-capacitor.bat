@echo off
echo ============================================
echo Installing Capacitor for Android
echo ============================================
echo.

echo Step 1: Installing Capacitor Core and CLI...
call npm install @capacitor/core @capacitor/cli

echo.
echo Step 2: Installing Capacitor Android...
call npm install @capacitor/android

echo.
echo Step 3: Installing additional dependencies...
call npm install @capacitor/app @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen

echo.
echo ============================================
echo Capacitor Installation Complete!
echo ============================================
echo.
echo Next step: Run 2-setup-capacitor.bat
echo.
pause

