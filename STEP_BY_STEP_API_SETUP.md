# 🗺️ Step-by-Step Guide: Get Google Maps API Key

## ⏱️ Time Required: 5-10 minutes

Follow these steps exactly and you'll have Google Maps working!

---

## 📋 PART 1: Get Your Google Maps API Key

### Step 1: Go to Google Cloud Console
1. Open your web browser
2. Go to: **https://console.cloud.google.com/**
3. Sign in with your Google account (Gmail)

---

### Step 2: Create a New Project
1. At the top of the page, click the **project dropdown** (next to "Google Cloud")
2. Click **"NEW PROJECT"** button (top right)
3. Fill in:
   - **Project name:** `ACU Project Map` (or any name you like)
   - **Location:** Leave as default
4. Click **"CREATE"**
5. Wait 10-30 seconds for project creation
6. You'll see a notification when it's ready

---

### Step 3: Enable Maps JavaScript API
1. In the left sidebar, click **"APIs & Services"** → **"Library"**
   
   OR
   
   Click this direct link: https://console.cloud.google.com/apis/library

2. In the search box, type: **"Maps JavaScript API"**
3. Click on **"Maps JavaScript API"** from results
4. Click the blue **"ENABLE"** button
5. Wait for it to enable (5-10 seconds)

---

### Step 4: Enable Places API
1. Click **"APIs & Services"** → **"Library"** again
2. In the search box, type: **"Places API"**
3. Click on **"Places API"** from results
4. Click the blue **"ENABLE"** button
5. Wait for it to enable

---

### Step 5: Create API Key
1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
   
   OR
   
   Click this direct link: https://console.cloud.google.com/apis/credentials

2. At the top, click **"+ CREATE CREDENTIALS"**
3. Select **"API key"** from the dropdown
4. A popup will appear with your API key!
5. **IMPORTANT:** Click the **"COPY"** button to copy your API key
6. Save it somewhere temporarily (Notepad)

Your API key looks like this:
```
AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz_ABC
```

---

### Step 6: (Optional but Recommended) Restrict API Key
1. In the popup with your API key, click **"EDIT API KEY"**
   
   OR
   
   If you closed it, click the API key name in the list

2. **Set Application Restrictions:**
   - Select **"HTTP referrers (web sites)"**
   - Click **"ADD AN ITEM"**
   - Add: `http://localhost:8080/*`
   - Add: `http://localhost:*` (for other ports)
   - Add: `http://127.0.0.1:*`
   - Later add your production domain: `https://yourdomain.com/*`

3. **Set API Restrictions:**
   - Select **"Restrict key"**
   - Check only:
     - ✅ **Maps JavaScript API**
     - ✅ **Places API**

4. Click **"SAVE"** at the bottom

---

## 📋 PART 2: Install Google Maps Library

### Step 1: Install Dependencies

**Choose ONE option:**

#### Option A: Use Batch File (Windows - EASIEST)
1. Go to your project folder:
   ```
   C:\Users\edujk\Desktop\project map\acu-project-map-123456-789
   ```
2. **Double-click** the file: `install-dependencies.bat`
3. Wait for installation to complete
4. Press any key when done

#### Option B: Use Command Prompt
1. Press `Win + R` on your keyboard
2. Type: `cmd` and press Enter
3. Copy and paste this command (press Enter after):
   ```cmd
   cd "C:\Users\edujk\Desktop\project map\acu-project-map-123456-789"
   ```
4. Then run this command:
   ```cmd
   npm install @react-google-maps/api @types/google.maps
   ```
5. Wait for installation to complete (30-60 seconds)

---

## 📋 PART 3: Configure Your Project

### Step 1: Create .env File
1. Open your project folder in File Explorer:
   ```
   C:\Users\edujk\Desktop\project map\acu-project-map-123456-789
   ```

2. Right-click in the folder → **New** → **Text Document**

