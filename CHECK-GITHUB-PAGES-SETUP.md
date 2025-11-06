# 🔍 Debugging "Failed to Fetch" Error

## Your Error

```
❌ Update Check Failed
Error: failed to fetch
```

This means the app **cannot reach** your GitHub Pages URL.

---

## ✅ Step-by-Step Fix

### **Step 1: Verify GitHub Pages is Enabled**

**Go to your repository:**
```
https://github.com/mikuare/qmaz-project-update
```

**Click "Settings" (top menu)**

**Click "Pages" (left sidebar)**

**You should see:**
```
✅ Your site is live at https://mikuare.github.io/qmaz-project-update/
```

**If you see "GitHub Pages is currently disabled":**
1. Under "Source", select "main" branch
2. Click "Save"
3. Wait 2-3 minutes

---

### **Step 2: Verify Files Exist in Repository**

**Your repository should have these files at the ROOT:**

```
qmaz-project-update/
  ├── app-release.apk     ← APK file (NO SPACES!)
  └── update.json         ← JSON file
```

**Check on GitHub:**
```
https://github.com/mikuare/qmaz-project-update
```

You should see both files listed.

---

### **Step 3: Test URLs Manually**

**Open these URLs in your browser:**

**URL 1: update.json**
```
https://mikuare.github.io/qmaz-project-update/update.json
```

**Should show:**
```json
{
  "latestVersion": "1.1",
  "versionCode": 2,
  "changelog": "...",
  "apkUrl": "https://mikuare.github.io/qmaz-project-update/app-release.apk",
  "releaseDate": "2025-11-03",
  "isCritical": false
}
```

**If you get 404 error:**
- GitHub Pages not enabled, OR
- File doesn't exist, OR
- Not deployed yet (wait 2-3 minutes)

**URL 2: APK file**
```
https://mikuare.github.io/qmaz-project-update/app-release.apk
```

**Should:**
- Start downloading the APK file, OR
- Show download prompt

**If you get 404 error:**
- File doesn't exist, OR
- Filename is wrong (has spaces?), OR
- Not deployed yet

---

### **Step 4: Use the Test Tool**

I created a test tool for you: `test-github-pages.html`

**How to use:**
1. Open `test-github-pages.html` in your browser (double-click it)
2. Click "Test update.json"
3. Click "Test APK URL"
4. Read the results!

This will show you **exactly** what's wrong.

---

## 🔧 Common Issues & Solutions

### **Issue 1: GitHub Pages Not Enabled**

**Symptoms:**
- 404 error on all URLs
- "failed to fetch" error

**Solution:**
1. Go to repository Settings → Pages
2. Enable Pages (select "main" branch)
3. Wait 2-3 minutes
4. Test URLs again

---

### **Issue 2: Files Not in Repository**

**Symptoms:**
- 404 error for specific files
- Other files work, but these don't

**Solution:**
1. Check repository on GitHub
2. Make sure files exist at root level
3. Push files if missing:
   ```bash
   cd "C:\Users\edujk\Desktop\project map update"
   git add app-release.apk update.json
   git commit -m "Add files"
   git push
   ```

---

### **Issue 3: Wrong Repository Name**

**Symptoms:**
- Everything looks correct, but URLs don't work

**Solution:**
1. Check your repository name on GitHub
2. Update the URL in your code:
   ```typescript
   // In src/hooks/useUpdateCheck.ts
   const UPDATE_JSON_URL = "https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/update.json";
   ```
3. Replace `YOUR-USERNAME` and `YOUR-REPO-NAME` with actual values

---

### **Issue 4: APK Filename Has Spaces**

**Symptoms:**
- update.json works
- APK URL doesn't work (404)

**Solution:**
1. Rename APK file (NO SPACES!):
   ```bash
   cd "C:\Users\edujk\Desktop\project map update"
   ren "qmaz project map v.2.apk" "app-release.apk"
   ```
2. Update update.json to match
3. Push changes

---

### **Issue 5: GitHub Pages Not Deployed Yet**

**Symptoms:**
- Just pushed changes
- URLs don't work yet
- Files exist in repository

**Solution:**
- **Wait 2-3 minutes** for GitHub to deploy
- Refresh the page
- Try again

---

## 📋 Quick Diagnostic Commands

### **Check if GitHub Pages is working:**

Open in browser:
```
https://mikuare.github.io/qmaz-project-update/
```

**Should show:**
- A GitHub Pages site (might be blank, that's OK), OR
- File listing, OR
- update.json content

**Should NOT show:**
- 404 error
- "There isn't a GitHub Pages site here"

---

### **Verify repository exists:**

Open in browser:
```
https://github.com/mikuare/qmaz-project-update
```

**Should show:**
- Your repository with files

**Should NOT show:**
- 404 error
- "This repository does not exist"

---

### **Test from command line (PowerShell):**

```powershell
# Test update.json
Invoke-WebRequest -Uri "https://mikuare.github.io/qmaz-project-update/update.json"

# Should show: StatusCode: 200
# If shows 404 → File doesn't exist or Pages not enabled
```

---

## 🎯 Most Likely Causes

Based on "failed to fetch" error:

1. **GitHub Pages not enabled** (80% of cases)
   - Fix: Enable in Settings → Pages
   
2. **Files don't exist** (15% of cases)
   - Fix: Push files to repository
   
3. **Not deployed yet** (5% of cases)
   - Fix: Wait 2-3 minutes

---

## ✅ Verification Checklist

Check ALL of these:

**Repository:**
- [ ] Repository exists: https://github.com/mikuare/qmaz-project-update
- [ ] Has file: `app-release.apk` (at root, NO SPACES in name!)
- [ ] Has file: `update.json` (at root)
- [ ] Latest changes pushed to GitHub

**GitHub Pages:**
- [ ] Settings → Pages shows "Your site is live at..."
- [ ] Waited 2-3 minutes after last push
- [ ] Clear browser cache (Ctrl+Shift+Delete)

**URLs Work:**
- [ ] https://mikuare.github.io/qmaz-project-update/update.json (shows JSON)
- [ ] https://mikuare.github.io/qmaz-project-update/app-release.apk (downloads file)

**Your App:**
- [ ] `CURRENT_VERSION_CODE = 1` in useUpdateCheck.ts
- [ ] `versionCode 1` in build.gradle
- [ ] Rebuilt APK after changes
- [ ] Phone has internet connection

---

## 🚀 Next Steps

1. **Test the URLs manually** in your browser:
   - https://mikuare.github.io/qmaz-project-update/update.json
   - https://mikuare.github.io/qmaz-project-update/app-release.apk

2. **Tell me what happens:**
   - ✅ Do they work?
   - ❌ Do you get 404 errors?
   - ⏳ Different error?

3. **If URLs work in browser:**
   - GitHub Pages is fine!
   - The issue is in your app
   - Might be CORS or network issue

4. **If URLs DON'T work in browser:**
   - GitHub Pages issue
   - Follow the solutions above
   - Enable Pages or push files

---

## 💡 Quick Test

**Open this in your browser NOW:**
```
https://mikuare.github.io/qmaz-project-update/update.json
```

**What do you see?**

A) JSON content (Good! ✅)
B) 404 error (Pages not enabled or file missing ❌)
C) Blank page (Wait 2 minutes, try again ⏳)
D) Different error (Tell me what it says 🔍)

**Reply with A, B, C, or D and I'll help you fix it!** 🎯

