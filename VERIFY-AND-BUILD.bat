@echo off
echo ============================================
echo Verify Setup and Build Signed APK
echo ============================================
echo.

echo Checking keystore file...
if exist "android\keystores\release-key.jks" (
    echo ✓ Keystore found: android\keystores\release-key.jks
) else (
    echo ❌ Keystore NOT found!
    echo.
    echo Expected location: android\keystores\release-key.jks
    echo.
    pause
    exit /b 1
)

echo.
echo Checking gradle.properties...
if exist "android\gradle.properties" (
    echo ✓ Configuration found: android\gradle.properties
    findstr "RELEASE_STORE_FILE" android\gradle.properties
    echo.
) else (
    echo ❌ Configuration NOT found!
    pause
    exit /b 1
)

echo.
echo ============================================
echo All checks passed! Building APK...
echo ============================================
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

echo ✓ Web app built!

echo.
echo Step 2: Syncing to Android...
call npx cap sync android

if errorlevel 1 (
    echo ❌ Sync failed!
    pause
    exit /b 1
)

echo ✓ Synced!

echo.
echo Step 3: Building signed APK...
echo This will take 3-5 minutes...
echo.

cd android
call gradlew assembleRelease

if errorlevel 1 (
    echo.
    echo ❌ BUILD FAILED!
    echo.
    echo Error details above. Common fixes:
    echo 1. Check keystore path is correct
    echo 2. Check password is correct  
    echo 3. Open project in Android Studio and sync
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

set APK=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK%" (
    echo 📦 Your signed APK is ready!
    echo.
    echo Location: %APK%
    echo.
    
    for %%I in ("%APK%") do (
        set /a SIZE_MB=%%~zI/1024/1024
        echo Size: %%~zI bytes (~!SIZE_MB! MB)
    )
    
    echo.
    echo ============================================
    echo 📱 READY TO DISTRIBUTE!
    echo ============================================
    echo.
    echo File: app-release.apk
    echo.
    echo ✓ Signed with your keystore
    echo ✓ Ready for your colleagues
    echo ✓ No "parse package error"
    echo.
    echo Opening folder...
    start "" "%CD%\android\app\build\outputs\apk\release"
    echo.
) else (
    echo ❌ APK not found!
)

echo.
pause

