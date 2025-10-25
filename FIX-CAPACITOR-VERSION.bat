@echo off
echo ============================================
echo Fix Capacitor Version for Java 17
echo ============================================
echo.
echo This will:
echo 1. Remove old Capacitor 7 (needs Java 21)
echo 2. Install Capacitor 6 (works with Java 17)
echo 3. Clean and rebuild Android project
echo 4. Build your APK
echo.
echo This may take 5-10 minutes...
echo.
pause

echo.
echo Step 1: Removing old Android folder...
if exist android (
    rmdir /s /q android
    echo ✓ Old Android folder removed
) else (
    echo ℹ No Android folder to remove
)

echo.
echo Step 2: Removing old node_modules/@capacitor...
if exist node_modules\@capacitor (
    rmdir /s /q node_modules\@capacitor
    echo ✓ Old Capacitor modules removed
) else (
    echo ℹ No Capacitor modules to remove
)

echo.
echo Step 3: Installing Capacitor 6 (compatible with Java 17)...
call npm install

if errorlevel 1 (
    echo.
    echo ❌ npm install failed!
    pause
    exit /b 1
)

echo.
echo Step 4: Building web app...
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ Web build failed!
    pause
    exit /b 1
)

echo.
echo Step 5: Adding Android platform...
call npx cap add android

if errorlevel 1 (
    echo.
    echo ❌ Failed to add Android platform!
    pause
    exit /b 1
)

echo.
echo Step 6: Syncing to Android...
call npx cap sync android

if errorlevel 1 (
    echo.
    echo ❌ Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo Step 7: Building release APK...
cd android
call gradlew assembleRelease

if errorlevel 1 (
    echo.
    echo ❌ APK build failed!
    echo Check the error messages above.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================
echo ✅ SUCCESS!
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
    echo ✅ Install app-release.apk on your Android phone!
) else (
    echo ⚠️ APK not found at expected location
)

echo.
echo ============================================
echo You are now using:
echo - Capacitor 6.x (compatible with Java 17)
echo - Java 17 ✓
echo ============================================
echo.
pause

