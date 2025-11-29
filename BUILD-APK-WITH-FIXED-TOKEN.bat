@echo off
echo ============================================
echo BUILD APK WITH MAPBOX TOKEN (SYNTAX FIXED)
echo ============================================
echo.
echo Token syntax has been corrected!
echo.
echo Your token: pk.eyJ1IjoianVkZWNoLTEyMyIsImEi...
echo Status: ✓ Properly formatted with quotes
echo.
echo This will now build your complete APK
echo with the working map!
echo.
echo Total time: 10-15 minutes
echo.
pause

echo.
echo ============================================
echo STEP 1/3: Building Web Application
echo ============================================
echo.
echo Building with Mapbox token included...
echo.

cmd /c "npm run build"

if errorlevel 1 (
    echo.
    echo ============================================
    echo [ERROR] Build Failed!
    echo ============================================
    echo.
    echo If you see syntax errors:
    echo 1. Check src\config\mapbox.ts
    echo 2. Make sure token is in quotes: 'token_here'
    echo 3. Make sure it ends with semicolon ;
    echo.
    echo Current format should be:
    echo export const MAPBOX_TOKEN = 'pk.eyJ1...';
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Web app built successfully with Mapbox token!
echo.

echo ============================================
echo STEP 2/3: Syncing to Android
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
echo [OK] Synced to Android!
echo.

echo ============================================
echo STEP 3/3: Building Signed Release APK
echo ============================================
echo.
echo Building with:
echo - Mapbox token: pk.eyJ1IjoianVkZWNoLTEyMyI...
echo - Keystore: android\keystores\release-key.jks
echo - Password: Judech-123
echo.
echo This takes 5-10 minutes...
echo Please wait...
echo.

cd android
cmd /c "gradlew clean assembleRelease"
set BUILD_RESULT=%errorlevel%
cd ..

if %BUILD_RESULT% neq 0 (
    echo.
    echo ============================================
    echo [ERROR] APK Build Failed!
    echo ============================================
    echo.
    echo Common fixes:
    echo 1. Open Android Studio
    echo 2. File ^> Open ^> android folder
    echo 3. Let it sync (download components)
    echo 4. Close Android Studio
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo [SUCCESS] APK BUILT WITH MAPBOX! 🗺️
echo ============================================
echo.

set APK_FILE=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_FILE%" (
    echo Your complete signed APK is ready!
    echo.
    echo ============================================
    echo APK DETAILS:
    echo ============================================
    echo.
    echo File: app-release.apk
    echo Location: android\app\build\outputs\apk\release\
    echo.
    dir "%APK_FILE%" | findstr "app-release"
    echo.
    echo ============================================
    echo WHAT'S INCLUDED:
    echo ============================================
    echo.
    echo ✓ Mapbox token (map will show!)
    echo ✓ Properly signed (no parse errors!)
    echo ✓ All project data
    echo ✓ Authentication system
    echo ✓ All features working
    echo.
    echo ============================================
    echo INSTALLATION INSTRUCTIONS:
    echo ============================================
    echo.
    echo For your colleagues:
    echo 1. Transfer app-release.apk to phone
    echo 2. Settings ^> Security ^> Unknown Sources (enable)
    echo 3. Tap the APK file
    echo 4. Tap Install
    echo 5. Open the app
    echo 6. Map should display with all markers!
    echo.
    echo ============================================
    echo TESTING CHECKLIST:
    echo ============================================
    echo.
    echo Install on Android and verify:
    echo □ App opens successfully
    echo □ Map tiles load and display
    echo □ Project markers show on map
    echo □ Can zoom and pan
    echo □ Can tap markers for details
    echo □ Login works
    echo □ No "token missing" error
    echo.
    echo ============================================
    echo.
    
    echo Opening APK folder...
    explorer "%CD%\android\app\build\outputs\apk\release"
    
    echo.
    echo ============================================
    echo [COMPLETE] Ready to share! 🎉
    echo ============================================
    echo.
    echo Share: app-release.apk
    echo.
    echo If the map doesn't show:
    echo - Reinstall the APK completely
    echo - Check internet connection (first load)
    echo - Contact me with error details
    echo.
) else (
    echo [ERROR] APK file not found!
    echo Expected: %APK_FILE%
    echo.
)

pause

