@echo off
echo ============================================
echo  INSTALL APK UPDATE SYSTEM
echo ============================================
echo.
echo This will install the Capacitor Browser plugin
echo needed for the APK update system.
echo.
pause

echo.
echo [STEP 1] Installing @capacitor/browser...
echo ============================================
call npm install @capacitor/browser@6.0.2

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Package installed!
echo.

echo [STEP 2] Syncing with Android project...
echo ============================================
call npx cap sync

if errorlevel 1 (
    echo.
    echo [ERROR] Sync failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo  INSTALLATION COMPLETE!
echo ============================================
echo.
echo ✅ Update system is now ready!
echo.
echo NEXT STEPS:
echo -----------
echo 1. Read: UPDATE-SYSTEM-QUICK-START.txt
echo 2. Create GitHub repository: qmaz-project-update
echo 3. Enable GitHub Pages
echo 4. Upload update.json
echo 5. Build your next APK with updated version codes
echo.
echo IMPORTANT:
echo ----------
echo Before building each APK, update version codes in:
echo   • android/app/build.gradle (versionCode and versionName)
echo   • src/hooks/useUpdateCheck.ts (CURRENT_VERSION_CODE)
echo.
pause

