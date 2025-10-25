@echo off
echo ============================================
echo Installing Capacitor Permission Plugins
echo ============================================
echo.
echo This will install:
echo - @capacitor/geolocation (Location permissions)
echo - @capacitor/camera (Camera permissions)
echo.
echo These plugins enable proper permission handling
echo in your Android APK.
echo.
pause

echo.
echo Installing packages...
echo.

cmd /c "npm install"

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo [SUCCESS] Packages Installed!
echo ============================================
echo.
echo What was installed:
echo ✓ @capacitor/geolocation ^6.0.1
echo ✓ @capacitor/camera ^6.0.2
echo.
echo What was added:
echo ✓ Android permissions in AndroidManifest.xml
echo ✓ Permission utilities in src/utils/permissions.ts
echo ✓ Updated map component for proper permission requests
echo.
echo ============================================
echo NEXT STEP:
echo ============================================
echo.
echo Rebuild your APK with permissions enabled:
echo.
echo Run: BUILD-APK-WITH-PERMISSIONS.bat
echo.
pause

