# 🔒 Map Lock Feature - Complete Guide

## Overview

The Map Lock feature allows administrators to control access to the map viewer. When enabled, users must authenticate with credentials set by the admin before they can view the map and its projects.

---

## 🎯 Features

### For Administrators:
- **Toggle Map Lock**: Turn map access restriction on/off with a single switch
- **Real-time Updates**: Changes apply immediately to all users
- **Easy Management**: Simple UI in the admin dashboard
- **User Credentials**: Set username/password for regular users

### For Regular Users:
- **Seamless Login**: When map is locked, users see a clear login prompt
- **Persistent Session**: Login session lasts 24 hours
- **Optional Access**: When map is unlocked, login is optional

---

## 📋 Quick Start for Admins

### Step 1: Access Map Lock Settings
1. Login to the admin dashboard at `/admin/signin`
2. Click the **"Map Access"** button in the header
   - Desktop: Located in the top header
   - Mobile: Open the menu (☰) and select "Map Access Settings"

### Step 2: Configure Map Lock
1. In the Map Access Settings dialog, you'll see:
   - Current status (Locked/Public)
   - Toggle switch to enable/disable lock
   - Information about the current mode

2. **To Lock the Map:**
   - Toggle the switch ON (turns amber/yellow)
   - Users will now need to login to view the map
   
3. **To Unlock the Map:**
   - Toggle the switch OFF (turns green)
   - Map becomes publicly accessible

### Step 3: Set Up User Credentials (Required for Locked Mode)
**Important:** Before locking the map, ensure you have user credentials set up!

1. Click the **"User Credentials"** button in the header
2. Create username and password for regular users
3. Share these credentials with your users
4. Users will use these credentials to login when map is locked

---

## 👥 For Regular Users

### When Map is Public (Unlocked)
- ✅ Access map directly without login
- ✅ Can optionally login if desired
- ✅ Full map functionality available

### When Map is Locked
1. Navigate to the main map page
2. You'll see a "Map Access Restricted" screen
3. Click **"Login to View Map"**
4. Enter the username and password provided by your admin
5. Click "Login"
6. Map will be accessible for 24 hours

---

## 🛠️ Setup Instructions

### Database Migration

**Option 1: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of: `supabase/migrations/20251106000000_create_app_settings.sql`
5. Run the query
6. Verify that the `app_settings` table was created

**Option 2: Using Supabase CLI**

```bash
# Make sure you're in your project directory
cd your-project-directory

# Apply the migration
npx supabase migration up

# Or if you have Supabase CLI installed globally:
supabase migration up
```

### Verify Installation

1. Open Supabase Dashboard → **Table Editor**
2. Look for the `app_settings` table
3. You should see one row:
   - `setting_key`: "map_lock_enabled"
   - `setting_value`: "false"
   - This means the map is unlocked by default

---

## 🔧 Technical Details

### Database Schema

**New Table: `app_settings`**
```sql
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);
```

**Default Setting:**
- Key: `map_lock_enabled`
- Value: `false` (unlocked by default)

### Row Level Security (RLS)
- ✅ **SELECT**: Public (anyone can read settings)
- ✅ **INSERT/UPDATE/DELETE**: Authenticated admins only

### Real-time Updates
- Changes to map lock status are broadcasted in real-time
- All connected clients receive updates immediately
- No page refresh required

---

## 📁 Files Created/Modified

### New Files:
1. **`supabase/migrations/20251106000000_create_app_settings.sql`**
   - Database migration for app_settings table

2. **`src/contexts/AppSettingsContext.tsx`**
   - React context for managing map lock state globally

3. **`src/components/MapLockSettings.tsx`**
   - Admin UI component for controlling map lock

4. **`MAP_LOCK_FEATURE.md`**
   - This documentation file

### Modified Files:
1. **`src/integrations/supabase/types.ts`**
   - Added TypeScript types for app_settings table

2. **`src/App.tsx`**
   - Added AppSettingsProvider wrapper

3. **`src/pages/admin/Dashboard.tsx`**
   - Added "Map Access" button and modal

4. **`src/pages/Index.tsx`**
   - Added map lock check and restricted access UI

---

## 🎨 User Interface

### Admin Dashboard - Map Access Button
- **Desktop**: Visible in top header (Shield icon)
- **Mobile**: Available in mobile menu

