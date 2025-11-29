@echo off
echo ============================================
echo Quick Release APK Builder
echo ============================================
echo.

echo IMPORTANT: Before building release APK, you need:
echo 1. A keystore file (signing key)
echo 2. Your keystore password
echo.
echo Do you have a keystore already?
echo.
echo [Y] Yes, I have a keystore - Build release APK now
echo [N] No, create keystore first
echo.
choice /C YN /N /M "Your choice (Y/N): "

if errorlevel 2 goto CREATE_KEYSTORE
if errorlevel 1 goto BUILD_RELEASE

:CREATE_KEYSTORE
echo.
echo ============================================
echo Creating Keystore First...
echo ============================================
echo.
call 4-setup-keystore.bat
echo.
echo Now run this script again to build the release APK.
pause
exit

:BUILD_RELEASE
echo.
echo ============================================
echo Building Release APK...
echo ============================================
echo.

echo Step 1: Building web app...
call npm run build

echo.
echo Step 2: Syncing to Android...
call npx cap sync android

echo.
echo Step 3: Building release APK with Gradle...
echo.
cd android
call gradlew assembleRelease

if errorlevel 1 (
    echo.
    echo ============================================
    echo BUILD FAILED!
    echo ============================================
    echo.
    echo Please check the error messages above.
    echo.
    echo Common fixes:
    echo 1. Make sure Java JDK is installed
    echo 2. Check that JAVA_HOME is set correctly
    echo 3. Try running: gradlew clean assembleRelease
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
    echo Your release APK is located at:
    echo.
    echo   %APK_PATH%
    echo.
    
    for %%I in ("%APK_PATH%") do (
        echo File size: %%~zI bytes
    )
    
    echo.
    echo Opening the folder now...
    start "" "%CD%\android\app\build\outputs\apk\release"
    
    echo.
    echo You can now:
    echo 1. Install this APK on your Android device
    echo 2. Upload to Google Play Store
    echo 3. Share with users
) else (
    echo ERROR: APK file was not created!
    echo Expected location: %APK_PATH%
    echo.
    echo The build may have completed but the APK wasn't generated.
    echo Try building again or check the Gradle output above for errors.
)

echo.
pause

