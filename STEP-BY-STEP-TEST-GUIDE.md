# 🔍 Step-by-Step Testing Guide - Update Notification

## ⚠️ CRITICAL ISSUES FOUND IN YOUR PROCESS

### **Issue 1: APK Filename Has Spaces**
```json
"apkUrl": "https://mikuare.github.io/qmaz-project-update/qmaz project map v.2.apk"
                                                          ^^^ SPACES HERE ^^^
```

**Problem:** URLs cannot have spaces! This breaks the download.

**Solution:** Rename the file without spaces:
```
OLD: qmaz project map v.2.apk
NEW: qmaz-project-map-v2.apk
  OR: app-release.apk
```

### **Issue 2: Wrong Testing Order**
You're changing both versions at the same time, which is confusing!

---

## ✅ CORRECT TESTING PROCESS

Let me walk you through the **exact correct steps**:

---

## 📱 **Phase 1: Build "Old" Version (v1) - Already Done ✓**

This is the version users currently have installed.

### **Step 1.1: Set Version 1**

**File: `src/hooks/useUpdateCheck.ts`**
```typescript
const CURRENT_VERSION_CODE = 1;
```

**File: `android/app/build.gradle`**
```gradle
versionCode 1
versionName "1.0"
```

### **Step 1.2: Build APK v1**
```bash
npm run build
npx cap sync android
cd android
gradlew assembleRelease
```

### **Step 1.3: Install APK v1 on Your Phone**
```
Copy: android\app\build\outputs\apk\release\app-release.apk
Install on phone
```

**✅ This is done - you have v1 installed on your phone!**

---

## 🚀 **Phase 2: Prepare "New" Version (v2) for Download**

This is the version users will download when they see the update notification.

### **Step 2.1: Set Version 2**

**File: `src/hooks/useUpdateCheck.ts`**
```typescript
const CURRENT_VERSION_CODE = 2;
```

**File: `android/app/build.gradle`**
```gradle
versionCode 2
versionName "1.1"
```

### **Step 2.2: Build APK v2**
```bash
npm run build
npx cap sync android
cd android
gradlew assembleRelease
```

### **Step 2.3: Copy APK v2 to GitHub Pages Folder**

```bash
# Copy the new APK
copy android\app\build\outputs\apk\release\app-release.apk "C:\Users\edujk\Desktop\project map update\app-release.apk"

# IMPORTANT: Rename it to remove spaces!
# The file should be named: app-release.apk (NO SPACES)
```

**⚠️ CRITICAL:** The filename must be **exactly** `app-release.apk` with **NO SPACES**!

### **Step 2.4: Update the update.json File**

**File: `C:\Users\edujk\Desktop\project map update\update.json`**
```json
{
  "latestVersion": "1.1",
  "versionCode": 2,
  "changelog": "✨ New Features:\n• Improved update notification\n• Enhanced GPS accuracy\n• UI improvements",
  "apkUrl": "https://mikuare.github.io/qmaz-project-update/app-release.apk",
  "releaseDate": "2025-11-03",
  "isCritical": false
}
```

**NOTICE:** 
- ✅ `"apkUrl": "...app-release.apk"` (NO SPACES!)
- ✅ `versionCode: 2` (higher than installed v1)

### **Step 2.5: Push to GitHub**

```bash
cd "C:\Users\edujk\Desktop\project map update"

# Add all files
git add .

# Commit
git commit -m "Release v1.1 - Version 2"

# Push to GitHub
git push
```

### **Step 2.6: Wait for GitHub Pages to Deploy**

**Wait 2-3 minutes**, then verify:

**1. Check update.json:**
Open in browser: https://mikuare.github.io/qmaz-project-update/update.json

Should show:
```json
{
  "latestVersion": "1.1",
  "versionCode": 2,
  ...
}
```

**2. Check APK is downloadable:**
Open in browser: https://mikuare.github.io/qmaz-project-update/app-release.apk

Should download the APK file (not show 404 error).

**✅ If both work, GitHub Pages is ready!**

---

## 🧪 **Phase 3: Test the Update Notification**

Now test if the update notification appears!

### **Step 3.1: Open the Old APK (v1) on Your Phone**

**IMPORTANT:** You should have the **OLD version 1** installed from Phase 1.

**DO NOT install v2 yet!** We need to test if v1 detects the v2 update.

### **Step 3.2: Force Close and Reopen**

1. Force close the app (Settings → Apps → QMAZ Project Map → Force Stop)
2. Make sure you have internet connection (WiFi or mobile data)
3. Open the app again

### **Step 3.3: What You Should See (Now with Visible Toasts!)**

After opening the app, you'll see **visible toast notifications** at the bottom of screen:

**After 2 seconds:**
```
┌────────────────────────────────┐
│ 🔍 Checking for updates...    │
│ Current version: 1             │
└────────────────────────────────┘
```

**Then ONE of these:**

