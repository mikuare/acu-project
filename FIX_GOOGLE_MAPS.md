# 🔧 Fix: Google Maps Not Showing

## Problem
You're seeing a blank map or error message because:
1. ❌ Google Maps library not installed (due to PowerShell restriction)
2. ❌ Missing .env file with API key

## Solution (Choose ONE method)

---

### ⭐ METHOD 1: Use the Batch File (EASIEST)

1. **Double-click** the file: `install-dependencies.bat`
2. Wait for installation to complete
3. Continue to step "After Installation" below

---

### METHOD 2: Use Command Prompt

1. Press `Win + R`, type `cmd`, press Enter
2. Navigate to your project:
   ```cmd
   cd "C:\Users\edujk\Desktop\project map\acu-project-map-123456-789"
   ```
3. Run:
   ```cmd
   npm install @react-google-maps/api @types/google.maps
   ```

---

### METHOD 3: Fix PowerShell (Advanced)

1. **Open PowerShell as Administrator**
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` and press Enter
4. Go back to your project folder and run:
   ```powershell
   npm install
   ```

---

## After Installation

### Step 1: Get Google Maps API Key

1. Go to: https://console.cloud.google.com/google/maps-apis
2. Sign in with your Google account
3. Click **"Create Project"** (or select existing project)
4. Enable these APIs:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API**
5. Go to **Credentials** → **Create Credentials** → **API Key**
6. **Copy your API key** (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX`)

### Step 2: Create .env File

1. In your project root folder, create a new file named: `.env` (no extension)
2. Open it with Notepad
3. Add this line (replace with YOUR key):
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
   ```
4. Save and close

**Example .env file:**
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
```

### Step 3: Restart Dev Server

1. **Stop** your current server (Ctrl+C in terminal)
2. **Start again**:
   ```cmd
   npm run dev
   ```
3. Open: http://localhost:8080/

---

## Verification Checklist

✅ Google Maps library installed
✅ .env file exists in project root
✅ .env file contains: `VITE_GOOGLE_MAPS_API_KEY=your_key_here`
✅ Dev server restarted after creating .env
✅ Maps JavaScript API enabled in Google Cloud Console

---

## Still Not Working?

### Check Browser Console:
1. Press `F12` in your browser
2. Click **Console** tab
3. Look for errors

### Common Errors & Fixes:

**"Google Maps API Key Missing"**
- → .env file not created or in wrong location
- → Variable name misspelled (must be exactly: `VITE_GOOGLE_MAPS_API_KEY`)
- → Dev server not restarted

**"This API project is not authorized to use this API"**
- → Maps JavaScript API not enabled in Google Cloud Console
- → Wrong API key copied

**"RefererNotAllowedMapError"**
- → API key has HTTP referrer restrictions
- → Add `http://localhost:8080/*` to allowed referrers in Google Cloud Console

**"OVER_QUERY_LIMIT"**
- → API key quota exceeded (unlikely on free tier)
- → Check Google Cloud Console billing

---

## Quick Test

After setup, you should see:
✅ Google Maps with satellite/terrain options
✅ Zoom controls
✅ Philippines map centered
✅ Project markers (colored circles)

---

## Need Help?

1. Check if `.env` file exists: `dir .env` (in command prompt)
2. Verify npm packages: `npm list @react-google-maps/api`
3. Check browser console (F12) for errors
4. Verify API key in Google Cloud Console
5. Make sure you restarted the dev server

---

## 💰 Cost Note

Google Maps is **FREE** for most small applications:
- $200 monthly credit (auto-applied)
- ~28,000 map loads per month FREE
- No credit card required for getting started

---

**After following these steps, your Google Maps should work perfectly! 🗺️**

