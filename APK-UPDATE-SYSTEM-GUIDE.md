# 📱 APK Auto-Update System Guide

## Overview

This system allows your native Android APK users to automatically receive update notifications when a new version is released. It works by checking a JSON file hosted on GitHub Pages.

---

## ✅ What's Been Implemented

### 1. Update Check Hook (`src/hooks/useUpdateCheck.ts`)
- Checks for updates 5 seconds after app starts
- Only runs on native Android (not web/PWA)
- Compares current version with latest version from GitHub
- Provides detailed console logging for debugging

### 2. Update Prompt Component (`src/components/UpdatePrompt.tsx`)
- Beautiful gradient modal with update information
- Shows version number, release date, and changelog
- "Download Update" button opens APK in browser
- "Maybe Later" button for optional updates
- Critical updates cannot be dismissed

### 3. Integrated into App (`src/App.tsx`)
- Automatically displays when update is available
- Works globally across all pages

### 4. Capacitor Browser Plugin (`package.json`)
- Added `@capacitor/browser` for opening download links

---

## 🚀 How to Set Up the Update System

### Step 1: Create GitHub Repository for Updates

1. **Create a new GitHub repository:**
   - Go to: https://github.com/new
   - Repository name: `qmaz-project-update`
   - Description: `Update metadata and releases for QMAZ Project Map`
   - Make it **Public**
   - Click "Create repository"

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
   - Click "Save"

3. **Create the update.json file:**
   - In your repository, create a file named `update.json`
   - Use this template:

```json
{
  "latestVersion": "1.0.0",
  "versionCode": 1,
  "changelog": "🎉 Initial Release\n\n✨ Features:\n• Interactive map of Philippines\n• GPS location detection\n• Project management\n• Camera integration",
  "apkUrl": "https://github.com/mikuare/qmaz-project-update/releases/download/v1.0.0/qmaz-project-map-v1.0.0.apk",
  "releaseDate": "2025-10-27",
  "isCritical": false
}
```

4. **Commit and push** the file

5. **Wait 1-2 minutes** for GitHub Pages to deploy

6. **Verify it works:**
   - Open: `https://mikuare.github.io/qmaz-project-update/update.json`
   - You should see your JSON content

---

### Step 2: Update Version Code in Your App

**Before building each new APK**, update the version code:

#### A. In `android/app/build.gradle`:
```gradle
defaultConfig {
    applicationId "com.qmaz.projectmap"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 2        // <- INCREMENT this (was 1, now 2)
    versionName "1.1.0"  // <- UPDATE this (user-friendly version)
    testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    // ...
}
```

#### B. In `src/hooks/useUpdateCheck.ts`:
```typescript
// IMPORTANT: Update this to match build.gradle versionCode!
const CURRENT_VERSION_CODE = 2;  // <- MUST MATCH android/app/build.gradle
```

---

### Step 3: Release a New APK Version

When you have a new version ready:

#### 1. **Build the new APK:**
```bash
# Update version codes first (see Step 2)
# Then build:
npm run build
cd android
./gradlew assembleRelease
```

Your APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

#### 2. **Rename the APK:**
```
qmaz-project-map-v1.1.0.apk
```
(Use the version number from `versionName`)

#### 3. **Create a GitHub Release:**
- Go to: `https://github.com/mikuare/qmaz-project-update/releases/new`
- Tag version: `v1.1.0`
- Release title: `QMAZ Project Map v1.1.0`
- Description: Paste your changelog
- **Upload your APK file** (drag and drop)
- Click "Publish release"

#### 4. **Copy the APK download URL:**
After publishing, right-click the APK file in the release and copy the link.
It should look like:
```
https://github.com/mikuare/qmaz-project-update/releases/download/v1.1.0/qmaz-project-map-v1.1.0.apk
```

#### 5. **Update update.json:**
Edit the `update.json` file in your repository:

```json
{
  "latestVersion": "1.1.0",
  "versionCode": 2,
  "changelog": "✨ New Features:\n• GPS accuracy improvements\n• New update system\n• UI enhancements\n\n🐛 Bug Fixes:\n• Fixed map loading\n• Improved permissions",
  "apkUrl": "https://github.com/mikuare/qmaz-project-update/releases/download/v1.1.0/qmaz-project-map-v1.1.0.apk",
  "releaseDate": "2025-10-28",
  "isCritical": false
}
```

Commit and push the updated `update.json`.

#### 6. **Test the update:**
- Open the OLD version of your APK on a device
- Wait 5 seconds
- You should see the update prompt! 🎉

---

## 📋 Version Code Management

### Version Code vs Version Name

- **versionCode**: Internal integer that MUST increase with each release
  - Example: `1, 2, 3, 4, 5...`
  - Used by the update system to detect new versions
  
- **versionName**: User-friendly version string
  - Example: `"1.0.0", "1.1.0", "1.2.0", "2.0.0"`
  - Shown to users in the update prompt

### Quick Reference Table

| Release | versionCode | versionName | Description |
|---------|-------------|-------------|-------------|
| Initial | 1 | 1.0.0 | First release |
| Bug Fix | 2 | 1.0.1 | Minor fixes |
| Features | 3 | 1.1.0 | New features |
| Major | 4 | 2.0.0 | Major changes |

---

## 🎨 Update Prompt Features

### Optional Update
```json
{
  "isCritical": false  // Users can dismiss with "Maybe Later"
}
```

### Critical Update
```json
{
  "isCritical": true  // Users MUST update (no dismiss button)
}
```

