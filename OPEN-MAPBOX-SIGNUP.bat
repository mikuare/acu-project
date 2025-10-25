@echo off
echo ============================================
echo Opening Mapbox Signup Page
echo ============================================
echo.
echo I'll open the Mapbox signup page in your browser.
echo.
echo What to do:
echo 1. Sign up (it's FREE!)
echo 2. Verify your email
echo 3. Login to your account
echo 4. Copy your "Default public token"
echo 5. It starts with "pk." and is very long
echo.
echo Then come back and run: ADD-MAPBOX-TOKEN.bat
echo.
pause

echo.
echo Opening browser...
start https://account.mapbox.com/auth/signup/

echo.
echo ============================================
echo Browser opened!
echo ============================================
echo.
echo After you get your token:
echo.
echo 1. Run: ADD-MAPBOX-TOKEN.bat
echo 2. Paste your token
echo 3. Save the file
echo 4. Run: REBUILD-WITH-MAPBOX.bat
echo.
echo Or read the full guide: MAPBOX-TOKEN-FIX-GUIDE.txt
echo.
pause

