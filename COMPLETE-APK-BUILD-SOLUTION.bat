@echo off
echo ============================================
echo Complete APK Build Solution
echo ============================================
echo.
echo Goal: Build a signed release APK for distribution
echo.
echo Your setup:
echo ✓ Java 17 installed
echo ✓ Android Studio installed
echo ✓ Capacitor 6 ready
echo.
echo This will:
echo 1. Verify Android SDK location
echo 2. Build a DEBUG APK first (for testing)
echo 3. Guide you to create SIGNED RELEASE APK
echo.
pause

echo.
echo ============================================
echo Step 1: Verifying Android SDK
echo ============================================
echo.

set SDK_PATH=C:\Users\edujk\AppData\Local\Android\Sdk

if exist "%SDK_PATH%\platform-tools" (
    echo ✓ Android SDK found at: %SDK_PATH%
    echo.
    
    REM Update local.properties
    set "ESCAPED_PATH=%SDK_PATH:\=\\%"
    (
        echo ## Android SDK Location
        echo sdk.dir=%ESCAPED_PATH%
    ) > android\local.properties
    
    echo ✓ SDK location configured in android\local.properties
    echo.
) else (
    echo ⚠️ Android SDK not found at default location.
    echo.
    echo Please run: FIND-ANDROID-SDK.bat
    echo.
    pause
    exit /b 1
)

echo ============================================
echo Step 2: Building DEBUG APK (for testing)
echo ============================================
echo.
echo This is a quick test build...
echo.

cd android
call gradlew assembleDebug

