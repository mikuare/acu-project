@echo off
echo ============================================
echo Building Signed Release APK
echo ============================================
echo.
echo Configuration:
echo ✓ Keystore: android\keystores\release-key.jks
echo ✓ Alias: acu-project-map-key
echo ✓ Password: [configured]
echo.
pause

echo.
echo Step 1: Building web app...
call npm run build

if errorlevel 1 (
    echo ❌ Web build failed!
    pause
    exit /b 1
)

echo.
echo ✓ Web app built successfully!

echo.
echo Step 2: Syncing to Android...
call npx cap sync android

if errorlevel 1 (
    echo ❌ Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo ✓ Synced to Android!

echo.
echo Step 3: Building signed release APK...
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
    echo Please check the error messages above.
    echo.
    echo Common fixes:
    echo 1. Open project in Android Studio
    echo 2. Let it sync and download components
    echo 3. Try again
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
    echo Your SIGNED release APK is ready!
    echo.
    echo Location: %APK_PATH%
    echo.
    
    for %%I in ("%APK_PATH%") do (
        set /a SIZE_MB=%%~zI/1024/1024
        echo Size: %%~zI bytes (~!SIZE_MB! MB)
    )
    
    echo.
    echo ============================================
    echo 📱 READY TO DISTRIBUTE!
    echo ============================================
    echo.
    echo Share this file with your colleagues:
    echo   app-release.apk
    echo.
    echo They can install it on any Android phone!
    echo No "parse package error" - properly signed!
    echo.
    echo Opening output folder...
    start "" "%CD%\android\app\build\outputs\apk\release"
    echo.
    echo ✅ Done!
) else (
    echo ❌ APK file was not created!
    echo.
    echo Check build output above for errors.
)

echo.
pause

