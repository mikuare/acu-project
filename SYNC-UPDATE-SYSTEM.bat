@echo off
echo ============================================
echo  SYNC UPDATE SYSTEM WITH ANDROID
echo ============================================
echo.
echo Syncing @capacitor/browser with Android project...
echo.

cd /d "%~dp0"

echo Running Capacitor sync...
call node_modules\.bin\cap.cmd sync android

if errorlevel 1 (
    echo.
    echo [ERROR] Sync failed!
    echo.
    echo Trying alternative method...
    call npx @capacitor/cli sync android
)

if errorlevel 1 (
    echo.
    echo [ERROR] Both sync methods failed!
    echo.
    echo Please try manually:
    echo   npm run build
    echo   npx cap sync android
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo  SYNC COMPLETE!
echo ============================================
echo.
echo ✅ Update system is ready!
echo.
echo Next steps:
echo 1. Read: UPDATE-SYSTEM-QUICK-START.txt
echo 2. Create GitHub repository for updates
echo 3. Build your next APK with updated version codes
echo.
pause

