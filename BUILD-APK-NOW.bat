@echo off
echo ============================================
echo Build Android APK (Final Step!)
echo ============================================
echo.

echo Checking Android SDK location...
echo.

set SDK_PATH=C:\Users\edujk\AppData\Local\Android\Sdk

if exist "%SDK_PATH%" (
    echo ✓ Android SDK found at: %SDK_PATH%
    echo.
) else (
    echo ⚠️ Android SDK not found at default location!
    echo.
    echo Please check where Android Studio installed the SDK.
    echo Common locations:
    echo   C:\Users\edujk\AppData\Local\Android\Sdk
    echo   C:\Android\Sdk
    echo   C:\Program Files\Android\Sdk
    echo.
    echo If SDK is elsewhere, edit: android\local.properties
    echo.
    pause
)

echo Building release APK...
echo This may take 3-5 minutes...
echo.

cd android
call gradlew assembleRelease

if errorlevel 1 (
    echo.
    echo ============================================
    echo ❌ BUILD FAILED!
    echo ============================================
    echo.
    echo Common fixes:
    echo.
    echo 1. SDK Location Issue:
    echo    - Open: android\local.properties
    echo    - Update sdk.dir to your Android SDK path
    echo.
    echo 2. Missing SDK Components:
    echo    - Open Android Studio
    echo    - Go to: Tools ^> SDK Manager
    echo    - Install: Android SDK Build-Tools 34
    echo    - Install: Android SDK Platform 34
    echo.
    echo 3. Still having issues?
    echo    - Open this project in Android Studio
    echo    - Let it sync and download required components
    echo    - Then run this script again
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================
echo ✅ BUILD SUCCESSFUL!
echo ============================================
echo.

set APK_PATH=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_PATH%" (
    echo Your APK is ready!
    echo.
    echo Location: %APK_PATH%
    echo.
    
    for %%I in ("%APK_PATH%") do (
        set /a SIZE_MB=%%~zI/1024/1024
        echo Size: %%~zI bytes (~!SIZE_MB! MB)
    )
    
    echo.
    echo Opening folder...
    start "" "%CD%\android\app\build\outputs\apk\release"
    
    echo.
    echo ============================================
    echo 📱 INSTALL ON YOUR PHONE:
    echo ============================================
    echo.
    echo 1. Find: app-release.apk
    echo 2. Transfer to your Android phone
    echo 3. Install it
    echo 4. Test your app!
    echo.
    echo ✅ DONE! You're using Capacitor 6 with Java 17!
) else (
    echo ⚠️ APK not found at expected location
)

echo.
pause

