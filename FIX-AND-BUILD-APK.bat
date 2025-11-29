@echo off
echo ============================================
echo Fix Build Issues and Build Release APK
echo ============================================
echo.

echo This script will:
echo 1. Clean previous build files
echo 2. Fix Java compatibility issues
echo 3. Build a fresh release APK
echo.
pause

echo.
echo Step 1: Cleaning previous build...
cd android
call gradlew clean
cd ..

echo.
echo Step 2: Building web app...
call npm run build

echo.
echo Step 3: Syncing to Android...
call npx cap sync android

echo.
echo Step 4: Building release APK...
cd android
call gradlew assembleRelease --info

if errorlevel 1 (
    echo.
    echo ============================================
    echo BUILD FAILED!
    echo ============================================
    echo.
    echo Please check the error messages above.
    echo.
    echo If you see Java version errors:
    echo 1. Check your Java version: java -version
    echo 2. Make sure you have Java 17 or higher
    echo 3. Set JAVA_HOME environment variable
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================
echo BUILD SUCCESSFUL!
echo ============================================
echo.

set APK_PATH=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_PATH%" (
    echo ✓ Your release APK is ready!
    echo.
    echo Location: %APK_PATH%
    echo.
    
    for %%I in ("%APK_PATH%") do (
        set /a SIZE_MB=%%~zI/1024/1024
        echo File size: %%~zI bytes (~!SIZE_MB! MB)
    )
    
    echo.
    echo Opening the folder now...
    start "" "%CD%\android\app\build\outputs\apk\release"
    
    echo.
    echo ============================================
    echo NEXT STEPS:
    echo ============================================
    echo.
    echo 1. The APK file is: app-release.apk
    echo 2. Transfer it to your Android phone
    echo 3. Install and test it
    echo.
    echo For Play Store upload:
    echo - You need to sign this APK with a keystore
    echo - Run: 4-setup-keystore.bat first
    echo - Then configure signing in build.gradle
    echo.
) else (
    echo.
    echo ✗ ERROR: APK file was not created!
    echo.
    echo Expected: %APK_PATH%
    echo.
    echo Please check the build output above for errors.
    echo.
)

pause