3. Name it exactly: `.env` (yes, just `.env` with the dot at the start, no `.txt`)
   - Windows will warn you about changing the extension
   - Click **"Yes"** to confirm

4. Right-click the `.env` file → **Open with** → **Notepad**

5. Paste this line (replace with YOUR API key):
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz_ABC
   ```

6. **IMPORTANT:** Replace the key with the actual key you copied from Google Cloud Console!

7. Save the file: **File** → **Save** (or Ctrl+S)

8. Close Notepad

---

### Example .env File:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **IMPORTANT:**
- No spaces before or after the `=`
- No quotes around the key
- Must be exactly named `.env` (not `.env.txt`)
- Must be in the project root folder (same folder as `package.json`)

---

## 📋 PART 4: Run Your Application

### Step 1: Stop Current Server (if running)
1. Go to your terminal/command prompt where the server is running
2. Press `Ctrl + C` to stop it
3. Type `Y` if asked to terminate

---

### Step 2: Start Server Again
1. In the same terminal/command prompt, run:
   ```cmd
   npm run dev
   ```

2. Wait for the server to start (5-10 seconds)

3. You should see something like:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:8080/
   ```

---

### Step 3: Open in Browser
1. Open your web browser
2. Go to: **http://localhost:8080/**
3. **You should now see Google Maps!** 🎉

---

## ✅ What You Should See

After following all steps, you should see:

- ✅ Google Maps loaded with satellite/terrain buttons
- ✅ Philippines map centered
- ✅ Zoom controls (+ and -) on the map
- ✅ Your project markers (colored circles) if you have projects
- ✅ Control panel on the left (Enter Project, Pin on Map, Search Place)

---

## 🐛 Troubleshooting

### Problem: "Google Maps API Key Missing" message

**Solution:**
1. Check if `.env` file exists in project root
2. Open `.env` and verify it has the correct format:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```
3. Make sure you restarted the dev server after creating `.env`
4. Check there are no extra spaces or quotes

---

### Problem: Map shows but says "For development purposes only"

**Solution:**
This is normal! It means:
- ✅ Your API key is working
- ⚠️ You need to enable billing in Google Cloud Console (optional for development)
- For testing, you can ignore this watermark

To remove it:
1. Go to Google Cloud Console
2. Click **Billing** in left sidebar
3. Set up billing account (credit card required, but you won't be charged within free tier)

---

### Problem: "This API project is not authorized"

**Solution:**
1. Go back to Google Cloud Console
2. Make sure you enabled:
   - ✅ Maps JavaScript API
   - ✅ Places API
3. Wait 5 minutes for changes to propagate
4. Refresh your browser

---

### Problem: PowerShell won't run npm commands

**Solution:**
Use Command Prompt instead of PowerShell:
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to project and run commands

---

### Problem: Can't create .env file (Windows hides extension)

**Solution:**
1. Open File Explorer
2. Click **View** tab at top
3. Check ✅ **File name extensions**
4. Now you can create `.env` properly

---

## 📞 Need Help?

If you get stuck at any step:

1. **Check which step failed** - note the exact error message
2. **Check browser console** - Press F12, look at Console tab
3. **Verify all steps completed**:
   - ✅ API key created
   - ✅ Maps JavaScript API enabled
   - ✅ Places API enabled
   - ✅ npm packages installed
   - ✅ .env file created with correct format
   - ✅ Server restarted

---

## 🎉 Success Checklist

Mark these off as you complete them:

- [ ] Created Google Cloud project
- [ ] Enabled Maps JavaScript API
- [ ] Enabled Places API
- [ ] Created and copied API key
- [ ] Installed npm packages (`@react-google-maps/api`)
- [ ] Created `.env` file in project root
- [ ] Added API key to `.env` file
- [ ] Restarted dev server
- [ ] Opened http://localhost:8080/
- [ ] See Google Maps displaying!

---

**Once you complete all steps, your Google Maps will be working perfectly! 🗺️**

If you have any questions at any step, let me know exactly which step you're on and what you're seeing!