**✅ SUCCESS - Update Found:**
```
┌────────────────────────────────────────┐
│ 🎉 Update Found!                      │
│ New version 1.1 available! Showing... │
└────────────────────────────────────────┘
```

**THEN the big slide-down notification should appear! 🎉**

**OR**

**❌ Already Up to Date:**
```
┌──────────────────────────────────────┐
│ ✅ Already Up to Date                │
│ You have version 1 (Latest: 1)       │
└──────────────────────────────────────┘
```

This means GitHub Pages still shows old version or didn't update yet.

**OR**

**❌ Error:**
```
┌──────────────────────────────────┐
│ ❌ Update Check Failed           │
│ Error: Failed to fetch...        │
└──────────────────────────────────┘
```

This means network error or GitHub Pages is not accessible.

---

## 🎯 **If You See "Update Found!" Toast But NO Slide-Down Notification**

This means the update was detected, but the UI isn't showing. Let me add a test button.

---

## 🔧 **Phase 4: Final Check - Verify Your Files**

### **Check 1: Verify GitHub Pages Files**

Your repository should have exactly these 2 files:

```
C:\Users\edujk\Desktop\project map update\
  ├── app-release.apk        ← The APK file (NO SPACES in name!)
  └── update.json            ← The JSON file
```

### **Check 2: Verify update.json Content**

Open: `C:\Users\edujk\Desktop\project map update\update.json`

Must be **exactly**:
```json
{
  "latestVersion": "1.1",
  "versionCode": 2,
  "changelog": "✨ New Features:\n• Improved update notification\n• Enhanced GPS accuracy\n• UI improvements",
  "apkUrl": "https://mikuare.github.io/qmaz-project-update/app-release.apk",
  "releaseDate": "2025-11-03",
  "isCritical": false
}
```

**Check:**
- ✅ `versionCode: 2` (number, not string)
- ✅ `apkUrl` ends with `/app-release.apk` (NO SPACES!)
- ✅ No trailing commas
- ✅ Valid JSON format

### **Check 3: Verify APK v1 is Installed**

On your phone, the installed app should be **Version 1.0**.

To verify: Settings → Apps → QMAZ Project Map → App Info (should show version 1.0 somewhere).

---

## 📋 **Complete Checklist**

Before testing, verify **ALL** of these:

**GitHub Pages:**
- [ ] Repository has `app-release.apk` (no spaces in filename!)
- [ ] Repository has `update.json`
- [ ] Pushed to GitHub successfully
- [ ] Waited 2-3 minutes for deployment
- [ ] https://mikuare.github.io/qmaz-project-update/update.json is accessible
- [ ] https://mikuare.github.io/qmaz-project-update/app-release.apk downloads successfully
- [ ] `update.json` shows `versionCode: 2`

**Phone:**
- [ ] APK **version 1** is installed (the old version)
- [ ] **NOT** version 2 (don't install v2 yet!)
- [ ] Phone has internet connection (WiFi or mobile data)
- [ ] App is force-closed before testing

**Code:**
- [ ] Latest code changes applied (with toast notifications)
- [ ] Rebuilt APK v1 with `CURRENT_VERSION_CODE = 1`

---

## 🚀 **Expected Result**

When you open the v1 APK:

1. **App opens** (splash screen)
2. **After 2 seconds** → Toast: "🔍 Checking for updates..."
3. **After 1 second** → Toast: "🎉 Update Found!"
4. **Immediately** → **Big slide-down notification appears:**

```
╔════════════════════════════════╗
║  🎁              [6s] [X]      ║
║                                ║
║   🎉 Update Available          ║
║                                ║
║   New Version: 1.1             ║
║   Released: Nov 3, 2025        ║
║                                ║
║   📝 What's New:               ║
║   • Improved update notify...  ║
║   • Enhanced GPS accuracy      ║
║                                ║
║ [Install Now]    [  Later  ]   ║
╚════════════════════════════════╝
```

---

## 💡 **Quick Commands**

### **Fix APK Filename (Remove Spaces):**

```bash
cd "C:\Users\edujk\Desktop\project map update"

# If your file has spaces, rename it:
ren "qmaz project map v.2.apk" "app-release.apk"

# Update git
git add .
git commit -m "Fix APK filename - remove spaces"
git push
```

### **Rebuild with Toast Notifications:**

```bash
# Make sure CURRENT_VERSION_CODE = 1 in useUpdateCheck.ts
npm run build
npx cap sync android
cd android
gradlew assembleRelease

# Install on phone for testing
```

---

## 🎯 **Next Steps**

1. **Apply the code changes I just made** (adds visible toast notifications)
2. **Rebuild APK v1** with `CURRENT_VERSION_CODE = 1`
3. **Install it on your phone**
4. **Fix the APK filename** in your GitHub repo (remove spaces!)
5. **Push to GitHub**
6. **Wait 2-3 minutes**
7. **Open the app and watch for toast notifications!**

The toast notifications will show you **exactly** what's happening without needing Chrome DevTools! 🎉

