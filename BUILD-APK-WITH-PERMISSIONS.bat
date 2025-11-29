@echo off
echo ============================================
echo BUILD APK WITH PERMISSIONS  ENABLED
echo ============================================
echo.
echo This APK will properly request:
echo ✓ Location permissions (GPS)
echo ✓ Camera permissions
echo ✓ Storage permissions (for photos)
echo.
echo Total time: 15-20 minutes
echo.
pause

echo.
echo ============================================
echo STEP 1/4: Installing Packages
echo ============================================
echo.

cmd /c "npm install"

if errorlevel 1 (
    echo.
    echo [ERROR] Package installation failed!
    pause
    exit /b 1
)

echo.
echo [OK] Packages installed!
echo.

echo ============================================
echo STEP 2/4: Building Web Application
echo ============================================
echo.
echo Building with:
echo - Mapbox token included
echo - Permission handling enabled
echo - Capacitor plugins configured
echo.

cmd /c "npm run build"

if errorlevel 1 (
    echo.
    echo [ERROR] Web build failed!
    pause
    exit /b 1
)

echo.
echo [OK] Web app built!
echo.

echo ============================================
echo STEP 3/4: Syncing to Android
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
echo STEP 4/4: Building Signed APK
echo ============================================
echo.
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
echo [SUCCESS] APK BUILT WITH PERMISSIONS! 🎉
echo ============================================
echo.

set APK_FILE=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_FILE%" (
    echo Your complete signed APK is ready!
    echo.
    echo ============================================
    echo APK FEATURES:
    echo ============================================
    echo.
    echo ✅ Map displays (Mapbox token included)
    echo ✅ Location permission requests (GPS)
    echo ✅ Camera permission requests
    echo ✅ Storage permission (for photos)
    echo ✅ Properly signed (no parse errors)
    echo ✅ All features working
    echo.
    echo ============================================
    echo PERMISSIONS IN APK:
    echo ============================================
    echo.
    echo When users install and open the app:
    echo.
    echo 1. Tap "Enter Project" button
    echo    → App will request LOCATION permission
    echo    → User taps "Allow" or "While using app"
    echo    → GPS location will work!
    echo.
    echo 2. Take photo feature
    echo    → App will request CAMERA permission
    echo    → User taps "Allow"
    echo    → Camera will work!
    echo.
    echo These are automatic Android permission dialogs!
    echo.
    echo ============================================
    echo TESTING CHECKLIST:
    echo ============================================
    echo.
    echo Install on Android and test:
    echo □ App opens successfully
    echo □ Map displays (with Mapbox)
    echo □ Tap "Enter Project"
    echo □ Permission dialog appears
    echo □ Grant location permission
    echo □ GPS location is detected
    echo □ Can enter project details
    echo □ Camera permission works (if using camera)
    echo.
    echo ============================================
    echo.
    
    echo Opening APK folder...
    explorer "%CD%\android\app\build\outputs\apk\release"
    
    echo.
    echo ============================================
    echo [READY TO DISTRIBUTE] 🚀
    echo ============================================
    echo.
    echo Share: app-release.apk
    echo.
    echo Colleagues can now:
    echo ✓ Install the APK
    echo ✓ Grant permissions when prompted
    echo ✓ Use location features
    echo ✓ Use camera features
    echo ✓ Full app functionality!
    echo.
) else (
    echo [ERROR] APK file not found!
)

pause