if errorlevel 1 (
    echo.
    echo ❌ Debug build failed!
    echo.
    echo Please check:
    echo 1. Open this project in Android Studio
    echo 2. Let it sync and download required components
    echo 3. Try File ^> Sync Project with Gradle Files
    echo 4. Then run this script again
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ✓ Debug APK built successfully!
echo.

set DEBUG_APK=android\app\build\outputs\apk\debug\app-debug.apk

if exist "%DEBUG_APK%" (
    echo Location: %DEBUG_APK%
    echo.
    echo This APK is for TESTING ONLY.
    echo It's NOT suitable for distribution to colleagues.
    echo.
) else (
    echo ⚠️ Debug APK not found!
)

echo.
echo ============================================
echo Step 3: Prepare for SIGNED RELEASE APK
echo ============================================
echo.
echo For distribution to colleagues, you need a SIGNED release APK.
echo.
echo This prevents "parse package error" and allows installation on any device.
echo.
echo Do you want to create a SIGNED release APK now?
echo.
echo [Y] Yes - Create signing key and build signed APK
echo [N] No  - Just test the debug APK first
echo.
choice /C YN /N /M "Your choice (Y/N): "

if errorlevel 2 goto SKIP_RELEASE
if errorlevel 1 goto BUILD_RELEASE

:BUILD_RELEASE
echo.
echo ============================================
echo Creating SIGNED Release APK
echo ============================================
echo.
echo You'll need to create a signing key (one-time setup).
echo This key will be used to sign ALL future versions of your app.
echo.
echo ⚠️ IMPORTANT: Save the key and password safely!
echo    If you lose it, you cannot update the app later!
echo.
pause

REM Check if keystore already exists
if exist acu-project-map.jks (
    echo.
    echo ✓ Signing key already exists: acu-project-map.jks
    echo.
    goto BUILD_SIGNED
)

echo.
echo Creating new signing key...
echo.
echo You will be asked for:
echo 1. Keystore password (choose a strong password!)
echo 2. Your name
echo 3. Organization name
echo 4. City/Locality
echo 5. State/Province
echo 6. Country code (e.g., PH for Philippines)
echo.
echo ⚠️ WRITE DOWN ALL THIS INFORMATION!
echo.
pause

keytool -genkey -v -keystore acu-project-map.jks -alias acu-project-map-key -keyalg RSA -keysize 2048 -validity 10000

if errorlevel 1 (
    echo.
    echo ❌ Failed to create signing key!
    echo.
    echo Make sure Java JDK is installed and 'keytool' is in PATH.
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ Signing key created: acu-project-map.jks
echo.
echo ⚠️ SAVE THIS FILE AND YOUR PASSWORD!
echo    You'll need them for all future app updates!
echo.

:BUILD_SIGNED
echo.
echo Now building SIGNED release APK...
echo.
echo You'll need to enter your keystore password.
echo.

set /p STORE_PASS="Enter keystore password: "
set /p KEY_PASS="Enter key password (press Enter if same as keystore): "
if "%KEY_PASS%"=="" set KEY_PASS=%STORE_PASS%

REM Create gradle.properties for signing
(
    echo RELEASE_STORE_FILE=../acu-project-map.jks
    echo RELEASE_STORE_PASSWORD=%STORE_PASS%
    echo RELEASE_KEY_ALIAS=acu-project-map-key
    echo RELEASE_KEY_PASSWORD=%KEY_PASS%
) > android\gradle.properties

echo.
echo Configuring signing in build.gradle...
echo.

REM Add signing config to build.gradle if not already there
findstr /C:"signingConfigs" android\app\build.gradle >nul
if errorlevel 1 (
    echo Signing config not found, adding it...
    
    REM Backup original build.gradle
    copy android\app\build.gradle android\app\build.gradle.backup >nul
    
    REM This is complex, so let's use a simpler approach
    echo.
    echo ⚠️ Please do this manually:
    echo.
    echo 1. Open: android\app\build.gradle
    echo 2. Find the "android {" block
    echo 3. Add this INSIDE the android block (before buildTypes):
    echo.
    echo     signingConfigs {
    echo         release {
    echo             storeFile file("../../acu-project-map.jks")
    echo             storePassword RELEASE_STORE_PASSWORD
    echo             keyAlias RELEASE_KEY_ALIAS
    echo             keyPassword RELEASE_KEY_PASSWORD
    echo         }
    echo     }
    echo.
    echo 4. Find "buildTypes { release {" section
    echo 5. Add this line inside release block:
    echo     signingConfig signingConfigs.release
    echo.
    echo 6. Save the file
    echo.
    echo Then run: BUILD-SIGNED-APK-FINAL.bat
    echo.
    pause
    goto END
) else (
    echo ✓ Signing config already exists
)

echo.
echo Building signed release APK...
echo.

cd android
call gradlew assembleRelease

if errorlevel 1 (
    echo.
    echo ❌ Signed release build failed!
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================
echo ✅ SIGNED RELEASE APK CREATED!
echo ============================================
echo.

set RELEASE_APK=android\app\build\outputs\apk\release\app-release.apk

if exist "%RELEASE_APK%" (
    echo Your SIGNED APK is ready!
    echo.
    echo Location: %RELEASE_APK%
    echo.
    
    for %%I in ("%RELEASE_APK%") do (
        set /a SIZE_MB=%%~zI/1024/1024
        echo Size: %%~zI bytes (~!SIZE_MB! MB)
    )
    
    echo.
    echo ============================================
    echo 📱 DISTRIBUTE TO COLLEAGUES:
    echo ============================================
    echo.
    echo 1. Share: app-release.apk
    echo 2. They install it on their Android phones
    echo 3. No "parse package error" - it's properly signed!
    echo.
    echo Opening folder...
    start "" "%CD%\android\app\build\outputs\apk\release"
    echo.
) else (
    echo ⚠️ Signed APK not found!
)

goto END

:SKIP_RELEASE
echo.
echo Skipping signed release APK for now.
echo.
echo To build a signed APK later, run:
echo BUILD-SIGNED-APK-FINAL.bat
echo.

:END
echo.
echo ============================================
echo Done!
echo ============================================
echo.
pause

