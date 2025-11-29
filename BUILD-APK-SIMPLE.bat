@echo off
echo ============================================
echo Simple APK Builder
echo ============================================
echo.

echo Checking keystore...
if exist "android\keystores\release-key.jks" (
    echo [OK] Keystore found!
) else (
    echo [ERROR] Keystore NOT found!
    echo.
    echo Looking for: android\keystores\release-key.jks
    echo.
    echo Please check if the file exists.
    pause
    exit /b 1
)

echo.
echo ============================================
echo Starting build process...
echo ============================================
echo.
echo This will take 5-10 minutes.
echo Please be patient!
echo.
pause

echo.
echo [1/3] Building web app...
echo.
cmd /c "npm run build"

if errorlevel 1 (
    echo.
    echo [ERROR] Web build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Web app built successfully!
echo.

echo [2/3] Syncing to Android...
echo.
cmd /c "npx cap sync android"

if errorlevel 1 (
    echo.
    echo [ERROR] Sync failed!
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Synced successfully!
echo.

echo [3/3] Building signed APK...
echo This is the longest step - please wait...
echo.

cd android
cmd /c "gradlew assembleRelease"
set BUILD_RESULT=%errorlevel%
cd ..

if %BUILD_RESULT% neq 0 (
    echo.
    echo ============================================
    echo [ERROR] BUILD FAILED!
    echo ============================================
    echo.
    echo Please check the errors above.
    echo.
    echo Common fixes:
    echo 1. Open Android Studio
    echo 2. File ^> Open ^> Select "android" folder
    echo 3. Let it sync and download components
    echo 4. Close Android Studio
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo [SUCCESS] APK BUILT!
echo ============================================
echo.

set APK_FILE=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_FILE%" (
    echo Your signed APK is ready!
    echo.
    echo Location: %APK_FILE%
    echo.
    
    for %%I in ("%APK_FILE%") do (
        echo Size: %%~zI bytes
    )
    
    echo.
    echo Opening folder...
    explorer "%CD%\android\app\build\outputs\apk\release"
    echo.
    echo ============================================
    echo Share app-release.apk with your colleagues!
    echo ============================================
    echo.
) else (
    echo [ERROR] APK file not created!
    echo.
    echo Expected: %APK_FILE%
    echo.
)

pause

