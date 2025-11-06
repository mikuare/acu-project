# 🚀 Release New APK Version - Complete Guide

## Step-by-Step Process to Build and Release Updates

This guide shows you **exactly what to do** when you have new features or fixes and need to release a new APK version to your users.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Your code changes are complete and tested
- ✅ Java 17 installed
- ✅ Android SDK installed
- ✅ GitHub repository: `qmaz-project-update` (created with GitHub Pages enabled)
- ✅ Keystore file exists at: `android/keystores/release-key.jks`

---

## 🔢 STEP 1: Update Version Codes

### Files to Edit:

#### **1. `android/app/build.gradle`**

Open the file and find this section (around line 10-11):

```gradle
defaultConfig {
    applicationId "com.qmaz.projectmap"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1        // ← CHANGE THIS
    versionName "1.0.0"  // ← CHANGE THIS
    testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    // ...
}
```

**Update these two values:**

| Release Type | versionCode | versionName | Example |
|--------------|-------------|-------------|---------|
| Initial | 1 | "1.0.0" | First release |
| Bug Fix | 2 | "1.0.1" | Small fixes |
| New Features | 3 | "1.1.0" | Added features |
| Major Update | 4 | "2.0.0" | Big changes |

**Rules:**
- `versionCode` must **always increase** by at least 1
- `versionName` is what users see (use semantic versioning)

**Example update:**
```gradle
versionCode 2        // Was 1, now 2
versionName "1.1.0"  // Was "1.0.0", now "1.1.0"
```

---

#### **2. `src/hooks/useUpdateCheck.ts`**

Open the file and find this line (around line 6):

```typescript
// IMPORTANT: Update this every time you build a new APK!
// This should match android/app/build.gradle -> versionCode
const CURRENT_VERSION_CODE = 1;  // ← CHANGE THIS
```

**Update to match the versionCode from build.gradle:**

```typescript
const CURRENT_VERSION_CODE = 2;  // Must match build.gradle!
```

⚠️ **CRITICAL:** These two numbers MUST match:
- `android/app/build.gradle` → `versionCode 2`
- `src/hooks/useUpdateCheck.ts` → `CURRENT_VERSION_CODE = 2`

---

## 🔨 STEP 2: Build the Web App

Run this command in your project root:

```bash
npm run build
```

**Expected output:**
```
✓ 1904 modules transformed.
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.css      XX.XX kB
dist/assets/index-XXXXX.js      XXX.XX kB
✓ built in X.XXs
```

✅ If successful, you'll see a `dist` folder created.

❌ If it fails:
- Check for TypeScript errors
- Run: `npm install`
- Try again

---

## 📱 STEP 3: Sync with Android

Run this command:

```bash
npx cap sync android
```

**Or if that doesn't work:**

```bash
npm install -g @capacitor/cli
cap sync android
```

**Expected output:**
```
✔ Copying web assets from dist to android/app/src/main/assets/public in X.XXms
✔ Creating capacitor.config.json in android/app/src/main/assets in X.XXms
✔ copy android in X.XXXs
✔ Updating Android plugins in X.XXms
```

✅ This copies your web app into the Android project.

---

## 🏗️ STEP 4: Build Signed Release APK

Navigate to the Android directory:

```bash
cd android
```

Build the APK:

```bash
gradlew assembleRelease
```

**Or on Linux/Mac:**

```bash
./gradlew assembleRelease
```

**Expected output:**
```
BUILD SUCCESSFUL in Xs
```

✅ **Your APK will be created at:**
```
android/app/build/outputs/apk/release/app-release.apk
```

❌ If it fails with "Java version" error:
- Make sure Java 17 is installed
- Check `android/gradle.properties` has: `org.gradle.java.home=C:\\Program Files\\Java\\jdk-17`

---

## 📦 STEP 5: Rename and Move the APK

### 5.1 Find the APK

Go to:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 5.2 Rename it

Rename to include the version (use the `versionName` from Step 1):

```
qmaz-project-map-v1.1.0.apk
```

**Naming format:** `qmaz-project-map-v{versionName}.apk`

### 5.3 Move to a safe location (optional)

Copy it to your Desktop or a releases folder for safekeeping.

---

## 📤 STEP 6: Create GitHub Release

### 6.1 Go to Releases Page

Open in browser:
```
https://github.com/mikuare/qmaz-project-update/releases/new
```

### 6.2 Fill in Release Details

**Tag version:** (must match versionName)
```
v1.1.0
```

**Release title:**
```
QMAZ Project Map v1.1.0
```