### Map Lock Settings Modal
- **Locked Mode** (Amber/Yellow):
  - Shows lock icon 🔒
  - Toggle switch is ON
  - Warning about user credentials requirement
  
- **Public Mode** (Green):
  - Shows unlocked icon 🔓
  - Toggle switch is OFF
  - Information about public access

### Map Access Restricted Screen
When users try to access a locked map:
- Clear "Map Access Restricted" message
- Lock icon indicator
- Prominent "Login to View Map" button
- Link to admin signin for administrators
- Contact admin message for users without credentials

---

## 💡 Usage Tips

### For Admins:

1. **Set Credentials First**
   - Always create user credentials BEFORE locking the map
   - Test the credentials yourself before sharing with users

2. **Communication**
   - Notify users when you lock/unlock the map
   - Share credentials securely (not via email if possible)
   - Update credentials periodically for security

3. **Testing**
   - Open an incognito/private browser window
   - Try accessing the map to verify lock is working
   - Test the login flow with user credentials

4. **Troubleshooting**
   - If users can't login, verify credentials in "User Credentials" section
   - Check that database migration was applied successfully
   - Ensure users are using the correct credentials (case-sensitive)

### For Users:

1. **Keep Credentials Safe**
   - Store credentials in a password manager
   - Don't share credentials publicly

2. **Session Duration**
   - Login lasts 24 hours
   - You'll need to re-login after 24 hours

3. **Troubleshooting**
   - Clear browser cache if login isn't working
   - Contact your admin if credentials don't work
   - Try a different browser if issues persist

---

## 🔐 Security Notes

### Current Implementation:
- Passwords stored in plain text (suitable for shared team credentials)
- 24-hour session duration
- Logout option available

### Recommendations:
- Use strong, unique passwords
- Change credentials regularly
- Don't use personal passwords
- Consider this suitable for internal team use

### For Production/High Security:
If you need higher security, consider:
- Implementing password hashing
- Adding individual user accounts
- Setting up multi-factor authentication
- Using OAuth/SSO integration

---

## 🐛 Troubleshooting

### Map Lock Toggle Not Working
1. Check browser console for errors
2. Verify database migration was applied
3. Confirm admin user is authenticated
4. Check Supabase RLS policies are correct

### Users Can't Login
1. Verify user credentials are created in "User Credentials"
2. Check credentials are correct (case-sensitive)
3. Ensure `user_credentials` table has data
4. Check browser console for errors

### Map Lock Status Not Updating
1. Check real-time subscription is active
2. Verify Supabase Realtime is enabled for `app_settings` table
3. Refresh the page to force reload
4. Check browser console for subscription errors

### Migration Errors
1. Ensure you're connected to the correct Supabase project
2. Check if table already exists
3. Verify SQL syntax is correct
4. Run migration again if it failed partially

---

## 📞 Support

If you encounter issues:

1. **Check the console**: Open browser DevTools (F12) and check for errors
2. **Review Supabase logs**: Check Supabase dashboard for database errors
3. **Verify setup**: Ensure all migration steps were completed
4. **Test in incognito**: Rule out browser cache issues

---

## 🎉 Success Indicators

You'll know the feature is working correctly when:

✅ "Map Access" button appears in admin dashboard
✅ Toggle switch changes map lock status immediately
✅ Locked map shows "Access Restricted" screen to non-authenticated users
✅ Users can login and access map when authenticated
✅ Admin users always have access regardless of lock status
✅ Map lock status persists across page refreshes

---

## 📊 Feature Status

- ✅ Database migration created
- ✅ TypeScript types updated
- ✅ Context provider implemented
- ✅ Admin UI component created
- ✅ Admin dashboard integrated
- ✅ Map page access control implemented
- ✅ Real-time updates enabled
- ✅ Documentation complete

**Status:** ✅ COMPLETE AND READY TO USE

---

## 🔄 Version History

- **v1.0** (November 6, 2025)
  - Initial release
  - Basic map lock/unlock functionality
  - Integration with user credentials system
  - Real-time updates
  - Admin UI in dashboard

---

**Last Updated:** November 6, 2025
**Author:** AI Assistant (via Cursor)
**Project:** QMAZ Holdings Inc. Project Map

