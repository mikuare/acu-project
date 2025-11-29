@echo off
echo ============================================
echo Creating Keystore for Signed APK
echo ============================================
echo.

echo [1/3] Creating keystores directory...
if not exist "android\keystores" (
    mkdir "android\keystores"
    echo Created: android\keystores
) else (
    echo Directory already exists
)

echo.
echo [2/3] Generating keystore file...
echo.
echo Using your information:
echo - Keystore: release-key.jks
echo - Password: Judech-123
echo - Alias: acu-project-map-key
echo - Name: jude martinez
echo - Location: Cebu, Dumanjug, PH
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
    echo.
    echo Please check:
    echo 1. Java is installed correctly
    echo 2. You have write permissions
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Verifying keystore...
if exist "android\keystores\release-key.jks" (
    echo.
    echo ============================================
    echo [SUCCESS] Keystore Created!
    echo ============================================
    echo.
    echo Location: android\keystores\release-key.jks
    echo.
    dir "android\keystores\release-key.jks" | findstr "release-key.jks"
    echo.
    echo ============================================
    echo Keystore Details:
    echo ============================================
    echo Password: Judech-123
    echo Alias: acu-project-map-key
    echo Valid for: 10,000 days (27+ years)
    echo.
    echo ============================================
    echo Next Step:
    echo ============================================
    echo.
    echo Run: CHECK-SETUP.bat
    echo.
    echo Then: BUILD-APK-SIMPLE.bat
    echo.
) else (
    echo.
    echo [ERROR] Keystore file not created!
    echo.
    echo Expected: android\keystores\release-key.jks
    echo.
)

pause

