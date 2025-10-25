@echo off
echo ============================================
echo Android Keystore Setup for Release APK
echo ============================================
echo.
echo This will create a keystore file to sign your release APK.
echo.
echo IMPORTANT: Keep this information SAFE and SECURE!
echo You will need it for ALL future app updates.
echo If you lose it, you cannot update your app on Play Store!
echo.
echo ============================================
echo.

echo Please prepare the following information:
echo.
echo 1. KEYSTORE PASSWORD: Choose a strong password
echo    (You'll need to enter this twice)
echo.
echo 2. KEY ALIAS: A name for your key (e.g., "acu-project-map")
echo.
echo 3. KEY PASSWORD: Password for the key (can be same as keystore password)
echo.
echo 4. YOUR NAME: Your full name or organization name
echo.
echo 5. ORGANIZATIONAL UNIT: Your team/department (e.g., "Development")
echo.
echo 6. ORGANIZATION: Your company name (e.g., "ACU")
echo.
echo 7. CITY: Your city
echo.
echo 8. STATE: Your state/province
echo.
echo 9. COUNTRY CODE: Two-letter country code (e.g., PH for Philippines)
echo.
echo ============================================
echo.
echo Press any key when ready to start...
pause > nul

echo.
echo Creating keystore directory...
if not exist "android\keystores" mkdir android\keystores

echo.
echo ============================================
echo Running keytool (Java key generation tool)...
echo ============================================
echo.
echo You will be prompted for the information above.
echo.
echo DEFAULT VALUES YOU CAN USE:
echo - Keystore password: Choose something secure!
echo - Key alias: acu-project-map-key
echo - Key password: (same as keystore password)
echo - Name: ACU Organization
echo - Organizational Unit: Development Team
echo - Organization: ACU
echo - City: Manila
echo - State: Metro Manila
echo - Country: PH
echo.
echo ============================================
echo.

keytool -genkey -v -keystore android\keystores\release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias acu-project-map-key

echo.
echo ============================================
echo Keystore Created Successfully!
echo ============================================
echo.
echo Your keystore is saved at: android\keystores\release-key.jks
echo.
echo IMPORTANT: Write down this information NOW:
echo.
echo Keystore Path: android\keystores\release-key.jks
echo Keystore Password: [THE PASSWORD YOU JUST ENTERED]
echo Key Alias: acu-project-map-key
echo Key Password: [THE KEY PASSWORD YOU JUST ENTERED]
echo.
echo KEEP THIS INFORMATION SAFE!
echo You will need it for EVERY app update!
echo.
echo Next step: Run 5-build-apk-release.bat to build signed APK
echo.
pause

