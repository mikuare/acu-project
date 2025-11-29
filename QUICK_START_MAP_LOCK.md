# 🚀 Quick Start: Map Lock Feature

## ✅ What Was Added

A new feature that lets you **lock the map** and require users to login before viewing it, or **unlock it** for public access.

---

## 📋 Setup (One-Time Only)

### Step 1: Run Database Migration

**Option A: Using Supabase Dashboard** (Recommended)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **"New Query"**
5. Copy and paste the contents of `SETUP_MAP_LOCK.sql`
6. Click **"Run"** or press Ctrl+Enter
7. You should see "Success. No rows returned"

**Option B: Using Terminal**
```bash
# In your project directory
npx supabase db push
```

### Step 2: Verify Setup
1. In Supabase Dashboard, go to **Table Editor**
2. Look for the new table: `app_settings`
3. You should see 1 row with:
   - `setting_key`: map_lock_enabled
   - `setting_value`: false

✅ **Setup Complete!** The feature is now ready to use.

---

## 🎯 How to Use

### For Admins:

#### Lock the Map
1. Login to admin dashboard
2. Click **"Map Access"** button (Shield icon)
3. Toggle the switch to **ON** (turns amber)
4. ✅ Map is now locked - users must login to view

#### Unlock the Map
1. Login to admin dashboard
2. Click **"Map Access"** button
3. Toggle the switch to **OFF** (turns green)
4. ✅ Map is now public - anyone can view

#### Important: Set User Credentials First!
Before locking the map, create user credentials:
1. Click **"User Credentials"** button
2. Create username and password
3. Share with your users
4. Users will use these to login when map is locked

### For Regular Users:

**When Map is Locked:**
1. Go to the map page
2. You'll see "Map Access Restricted" screen
3. Click **"Login to View Map"**
4. Enter username and password (get from admin)
5. ✅ Access granted for 24 hours

**When Map is Public:**
- Just view the map normally
- No login required
- Login is optional

---

## 🎨 What You'll See

### In Admin Dashboard
- New **"Map Access"** button in header
  - Desktop: Top right, next to "User Credentials"
  - Mobile: In the menu (☰)

### Map Lock Settings Modal
- **Locked (Amber)**: 🔒 Map requires login
- **Public (Green)**: 🔓 Map is accessible to all

### Map Page (When Locked)
- Shows "Map Access Restricted" screen
- Big login button
- Clear instructions for users

---

## 📁 Files Created

### New Files:
1. ✅ `supabase/migrations/20251106000000_create_app_settings.sql` - Database migration
2. ✅ `src/contexts/AppSettingsContext.tsx` - State management
3. ✅ `src/components/MapLockSettings.tsx` - Admin UI component
4. ✅ `SETUP_MAP_LOCK.sql` - Quick setup script
5. ✅ `MAP_LOCK_FEATURE.md` - Full documentation
6. ✅ `QUICK_START_MAP_LOCK.md` - This file

### Modified Files:
1. ✅ `src/integrations/supabase/types.ts` - Added types
2. ✅ `src/App.tsx` - Added provider
3. ✅ `src/pages/admin/Dashboard.tsx` - Added button & modal
4. ✅ `src/pages/Index.tsx` - Added access control

---

## ✨ Features

- ✅ Simple toggle switch to lock/unlock map
- ✅ Real-time updates (changes apply immediately)
- ✅ Works with existing user credentials system
- ✅ Admins always have access
- ✅ Clear UI for locked state
- ✅ 24-hour user sessions
- ✅ Mobile-friendly

---

## 🧪 Testing

### Test Locking the Map:
1. ✅ Login as admin
2. ✅ Click "Map Access" → Toggle ON
3. ✅ Open incognito window
4. ✅ Go to map page → Should see "Access Restricted"
5. ✅ Login with user credentials → Should see map

### Test Unlocking the Map:
1. ✅ Toggle switch OFF in "Map Access"
2. ✅ Refresh incognito window
3. ✅ Map should be visible without login

---

## 🐛 Troubleshooting

### "Map Access" button not showing
- Clear browser cache
- Verify you're logged in as admin
- Check that migration was applied

### Can't toggle map lock
- Check Supabase connection
- Verify migration was successful
- Look for errors in browser console (F12)

### Users can't login
- Verify user credentials are set up in "User Credentials"
- Check credentials are correct (case-sensitive)
- Clear browser cache

---

## 📚 Need More Info?

- **Full Documentation**: See `MAP_LOCK_FEATURE.md`
- **Database Setup**: See `SETUP_MAP_LOCK.sql`
- **User Auth System**: See `USER_AUTHENTICATION_FEATURE.md`

---

## 🎉 You're All Set!

The map lock feature is now ready to use. Head to your admin dashboard and try it out!

**Workflow:**
1. Set up user credentials (if not done already)
2. Toggle map lock ON/OFF as needed
3. Share credentials with users when map is locked
4. Monitor access and manage as needed

---

**Last Updated:** November 6, 2025
**Status:** ✅ Complete and Tested