### Changelog Formatting
```json
{
  "changelog": "✨ New Features:\n• Feature 1\n• Feature 2\n\n🐛 Bug Fixes:\n• Fix 1\n• Fix 2"
}
```

Use `\n` for new lines and `•` (bullet) for lists.

---

## 🔍 Testing the Update System

### Test Scenario 1: No Update Available
1. Current APK has `versionCode: 2`
2. `update.json` has `versionCode: 2`
3. **Result:** No update prompt shown ✅

### Test Scenario 2: Update Available
1. Current APK has `versionCode: 1`
2. `update.json` has `versionCode: 2`
3. **Result:** Update prompt shown after 5 seconds ✅

### Test Scenario 3: Critical Update
1. Set `"isCritical": true` in `update.json`
2. **Result:** Update prompt cannot be dismissed ✅

---

## 🐛 Troubleshooting

### Update prompt not showing?

**Check these:**

1. **Are you testing on native APK?**
   - Open Chrome DevTools (chrome://inspect)
   - Connect your Android device
   - Check console logs for: `🔍 Checking for updates...`
   - If you see `🌐 Web/PWA detected`, you're not on native APK

2. **Is the version code correct?**
   ```typescript
   // In src/hooks/useUpdateCheck.ts
   const CURRENT_VERSION_CODE = 1;  // Must match build.gradle
   ```
   
   ```gradle
   // In android/app/build.gradle
   versionCode 1  // Must match useUpdateCheck.ts
   ```

3. **Is update.json accessible?**
   - Open in browser: `https://mikuare.github.io/qmaz-project-update/update.json`
   - Should return JSON, not 404

4. **Is versionCode higher in update.json?**
   - APK has `versionCode: 1`
   - `update.json` must have `versionCode: 2` or higher

5. **Check console logs:**
   ```
   🔍 Checking for updates...
   📱 Current version code: 1
   📦 Latest version info: { versionCode: 2, ... }
   🎉 New update available!
   ```

### APK download not working?

1. **Check APK URL is correct**
   - Right-click APK in GitHub release → Copy link
   - Paste in `update.json` → `apkUrl`

2. **Check file is public**
   - Repository must be public
   - Release must be published (not draft)

3. **Test download manually**
   - Open `apkUrl` in browser
   - Should start downloading APK

---

## 📦 Quick Checklist for Each Release

- [ ] Update `versionCode` in `android/app/build.gradle`
- [ ] Update `versionName` in `android/app/build.gradle`
- [ ] Update `CURRENT_VERSION_CODE` in `src/hooks/useUpdateCheck.ts`
- [ ] Build new APK
- [ ] Rename APK with version number
- [ ] Create GitHub release with tag
- [ ] Upload APK to release
- [ ] Copy APK download URL
- [ ] Update `update.json` with new version info
- [ ] Commit and push `update.json`
- [ ] Test on old APK version

---

## 🎯 Example Workflow

### Current State:
- APK version: 1.0.0 (versionCode: 1)
- Users have this installed

### New Release (1.1.0):

1. **Code changes:**
   ```gradle
   // android/app/build.gradle
   versionCode 2
   versionName "1.1.0"
   ```
   
   ```typescript
   // src/hooks/useUpdateCheck.ts
   const CURRENT_VERSION_CODE = 2;
   ```

2. **Build APK:**
   ```bash
   npm run build
   cd android
   ./gradlew assembleRelease
   ```

3. **GitHub Release:**
   - Tag: `v1.1.0`
   - Upload: `qmaz-project-map-v1.1.0.apk`
   - Get URL: `https://github.com/mikuare/qmaz-project-update/releases/download/v1.1.0/qmaz-project-map-v1.1.0.apk`

4. **Update metadata:**
   ```json
   {
     "latestVersion": "1.1.0",
     "versionCode": 2,
     "changelog": "• GPS improvements\n• Bug fixes",
     "apkUrl": "https://github.com/mikuare/qmaz-project-update/releases/download/v1.1.0/qmaz-project-map-v1.1.0.apk",
     "releaseDate": "2025-10-28",
     "isCritical": false
   }
   ```

5. **Result:**
   - Users with v1.0.0 (versionCode 1) will see update prompt
   - Users with v1.1.0 (versionCode 2) will not see prompt

---

## 💡 Pro Tips

1. **Always increment versionCode** - even for tiny fixes
2. **Use descriptive changelogs** - users appreciate knowing what's new
3. **Test before releasing** - install old version, verify update prompt works
4. **Keep old releases** - in case you need to rollback
5. **Use semantic versioning** - Major.Minor.Patch (e.g., 1.2.3)

---

## 🔒 Security Notes

- APK downloads go through GitHub (trusted source)
- HTTPS ensures secure downloads
- Users must manually confirm APK installation (Android security)
- Update check fails silently (doesn't break app if GitHub is down)

---

## 📚 Related Files

- `src/hooks/useUpdateCheck.ts` - Update checking logic
- `src/components/UpdatePrompt.tsx` - Update UI
- `src/App.tsx` - Integration point
- `android/app/build.gradle` - Version configuration
- `update-template/update.json` - Template for your GitHub repo

---

## ✅ Next Steps

1. Create GitHub repository: `qmaz-project-update`
2. Enable GitHub Pages
3. Upload initial `update.json`
4. Build your first versioned APK
5. Create first release
6. Test the update system!

**Your update system is now ready!** 🎉

When you build your next APK version, users will automatically be notified!