**Description:** Write your changelog (what's new). Example:

```markdown
## ✨ New Features
- GPS location accuracy improvements (30s timeout, 300m accuracy)
- New update notification system
- PWA install prompt with QMAZ branding

## 🐛 Bug Fixes
- Fixed Mapbox token missing in native APK
- Fixed location permissions not requesting on first install
- Improved Philippines bounds detection

## 🎨 Improvements
- Rebranded to QMAZ Holdings Inc.
- Updated app icons and logos
- Better user feedback messages
```

### 6.3 Upload the APK

Drag and drop your renamed APK file:
```
qmaz-project-map-v1.1.0.apk
```

### 6.4 Publish

Click **"Publish release"** (NOT "Save draft")

---

## 🔗 STEP 7: Get the APK Download URL

After publishing, you'll see your APK in the release.

**Right-click the APK filename** → **Copy link address**

The URL should look like:
```
https://github.com/mikuare/qmaz-project-update/releases/download/v1.1.0/qmaz-project-map-v1.1.0.apk
```

📋 Copy this URL - you'll need it in the next step!

---

## 📝 STEP 8: Update update.json

### 8.1 Go to Your Update Repository

Open:
```
https://github.com/mikuare/qmaz-project-update
```

### 8.2 Edit update.json

Click on `update.json` → Click the **pencil icon** (Edit)

### 8.3 Update the Content

Replace with your new version info:

```json
{
  "latestVersion": "1.1.0",
  "versionCode": 2,
  "changelog": "✨ New Features:\n• GPS location improvements (30s timeout, 300m accuracy)\n• Auto-update system for APK\n• PWA install prompt\n\n🐛 Bug Fixes:\n• Fixed Mapbox token in native APK\n• Fixed location permissions\n\n🎨 Improvements:\n• Rebranded to QMAZ Holdings Inc.\n• Updated app icons",
  "apkUrl": "https://github.com/mikuare/qmaz-project-update/releases/download/v1.1.0/qmaz-project-map-v1.1.0.apk",
  "releaseDate": "2025-10-28",
  "isCritical": false
}
```

**Fields to update:**

| Field | Value | Example |
|-------|-------|---------|
| `latestVersion` | Your versionName | `"1.1.0"` |
| `versionCode` | Your versionCode (number) | `2` |
| `changelog` | What's new (use `\n` for new lines) | See above |
| `apkUrl` | APK download URL from Step 7 | Full GitHub URL |
| `releaseDate` | Today's date | `"2025-10-28"` |
| `isCritical` | Force update? | `false` (or `true`) |

### 8.4 Commit the Changes

- Scroll down
- Commit message: `Update to version 1.1.0`
- Click **"Commit changes"**

---

## ✅ STEP 9: Verify Everything Works

### 9.1 Check GitHub Pages

Open in browser:
```
https://mikuare.github.io/qmaz-project-update/update.json
```

You should see your updated JSON with the new version.

⏱️ **Note:** GitHub Pages may take 1-2 minutes to update.

### 9.2 Test the APK

1. Download the APK from the GitHub release
2. Install it on your Android device
3. Open the app - it should work perfectly!

### 9.3 Test the Update System

1. Keep the OLD version APK (e.g., v1.0.0) on another device
2. Open the old version
3. Wait 5 seconds
4. 🎉 You should see the update prompt!
5. Click "Download Update"
6. It should open the new APK download

---

## 📊 Version Tracking Table

Keep track of your releases:

| Date | versionCode | versionName | Description | APK Size |
|------|-------------|-------------|-------------|----------|
| 2025-10-27 | 1 | 1.0.0 | Initial release | ~XX MB |
| 2025-10-28 | 2 | 1.1.0 | GPS improvements, update system | ~XX MB |
| TBD | 3 | 1.2.0 | Next update | - |

---

## 🎯 Quick Command Summary

For copy-paste convenience:

```bash
# 1. Build web app
npm run build

# 2. Sync with Android
npx cap sync android

# 3. Build APK
cd android
gradlew assembleRelease

# 4. APK location
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔄 Update Types and Version Numbering

### Semantic Versioning: `MAJOR.MINOR.PATCH`

**1.0.0** → First release

**1.0.1** → **Patch** (Bug fixes only)
- Fixed crashes
- Fixed typos
- Small corrections
- versionCode: increment by 1

**1.1.0** → **Minor** (New features)
- Added new features
- Improvements
- Non-breaking changes
- versionCode: increment by 1

**2.0.0** → **Major** (Breaking changes)
- Complete redesign
- Major new features
- Breaking changes
- versionCode: increment by 1

---

## 📝 Changelog Writing Tips

### Good Changelog Example:

```markdown
✨ New Features:
• GPS accuracy improvements with 30-second timeout
• Automatic update notification system
• PWA install prompt for web users

🐛 Bug Fixes:
• Fixed Mapbox token missing in installed APK
• Fixed camera permissions not requesting
• Resolved "Outside Philippines" false detections

🎨 UI/UX Improvements:
• Rebranded to QMAZ Holdings Inc.
• Updated app icon with earth logo
• Better error messages for GPS

⚡ Performance:
• Faster map loading
• Reduced APK size by 2MB
```

### For update.json (use `\n` for line breaks):

```json
"changelog": "✨ New Features:\n• GPS accuracy improvements\n• Auto-update system\n\n🐛 Bug Fixes:\n• Fixed Mapbox token\n• Fixed permissions\n\n🎨 Improvements:\n• Rebranded to QMAZ\n• Updated icons"
```

---

## 🐛 Troubleshooting

### ❌ Build fails with "Java version" error

**Solution:**
```bash
# Check Java version
java -version

# Should show: java version "17.0.16" or similar
# If not, install Java 17 JDK
```

Edit `android/gradle.properties`:
```properties
org.gradle.java.home=C:\\Program Files\\Java\\jdk-17
```

---

### ❌ APK not signed / shows as unsigned

**Check:**
1. `android/gradle.properties` has signing config
2. Keystore file exists at `android/keystores/release-key.jks`
3. `android/app/build.gradle` has `signingConfig signingConfigs.release`

---

### ❌ Update prompt not showing on old APK

**Check:**
1. Old APK has lower versionCode (e.g., 1)
2. update.json has higher versionCode (e.g., 2)
3. GitHub Pages URL works: `https://mikuare.github.io/qmaz-project-update/update.json`
4. Wait 5 seconds after opening the app
5. Make sure you're testing on NATIVE APK (not web/PWA)

**Debug:**
- Connect device to Chrome DevTools: `chrome://inspect`
- Check console logs for: `🔍 Checking for updates...`

---

### ❌ Can't install APK - "App not installed" or "Parse error"

**Solutions:**
1. **Uninstall old version first**
2. **Enable "Install from unknown sources"** in Android settings
3. **Make sure APK is fully downloaded** (not corrupted)
4. **Check if APK is properly signed** (see above)
5. **Restart device** and try again

---

### ❌ update.json not updating on GitHub Pages

**Solutions:**
1. **Wait 1-2 minutes** for GitHub Pages to deploy
2. **Clear browser cache:** Ctrl+Shift+Delete
3. **Try incognito/private window**
4. **Check repository is PUBLIC**
5. **Check GitHub Pages is enabled** in repository Settings → Pages

---

## 💡 Best Practices

### ✅ DO:
- ✅ Always increment versionCode (even for tiny changes)
- ✅ Test the new APK before releasing
- ✅ Test the update prompt with old APK
- ✅ Write clear, descriptive changelogs
- ✅ Keep backups of all APK versions
- ✅ Document each release

### ❌ DON'T:
- ❌ Skip version code increments
- ❌ Forget to update both files (build.gradle AND useUpdateCheck.ts)
- ❌ Release without testing
- ❌ Use the same versionCode for different releases
- ❌ Make update.json repository private

---

## 📅 Release Checklist

Print this or keep it handy:

```
BEFORE BUILDING:
[ ] Code changes complete and tested
[ ] Updated android/app/build.gradle (versionCode + versionName)
[ ] Updated src/hooks/useUpdateCheck.ts (CURRENT_VERSION_CODE)
[ ] Both version codes MATCH

BUILD PROCESS:
[ ] npm run build (successful)
[ ] npx cap sync android (successful)
[ ] cd android
[ ] gradlew assembleRelease (successful)
[ ] APK created at android/app/build/outputs/apk/release/

RELEASE PROCESS:
[ ] Renamed APK with version number
[ ] Created GitHub release with correct tag
[ ] Uploaded APK to release
[ ] Copied APK download URL
[ ] Updated update.json with new version info
[ ] Committed update.json changes
[ ] Verified GitHub Pages URL works

TESTING:
[ ] Downloaded and installed new APK
[ ] New APK works correctly
[ ] Tested update prompt on old APK version
[ ] Update prompt appears after 5 seconds
[ ] Download button opens correct APK
[ ] Installation successful

DOCUMENTATION:
[ ] Updated version tracking table
[ ] Documented changes
[ ] Notified team/users

✅ RELEASE COMPLETE!
```

---

## 🎉 You're Done!

After completing all steps:

1. ✅ New APK is built and released
2. ✅ Users with old versions will see update prompt
3. ✅ Users can download and install new version
4. ✅ Everything is tracked and documented

**For your next update, just repeat these steps with the next version number!**

---

## 📚 Quick Reference

| What | Where | Action |
|------|-------|--------|
| Version Code | `android/app/build.gradle` | Increment number |
| Version Code | `src/hooks/useUpdateCheck.ts` | Match build.gradle |
| Version Name | `android/app/build.gradle` | Update string |
| Build Web | Project root | `npm run build` |
| Sync Android | Project root | `npx cap sync android` |
| Build APK | `android/` folder | `gradlew assembleRelease` |
| APK Output | `android/app/build/outputs/apk/release/` | Copy and rename |
| GitHub Release | `github.com/mikuare/qmaz-project-update` | Create release |
| Update JSON | `update.json` in repo | Edit and commit |

---

## 🆘 Need Help?

If you encounter issues:
1. Check the Troubleshooting section above
2. Review the error messages carefully
3. Check console logs (for web) or Logcat (for Android)
4. Verify all files are saved
5. Try cleaning and rebuilding

---

**Last Updated:** October 28, 2025  
**Guide Version:** 1.0  
**For:** QMAZ Project Map Android APK Releases

