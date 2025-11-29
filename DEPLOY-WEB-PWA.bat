@echo off
echo ============================================
echo  DEPLOY WEB + PWA TO PRODUCTION
echo ============================================
echo.
echo This will:
echo 1. Build the web application
echo 2. Commit all changes to Git
echo 3. Push to GitHub
echo 4. Trigger automatic Vercel deployment
echo.
echo NOTE: This does NOT deploy the native APK!
echo The APK must be built separately and distributed manually.
echo.
pause

echo.
echo [STEP 1] Building web application...
echo ============================================
call npm run build

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed! Please fix errors before deploying.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Build completed!
echo.

echo [STEP 2] Staging all changes for Git...
echo ============================================
git add .

echo.
echo [STEP 3] Committing changes...
echo ============================================
git commit -m "Update: QMAZ Project Map - Web and PWA enhancements (GPS improvements, PWA prompt, rebranding)"

echo.
echo [STEP 4] Pushing to GitHub...
echo ============================================
git push origin main

if errorlevel 1 (
    echo.
    echo [ERROR] Git push failed!
    echo.
    echo Possible reasons:
    echo 1. No internet connection
    echo 2. GitHub authentication required
    echo 3. Branch name incorrect (might be 'master' instead of 'main')
    echo.
    echo Try manually:
    echo   git push origin master
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo  DEPLOYMENT INITIATED!
echo ============================================
echo.
echo Changes pushed to GitHub successfully!
echo.
echo Vercel will automatically detect the push and deploy:
echo   - Web Application
echo   - PWA (Progressive Web App)
echo.
echo Check deployment status at:
echo   https://vercel.com/dashboard
echo.
echo Your live site:
echo   https://acu-project-map-dev.vercel.app/
echo.
echo Deployment usually takes 1-3 minutes.
echo.
echo IMPORTANT NOTES:
echo ===============
echo - Clear browser cache to see changes immediately
echo - PWA users may need to close/reopen the app
echo - Test on mobile after deployment
echo - Native APK is NOT affected by this deployment
echo.
pause
