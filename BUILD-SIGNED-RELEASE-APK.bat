@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

echo ============================================
echo Build SIGNED Release APK for Distribution
echo ============================================
echo.
echo This will create an APK that your colleagues can install
echo without "parse package error"
echo.
pause

echo.
echo ============================================
echo Step 1: Verify Android SDK
echo ============================================
echo.

set SDK_PATH=C:\Users\edujk\AppData\Local\Android\Sdk

if exist "%SDK_PATH%\platform-tools" (
    echo ✓ Android SDK found
    
    REM Update local.properties
    set "ESCAPED_PATH=%SDK_PATH:\=\\%"
    (
        echo sdk.dir=!ESCAPED_PATH!
    ) > android\local.properties
    
    echo ✓ SDK configured
) else (
    echo ❌ Android SDK not found!
    echo.
    echo Please install Android Studio or run: FIND-ANDROID-SDK.bat
    pause
    exit /b 1
)

echo.
echo ============================================
echo Step 2: Create or Use Signing Key
echo ============================================
echo.

if exist acu-project-map.jks (
    echo ✓ Signing key exists: acu-project-map.jks
    echo.
    goto ENTER_PASSWORDS
)

echo No signing key found. Creating one now...
echo.
echo ⚠️  IMPORTANT INFORMATION:
echo    - You will create a signing key (one-time setup)
    echo    - This key will sign ALL versions of your app
echo    - SAVE the key file and password safely!
echo    - If lost, you cannot update the app later!
echo.
pause

echo.
echo Creating signing key...
echo.
echo Please enter the following information:
echo (Press Enter to skip optional fields)
echo.

keytool -genkey -v -keystore acu-project-map.jks -alias acu-project-map-key -keyalg RSA -keysize 2048 -validity 10000

if errorlevel 1 (
    echo.
    echo ❌ Failed to create signing key!
    echo.
    echo Make sure Java JDK is in your PATH.
    echo Try: java -version
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ Signing key created successfully!
echo.
echo ⚠️  SAVE THESE FILES:
echo    - acu-project-map.jks (the keystore file)
echo    - Your password (write it down!)
echo.
pause

:ENTER_PASSWORDS
echo.
echo Enter signing credentials:
echo.

set /p STORE_PASS="Keystore password: "
if "%STORE_PASS%"=="" (
    echo Password cannot be empty!
    pause
    exit /b 1
)

set /p KEY_PASS="Key password (press Enter if same as keystore): "
if "%KEY_PASS%"=="" set KEY_PASS=%STORE_PASS%

echo.
echo Configuring build...
echo.

REM Create gradle.properties with signing info
(
    echo RELEASE_STORE_FILE=../../acu-project-map.jks
    echo RELEASE_STORE_PASSWORD=%STORE_PASS%
    echo RELEASE_KEY_ALIAS=acu-project-map-key
    echo RELEASE_KEY_PASSWORD=%KEY_PASS%
) > android\gradle.properties

echo ✓ Build configured

echo.
echo ============================================
echo Step 3: Building Signed Release APK
echo ============================================
echo.
echo This will take a few minutes...
echo.

cd android
call gradlew assembleRelease --info

if errorlevel 1 (
    echo.
    echo ============================================
    echo ❌ BUILD FAILED!
    echo ============================================
    echo.
    echo Common fixes:
    echo.
    echo 1. Open the project in Android Studio:
    echo    - File ^> Open ^> Select: android folder
    echo    - Let it sync
    echo    - Try Build ^> Clean Project
    echo    - Try Build ^> Rebuild Project
    echo.
    echo 2. Check if required SDK components are installed:
    echo    - Open Android Studio
    echo    - Tools ^> SDK Manager
    echo    - Install Android SDK Build-Tools
    echo    - Install Android SDK Platform 34
    echo.
    echo 3. Try again with this script
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

set RELEASE_APK=android\app\build\outputs\apk\release\app-release.apk

if exist "%RELEASE_APK%" (
    echo Your SIGNED release APK is ready!
    echo.
    echo 📁 Location: %RELEASE_APK%
    echo.
    
    for %%I in ("%RELEASE_APK%") do (
        set /a SIZE_MB=%%~zI/1024/1024
        echo 📦 Size: %%~zI bytes (~!SIZE_MB! MB)
    )
    
    echo.
    echo ============================================
    echo 📱 DISTRIBUTE TO COLLEAGUES:
    echo ============================================
    echo.
    echo 1. Share the file: app-release.apk
    echo 2. Colleagues install it on Android phones
    echo 3. Properly signed - no "parse package error"!
    echo 4. Works on any Android device (API 23+)
    echo.
    echo ✅ This APK is production-ready!
    echo.
    echo Opening output folder...
    start "" "%CD%\android\app\build\outputs\apk\release"
    echo.
    echo ============================================
    echo 💾 IMPORTANT - SAVE THESE:
    echo ============================================
    echo.
    echo ✓ File: acu-project-map.jks
    echo ✓ Password: (what you just entered)
    echo.
    echo You'll need these to build future updates!
    echo.
) else (
    echo ❌ APK file was not created!
    echo.
    echo Check the build output above for errors.
)

echo.
pause
ENDLOCAL

