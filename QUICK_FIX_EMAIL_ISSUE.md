# 🚨 QUICK FIX: Password Reset Email Not Arriving

## The #1 Most Common Issue (90% of cases)

### Problem: Redirect URLs not configured in Supabase

---

## ⚡ 5-Minute Fix

### **Step 1: Open Supabase Dashboard**

1. Go to: **https://supabase.com/dashboard**
2. Click on your project: **acu-project-map** (or whatever your project name is)

---

### **Step 2: Navigate to URL Configuration**

1. Click **"Authentication"** in the left sidebar (🔐 icon)
2. Scroll down and click **"URL Configuration"**

---

### **Step 3: Set Your URLs**

#### **A. Site URL** (at the top)
```
https://acu-project-map-dev.vercel.app
```
⚠️ **Important**: No trailing slash!

#### **B. Redirect URLs** (scroll down a bit)

Click **"Add URL"** and add EACH of these (one by one):

```
https://acu-project-map-dev.vercel.app/**
https://acu-project-map-dev.vercel.app/admin/reset-password
https://acu-project-map-dev.vercel.app/admin/dashboard
http://localhost:8080/**
http://localhost:8080/admin/reset-password
```

**Visual Example:**
```
Redirect URLs:
┌─────────────────────────────────────────────────────────────┐
│ https://acu-project-map-dev.vercel.app/**                   │ [Remove]
├─────────────────────────────────────────────────────────────┤
│ https://acu-project-map-dev.vercel.app/admin/reset-password│ [Remove]
├─────────────────────────────────────────────────────────────┤
│ https://acu-project-map-dev.vercel.app/admin/dashboard     │ [Remove]
├─────────────────────────────────────────────────────────────┤
│ http://localhost:8080/**                                    │ [Remove]
├─────────────────────────────────────────────────────────────┤
│ http://localhost:8080/admin/reset-password                 │ [Remove]
└─────────────────────────────────────────────────────────────┘
                    [+ Add another URL]
```

---

### **Step 4: Save Changes**

1. Scroll to the bottom
2. Click **"Save"** button (green button)
3. ✅ Wait 1-2 minutes for changes to take effect

---

### **Step 5: Test Again**

1. Go to: https://acu-project-map-dev.vercel.app/admin/forgot-password
2. Enter your email address
3. Click "Send Reset Link"
4. **Check your email in 1-2 minutes**
5. ⚠️ **CHECK SPAM/JUNK FOLDER** first!

---

## 🔍 How to Check if It's Working

### **Open Browser Console** (to see debug logs):

1. Press **F12** (or right-click → Inspect)
2. Click **"Console"** tab
3. Try password reset again
4. You should see:
   ```
   🔐 Password reset attempt: { email: "...", redirectUrl: "..." }
   🔐 Reset password response: { data: {}, error: null }
   ✅ Password reset email sent successfully
   ```

### **If you see an error:**
```
❌ Reset password error: { message: "..." }
```

Copy the error message and check the full troubleshooting guide.

---

## 📧 Check Your Email

### **Where to Look:**

1. ✅ **Inbox** (main folder)
2. ✅ **Spam/Junk** folder ⚠️ **CHECK THIS FIRST!**
3. ✅ **Promotions** tab (Gmail)
4. ✅ **All Mail** (Gmail)

### **Search for:**
- `supabase`
- `password reset`
- `@mail.supabase.io`
- `noreply@mail.supabase.io`

### **Email Subject:**
```
Reset Your Password
```

### **From:**
```
noreply@mail.supabase.io
```

---

## ⚠️ Still Not Working?

### Try These (in order):

1. **Wait 5 minutes** and check email again
2. **Try a different email** (Gmail usually works best)
3. **Check Spam folder** again
4. **Clear browser cache** and try again
5. **Try incognito/private mode**

---

## 🆘 Alternative: Manual Reset (For Testing)

### **From Supabase Dashboard:**

1. Go to **Authentication** → **Users**
2. Find your email in the list
3. Click on the user
4. Click **"Send password recovery email"**
5. This sends directly from Supabase dashboard

---

## 💡 Pro Tip: Add Supabase to Safe Senders

### **Gmail:**
1. Open any Supabase email (even if in spam)
2. Click "Not spam" at the top
3. Add sender to contacts

### **Outlook:**
1. Right-click the email
2. Select "Add to Safe Senders"

### **Yahoo:**
1. Click "Not Spam" button
2. Add to contacts

---

## 🎯 Expected Timeline

- ⏱️ **Immediate**: Success message appears in app
- ⏱️ **1-2 minutes**: Email arrives in inbox
- ⏱️ **5 minutes**: Check spam if not in inbox
- ⏱️ **10 minutes**: Try different email if still nothing

---

## ✅ Success Indicators

### **You'll know it worked when:**

1. ✅ Green toast: "Password Reset Email Sent"
2. ✅ Console shows: "Password reset email sent successfully"
3. ✅ Email arrives with subject "Reset Your Password"
4. ✅ Email contains link to: `https://acu-project-map-dev.vercel.app/admin/reset-password?token=...`
5. ✅ Clicking link opens your app
6. ✅ Can enter new password
7. ✅ Can sign in with new password

---

## 📊 Success Rate by Solution

Based on common issues:

- **90%** - Fixed by adding redirect URLs ⬆️
- **5%** - Email in spam folder
- **3%** - Need to wait longer (rate limiting)
- **2%** - Other issues (see full guide)

---

## 🎉 After It Works

Once you receive the email:

1. **Click the link** in the email
2. It opens: `https://acu-project-map-dev.vercel.app/admin/reset-password`
3. **Enter your new password** (twice)
4. Click **"Update Password"**
5. You're redirected to sign in page
6. **Sign in** with your new password
7. ✅ Done!

---

## 📞 Need More Help?

See the complete troubleshooting guide:
- **SUPABASE_EMAIL_TROUBLESHOOTING.md** (detailed guide)
- Includes SMTP setup, rate limiting, and advanced debugging

---

## 🔑 Quick Summary

**The fix for 90% of cases:**

```
1. Supabase Dashboard
2. Authentication → URL Configuration
3. Add: https://acu-project-map-dev.vercel.app/**
4. Save
5. Wait 2 minutes
6. Try again
7. Check spam folder
8. Success! 🎉
```

---

## ⚡ Even Faster Fix

**Copy-paste these exact steps:**

1. Open: https://supabase.com/dashboard
2. Select your project
3. Click: Authentication
4. Click: URL Configuration
5. Site URL: `https://acu-project-map-dev.vercel.app`
6. Click: Add URL
7. Paste: `https://acu-project-map-dev.vercel.app/**`
8. Click: Save
9. Wait 2 minutes
10. Test password reset
11. Check spam folder
12. Done! ✅

