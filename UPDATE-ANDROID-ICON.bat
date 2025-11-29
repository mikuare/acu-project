@echo off
echo ============================================
echo UPDATE ANDROID ICON TO EARTH LOGO
echo ============================================
echo.
echo This will update your Android app icon to use
echo the earth logo (same as browser favicon).
echo.
echo Source: public/logo earth.png
echo Target: Android mipmap folders
echo.
pause

echo.
echo ============================================
echo STEP 1: Syncing Icons with Capacitor
echo ============================================
echo.
echo Capacitor will automatically sync your earth logo
echo from the PWA manifest to Android...
echo.

cmd /c "npx cap sync android"

if errorlevel 1 (
    echo.
    echo [WARNING] Sync had issues, but continuing...
    echo.
) else (
    echo.
    echo [OK] Icons synced!
    echo.
)

echo ============================================
echo STEP 2: Verifying Icon Files
echo ============================================
echo.

if exist "android\app\src\main\res\mipmap-mdpi\ic_launcher.png" (
    echo [OK] mipmap-mdpi icons found
) else (
    echo [WARNING] mipmap-mdpi icons not found
)

if exist "android\app\src\main\res\mipmap-hdpi\ic_launcher.png" (
    echo [OK] mipmap-hdpi icons found
) else (
    echo [WARNING] mipmap-hdpi icons not found
)

if exist "android\app\src\main\res\mipmap-xhdpi\ic_launcher.png" (
    echo [OK] mipmap-xhdpi icons found
) else (
    echo [WARNING] mipmap-xhdpi icons not found
)

if exist "android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png" (
    echo [OK] mipmap-xxhdpi icons found
) else (
    echo [WARNING] mipmap-xxhdpi icons not found
)

if exist "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png" (
    echo [OK] mipmap-xxxhdpi icons found
) else (
    echo [WARNING] mipmap-xxxhdpi icons not found
)

echo.
echo ============================================
echo STEP 3: Building APK with New Icon
echo ============================================
echo.
echo Now building APK with earth logo icon...
echo This takes 5-10 minutes...
echo.
pause

cd android
cmd /c "gradlew clean assembleRelease"
set BUILD_RESULT=%errorlevel%
cd ..

if %BUILD_RESULT% neq 0 (
    echo.
    echo [ERROR] Build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo [SUCCESS] APK BUILT WITH EARTH LOGO! 🌍
echo ============================================
echo.

set APK_FILE=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_FILE%" (
    echo Your APK with earth logo icon is ready!
    echo.
    echo File: %APK_FILE%
    echo.
    echo ============================================
    echo INSTALLATION:
    echo ============================================
    echo.
    echo 1. Transfer APK to your Android device
    echo 2. Install it
    echo 3. Check app drawer for:
    echo.
    echo    ┌──────┐
    echo    │  🌍  │  QMAZ Project Map
    echo    └──────┘
    echo.
    echo 4. The icon should show the earth logo!
    echo.
    echo ============================================
    echo NOTE:
    echo ============================================
    echo.
    echo If you still see the old icon after installing:
    echo.
    echo 1. Completely uninstall the old app
    echo 2. Restart your device
    echo 3. Install the new APK
    echo 4. Icon should update!
    echo.
    echo Android sometimes caches launcher icons,
    echo so a restart helps refresh them.
    echo.
    echo ============================================
    echo.
    
    echo Opening APK folder...
    explorer "%CD%\android\app\build\outputs\apk\release"
    
) else (
    echo [ERROR] APK not found!
)

pause

