@echo off
echo Installing Mapbox dependencies...
echo.

REM Install the required packages
call npm install mapbox-gl@^3.0.1 react-map-gl@^7.1.7

echo.
echo Installation complete!
echo.
echo Next steps:
echo 1. Sign up at: https://account.mapbox.com/auth/signup/
echo 2. Get your FREE Mapbox token (no credit card needed!)
echo 3. Create a .env file
echo 4. Add this line: VITE_MAPBOX_TOKEN=your_token_here
echo 5. Run: npm run dev
echo.
echo See MAPBOX_SETUP_GUIDE.md for detailed instructions!
echo.
pause

