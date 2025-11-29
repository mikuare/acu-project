@echo off
echo ============================================
echo MANUAL ANDROID ICON UPDATE - STEP BY STEP
echo ============================================
echo.
echo The automatic sync didn't work, so we'll
echo use an online tool to generate proper icons.
echo.
echo This is the EASIEST manual method!
echo.
pause

echo.
echo ============================================
echo STEP 1: Opening Icon Generator Website
echo ============================================
echo.
echo I'll open icon.kitchen in your browser.
echo This is a FREE online tool for generating
echo Android app icons.
echo.
pause

start https://icon.kitchen/

echo.
echo ============================================
echo STEP 2: INSTRUCTIONS FOR YOU
echo ============================================
echo.
echo In the website that just opened:
echo.
echo 1. Click "Upload Image" or drag and drop
echo.
echo 2. Select this file from your project:
echo    public\logo earth.png
echo.
echo 3. Configure settings:
echo    - Icon Type: Android Launcher Icon
echo    - Shape: Circle (recommended)
echo    - Background: Transparent or #1e40af (blue)
echo    - Resize: 100%% (adjust if needed)
echo    - Trim: Auto (or adjust padding)
echo.
echo 4. Preview the icon (make sure it looks good)
echo.
echo 5. Click "Download" button
echo.
echo 6. Save the ZIP file to your Downloads folder
echo.
echo 7. Extract the ZIP file
echo.
echo 8. Come back here and press any key...
echo.
pause

echo.
echo ============================================
echo STEP 3: Copy Icon Files
echo ============================================
echo.
echo Now we need to copy the generated icons
echo to your Android project.
echo.
echo From the extracted folder, copy these folders:
echo.
echo   mipmap-mdpi
echo   mipmap-hdpi
echo   mipmap-xhdpi
echo   mipmap-xxhdpi
echo   mipmap-xxxhdpi
echo.
echo To this location:
echo   %CD%\android\app\src\main\res\
echo.
echo Replace the existing folders when asked.
echo.
echo Opening both folders for you...
echo.
pause

explorer "%USERPROFILE%\Downloads"
timeout /t 2 >nul
explorer "%CD%\android\app\src\main\res"

echo.
echo ============================================
echo WAITING FOR YOU TO COPY FILES...
echo ============================================
echo.
echo Please:
echo 1. Find the extracted icon folder in Downloads
echo 2. Copy the mipmap-* folders
echo 3. Paste into the res folder that opened
echo 4. Replace existing files
echo.
echo When done, come back and press any key...
echo.
pause

echo.
echo ============================================
echo STEP 4: Building APK with New Icon
echo ============================================
echo.
echo Now building APK with your earth logo icon...
echo This takes 5-10 minutes.
echo.
pause

cd android
cmd /c "gradlew clean assembleRelease"
set BUILD_RESULT=%errorlevel%
cd ..

if %BUILD_RESULT% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo [SUCCESS] APK BUILT WITH EARTH LOGO! 🌍
echo ============================================
echo.

set APK_FILE=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_FILE%" (
    echo Your APK with earth logo is ready!
    echo.
    echo ============================================
    echo IMPORTANT INSTALLATION STEPS:
    echo ============================================
    echo.
    echo To see the new icon, you MUST:
    echo.
    echo 1. Completely UNINSTALL the old app
    echo    (Settings ^> Apps ^> QMAZ Project Map ^> Uninstall)
    echo.
    echo 2. RESTART your device (important!)
    echo.
    echo 3. Install the new APK
    echo.
    echo 4. Check app drawer for earth logo 🌍
    echo.
    echo Why restart? Android caches app icons!
    echo.
    echo ============================================
    echo.
    
    explorer "%CD%\android\app\build\outputs\apk\release"
    
) else (
    echo [ERROR] APK not found!
)

pause

