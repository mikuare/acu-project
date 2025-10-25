@echo off
echo ============================================
echo REBUILD APK WITH MAPBOX TOKEN
echo ============================================
echo.
echo This will rebuild your APK with the
echo Mapbox token included.
echo.
echo Make sure you already added your token to:
echo src\config\mapbox.ts
echo.
pause

echo.
echo ============================================
echo STEP 1: Building Web App
echo ============================================
echo.
echo Building with Mapbox token...
echo.

cmd /c "npm run build"

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    echo.
    echo Possible reasons:
    echo 1. Syntax error in mapbox.ts
    echo 2. Token format incorrect
    echo.
    echo Please check src\config\mapbox.ts
    echo Make sure it looks like:
    echo export const MAPBOX_TOKEN = 'pk.eyJ1abc123...';
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Web app built successfully!
echo.

echo ============================================
echo STEP 2: Syncing to Android
echo ============================================
echo.

cmd /c "npx cap sync android"

if errorlevel 1 (
    echo.
    echo [ERROR] Sync failed!
    pause
    exit /b 1
)

echo.
echo [OK] Synced successfully!
echo.

echo ============================================
echo STEP 3: Building Signed APK
echo ============================================
echo.
echo Building signed APK with Mapbox...
echo This takes 5-10 minutes...
echo.

cd android
cmd /c "gradlew clean assembleRelease"
set BUILD_RESULT=%errorlevel%
cd ..

if %BUILD_RESULT% neq 0 (
    echo.
    echo [ERROR] APK build failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo [SUCCESS] APK BUILT WITH MAPBOX!
echo ============================================
echo.

set APK_FILE=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_FILE%" (
    echo Your signed APK with Mapbox is ready! 🗺️
    echo.
    echo Location: %APK_FILE%
    echo.
    
    echo ============================================
    echo WHAT'S INCLUDED:
    echo ============================================
    echo.
    echo ✓ Mapbox token (map will show!)
    echo ✓ Properly signed
    echo ✓ All project data
    echo ✓ Ready to install on Android
    echo.
    echo ============================================
    echo TESTING:
    echo ============================================
    echo.
    echo 1. Install this APK on your Android device
    echo 2. Open the app
    echo 3. You should now see the map with markers!
    echo.
    echo If the map still doesn't show:
    echo - Check if you copied the full token
    echo - Make sure token starts with "pk."
    echo - Try getting a new token from Mapbox
    echo.
    echo ============================================
    echo.
    
    echo Opening APK folder...
    explorer "%CD%\android\app\build\outputs\apk\release"
    
    echo.
    echo ============================================
    echo [READY] Share with colleagues! 🎉
    echo ============================================
    echo.
) else (
    echo [ERROR] APK file not found!
    echo.
)

pause

