# 🔧 Quick Fix - Your Setup Issues

## Problem Summary

Your update notification isn't showing because of **2 critical issues**:

1. ❌ APK filename has spaces: `"qmaz project map v.2.apk"`
2. ❌ Version mismatch between code and build.gradle

---

## ⚡ QUICK FIX (Do This Now)

### **Step 1: Fix Your GitHub Repository**

Go to: `C:\Users\edujk\Desktop\project map update`

**Rename your APK file (remove spaces):**
```bash
# If your file is named: "qmaz project map v.2.apk"
# Rename it to: "app-release.apk"

ren "qmaz project map v.2.apk" "app-release.apk"
```

**Update update.json:**
```json
{
  "latestVersion": "1.1",
  "versionCode": 2,
  "changelog": "✨ New Features:\n• Improved update system\n• Enhanced UI\n• Bug fixes",
  "apkUrl": "https://mikuare.github.io/qmaz-project-update/app-release.apk",
  "releaseDate": "2025-11-03",
  "isCritical": false
}
```

**Push to GitHub:**
```bash
cd "C:\Users\edujk\Desktop\project map update"
git add .
git commit -m "Fix APK filename and update.json"
git push
```

**Wait 2-3 minutes for GitHub Pages to update.**

---

### **Step 2: Build Test APK (Version 1)**

**Make sure versions match!**

**File: `src/hooks/useUpdateCheck.ts`**
```typescript
const CURRENT_VERSION_CODE = 1;  // ← Must be 1 for testing
```

**File: `android/app/build.gradle`**
```gradle
versionCode 1        // ← Must be 1 (same as above)
versionName "1.0"
```

**Build the APK:**
```bash
npm run build
npx cap sync android
cd android
gradlew assembleRelease
```

**Install on your phone:**
```
Copy: android\app\build\outputs\apk\release\app-release.apk
Install on your Android device
```

---

### **Step 3: Test the Update Detection**

**On your phone:**
1. Force close the app
2. Make sure internet is connected
3. Open the app

**Watch for toast notifications at the bottom of screen:**

**After 2 seconds, you'll see ONE of these:**

✅ **SUCCESS:**
```
┌─────────────────────────────────────┐
│ 🔍 Checking for updates...         │
│ Current version: 1                  │
└─────────────────────────────────────┘

... then ...

┌──────────────────────────────────────────┐
│ 🎉 Update Found!                         │
│ New version 1.1 available! Showing...    │
└──────────────────────────────────────────┘

... AND the big slide-down notification! 🎉
```

❌ **Already Up to Date:**
```
┌────────────────────────────────────┐
│ ✅ Already Up to Date              │
│ You have version 1 (Latest: 1)     │
└────────────────────────────────────┘
```

**Meaning:** GitHub Pages hasn't updated yet or still shows old version.
**Fix:** Wait 2 more minutes, force close and try again.

❌ **Update Check Failed:**
```
┌──────────────────────────────────┐
│ ❌ Update Check Failed           │
│ Error: Failed to fetch...        │
└──────────────────────────────────┘
```

**Meaning:** Network error or URL is wrong.
**Fix:** Check internet connection and verify the GitHub Pages URL.

---

## 📋 Verification Checklist

Before testing, check ALL of these:

**GitHub Repository (`C:\Users\edujk\Desktop\project map update\`):**
- [ ] Has file named `app-release.apk` (NO SPACES!)
- [ ] Has file named `update.json`
- [ ] Pushed to GitHub successfully
- [ ] Waited 2-3 minutes after push

**Verify URLs work:**
- [ ] https://mikuare.github.io/qmaz-project-update/update.json (shows version 2)
- [ ] https://mikuare.github.io/qmaz-project-update/app-release.apk (downloads file)

**Your Phone:**
- [ ] APK version **1.0** installed (not 1.1!)
- [ ] Has internet connection (WiFi or mobile data)
- [ ] App is completely closed before testing

**Your Code:**
- [ ] `src/hooks/useUpdateCheck.ts` has `CURRENT_VERSION_CODE = 1`
- [ ] `android/app/build.gradle` has `versionCode 1`
- [ ] These two numbers MATCH!
- [ ] Rebuilt APK after changes

---

## 🎯 Expected Result

When everything is correct:

1. Open app
2. Wait 2 seconds
3. See toast: "🔍 Checking for updates..."
4. See toast: "🎉 Update Found!"
5. **BIG slide-down notification appears!**

---

## 💡 Common Mistakes

### **Mistake 1: APK filename has spaces**
```
❌ "qmaz project map v.2.apk"
✅ "app-release.apk"
```

### **Mistake 2: Version mismatch**
```
❌ useUpdateCheck.ts: CURRENT_VERSION_CODE = 2
   build.gradle: versionCode 1
   (They don't match!)

✅ useUpdateCheck.ts: CURRENT_VERSION_CODE = 1
   build.gradle: versionCode 1
   (They match!)
```

### **Mistake 3: Testing with wrong version**
```
❌ Installed v2, checking for v2 update
   (No update detected because 2 = 2)

✅ Installed v1, checking for v2 update
   (Update detected because 2 > 1)
```

### **Mistake 4: Didn't wait for GitHub Pages**
```
❌ Pushed to GitHub, tested immediately
   (GitHub Pages needs 2-3 minutes to deploy)

✅ Pushed to GitHub, waited 3 minutes, then tested
   (GitHub Pages is ready)
```

---

## 🚀 Quick Commands

### **Fix APK Filename:**
```bash
cd "C:\Users\edujk\Desktop\project map update"
ren "qmaz project map v.2.apk" "app-release.apk"
git add .
git commit -m "Fix filename"
git push
```

### **Build Test APK (v1):**
```bash
# First: Set CURRENT_VERSION_CODE = 1 in useUpdateCheck.ts
# And: Set versionCode 1 in build.gradle

npm run build
npx cap sync android
cd android
gradlew assembleRelease
```

### **Verify GitHub Pages:**
```bash
# Open these URLs in browser:
start https://mikuare.github.io/qmaz-project-update/update.json
start https://mikuare.github.io/qmaz-project-update/app-release.apk
```

---

## ✅ Summary

**What I fixed in the code:**
- ✅ Added visible toast notifications (no Chrome DevTools needed!)
- ✅ Toasts show at every step: checking → found/not found → error
- ✅ Super high z-index (notification appears above map)
- ✅ Detailed console logs (if you want to check)

**What you need to fix:**
1. Rename APK file (remove spaces)
2. Update update.json with correct filename
3. Push to GitHub
4. Make sure versions match in code and build.gradle
5. Wait 2-3 minutes after pushing
6. Test with v1 APK installed

**Follow the steps above and you'll see the toast notifications showing exactly what's happening!** 🎉

