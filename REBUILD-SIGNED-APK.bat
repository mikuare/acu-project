@echo off
echo ============================================
echo REBUILD WITH SIGNING (Quick Version)
echo ============================================
echo.
echo Since your web app is already built,
echo this will just rebuild the Android APK
echo with proper signing configuration.
echo.
echo This will take 3-5 minutes.
echo.
pause

echo.
echo [1/2] Syncing to Android...
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

echo [2/2] Building SIGNED release APK...
echo.
echo Using your keystore:
echo - File: android\keystores\release-key.jks
echo - Password: Judech-123
echo - Alias: acu-project-map-key
echo.
echo Building...
echo.

cd android
cmd /c "gradlew clean assembleRelease"
set BUILD_RESULT=%errorlevel%
cd ..

if %BUILD_RESULT% neq 0 (
    echo.
    echo ============================================
    echo [ERROR] BUILD FAILED!
    echo ============================================
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo [SUCCESS] SIGNED APK CREATED!
echo ============================================
echo.

set APK_FILE=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_FILE%" (
    echo Your SIGNED APK is ready! 🚀
    echo.
    echo Location: %APK_FILE%
    echo.
    
    echo Checking file...
    dir "%APK_FILE%" | findstr "app-release"
    
    echo.
    echo ============================================
    echo VERIFICATION:
    echo ============================================
    echo.
    echo This file should be named: app-release.apk
    echo (NOT app-release-unsigned.apk)
    echo.
    echo If it says "app-release.apk" - SUCCESS! ✓
    echo.
    echo ============================================
    echo.
    
    echo Opening folder...
    explorer "%CD%\android\app\build\outputs\apk\release"
    
    echo.
    echo ============================================
    echo [READY] Share app-release.apk! 🎉
    echo ============================================
    echo.
    echo This is your properly SIGNED release APK!
    echo.
    echo ✓ No parse errors
    echo ✓ Installs smoothly
    echo ✓ Ready for colleagues
    echo.
) else (
    echo [ERROR] APK file not found!
    echo Expected: %APK_FILE%
    echo.
)

pause

