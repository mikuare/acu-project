@echo off
echo ============================================
echo COMPLETE APK BUILD SOLUTION
echo ============================================
echo.
echo This will handle everything automatically!
echo.
pause

echo.
echo ============================================
echo STEP 1: Checking Keystore
echo ============================================
echo.

if exist "android\keystores\release-key.jks" (
    echo [OK] Keystore already exists!
    echo Location: android\keystores\release-key.jks
) else (
    echo [INFO] Keystore not found. Creating it now...
    echo.
    
    if not exist "android\keystores" (
        mkdir "android\keystores"
        echo Created directory: android\keystores
    )
    
    echo.
    echo Generating keystore with your credentials...
    echo.
    
    keytool -genkeypair ^
      -v ^
      -storetype JKS ^
      -keyalg RSA ^
      -keysize 2048 ^
      -validity 10000 ^
      -storepass "Judech-123" ^
      -keypass "Judech-123" ^
      -alias acu-project-map-key ^
      -keystore android\keystores\release-key.jks ^
      -dname "CN=jude martinez, OU=n/a, O=n/a, L=cebu, ST=dumanjug, C=ph"
    
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to create keystore!
        pause
        exit /b 1
    )
    
    echo.
    echo [SUCCESS] Keystore created!
)

echo.
echo ============================================
echo STEP 2: Verifying Setup
echo ============================================
echo.

echo Checking Java...
java -version 2>&1 | findstr "version"
if errorlevel 1 (
    echo [ERROR] Java not found!
    pause
    exit /b 1
)
echo [OK] Java 17 found
echo.

echo Checking Node.js...
node -v
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    pause
    exit /b 1
)
echo [OK] Node.js found
echo.

echo Checking keystore file...
if exist "android\keystores\release-key.jks" (
    echo [OK] Keystore verified
) else (
    echo [ERROR] Keystore still missing!
    pause
    exit /b 1
)

echo.
echo ============================================
echo STEP 3: Building Web Application
echo ============================================
echo.
echo This will take 1-2 minutes...
echo.

cmd /c "npm run build"

if errorlevel 1 (
    echo.
    echo [ERROR] Web build failed!
    echo.
    echo Please check the errors above.
    pause
    exit /b 1
)

echo.
echo [OK] Web application built successfully!

echo.
echo ============================================
echo STEP 4: Syncing to Android
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
echo [OK] Synced to Android successfully!

echo.
echo ============================================
echo STEP 5: Building Signed Release APK
echo ============================================
echo.
echo This is the longest step (5-10 minutes)
echo Building with your keystore...
echo.
echo Credentials:
echo - Keystore: release-key.jks
echo - Password: Judech-123
echo - Alias: acu-project-map-key
echo.
echo Please be patient...
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
    echo Common fixes:
    echo.
    echo 1. Open Android Studio
    echo 2. File ^> Open ^> android folder
    echo 3. Let it sync and download components
    echo 4. Close Android Studio
    echo 5. Run this script again
    echo.
    echo Or tell me the error message above!
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo [SUCCESS] APK BUILT SUCCESSFULLY!
echo ============================================
echo.

set APK_FILE=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_FILE%" (
    echo Your signed release APK is ready! 🚀
    echo.
    echo ============================================
    echo FILE INFORMATION:
    echo ============================================
    echo.
    echo Location: %APK_FILE%
    echo.
    
    for %%I in ("%APK_FILE%") do (
        set SIZE=%%~zI
    )
    echo Size: %SIZE% bytes
    
    echo.
    echo ============================================
    echo WHAT TO DO NOW:
    echo ============================================
    echo.
    echo 1. The APK folder will open in a moment
    echo 2. Copy "app-release.apk" to share
    echo 3. Send to your colleagues
    echo 4. They can install directly on Android!
    echo.
    echo ============================================
    echo INSTALLATION (for colleagues):
    echo ============================================
    echo.
    echo 1. Transfer app-release.apk to phone
    echo 2. Enable "Install from Unknown Sources"
    echo 3. Tap the APK file
    echo 4. Tap "Install"
    echo 5. Done!
    echo.
    echo ============================================
    echo.
    
    echo Opening APK folder...
    explorer "%CD%\android\app\build\outputs\apk\release"
    
    echo.
    echo ============================================
    echo [COMPLETE] Your app is ready to share! 🎉
    echo ============================================
    echo.
) else (
    echo [ERROR] APK file not found!
    echo Expected: %APK_FILE%
    echo.
)

pause

