# User Authentication Feature Guide

## 🎯 Overview

A new **User Authentication System** has been implemented for regular users. This feature requires users to login before they can **enter projects** or **pin locations** on the map.

### Key Features:
- ✅ **Shared Credentials**: ONE set of credentials used by ALL regular users
- ✅ **Admin-Managed**: Only admin users can create/edit the credentials
- ✅ **Secure Storage**: Credentials stored in Supabase database
- ✅ **Permission Control**: Regular users can only view project details and search places without login
- ✅ **24-Hour Sessions**: User authentication persists for 24 hours

---

## 🔐 User Permissions

### **Without Authentication (Not Logged In)**
Regular users can:
- ✅ View the map
- ✅ Search for places
- ✅ View project details (click on map markers)
- ❌ **Cannot** enter projects
- ❌ **Cannot** pin locations on the map

### **With Authentication (Logged In)**
Regular users can:
- ✅ Everything above, PLUS:
- ✅ **Enter projects** based on their current location
- ✅ **Pin locations** anywhere on the map

### **Admin Users**
Admin users have full access:
- ✅ Full dashboard access
- ✅ Create/edit/delete projects
- ✅ **Manage user credentials** (create/edit the shared login)

---

## 📋 How to Use (For Regular Users)

### Step 1: Login
1. Click the **"User Login"** button in the header (user icon 👤)
2. Enter the username and password provided by your administrator
3. Click **"Login"**

### Step 2: Enter Projects or Pin Locations
Once logged in:
- The user icon will turn green with a checkmark (✅)
- You can now use **"Enter Project"** to add a project at your current location
- You can now use **"Pin on Map"** to add a project by clicking on the map

### Step 3: Logout (Optional)
- Click the user icon (now green with checkmark)
- Select **"Logout"** from the dropdown menu

---

## 👨‍💼 How to Setup (For Administrators)

### First-Time Setup

1. **Login to Admin Dashboard**
   - Go to `/admin/signin`
   - Login with your admin credentials

2. **Create User Credentials**
   - Click the **"User Credentials"** button in the header (desktop)
   - Or open the mobile menu and select **"Manage User Credentials"**
   - Click **"Create User Credentials"**
   - Enter a **username** (e.g., "acu_user")
   - Enter a **password** (min. 4 characters)
   - Click **"Create"**

3. **Share Credentials**
   - Share the username and password with ALL your regular users
   - Users can use these credentials to login on the main map page

### Managing Credentials

#### View Current Credentials:
1. Click **"User Credentials"** button
2. View the current username and password
3. Click the eye icon (👁️) to show/hide the password

#### Edit Credentials:
1. Click **"User Credentials"** button
2. Click **"Edit Credentials"**
3. Modify the username and/or password
4. Click **"Update"**
5. **Important**: Notify all users of the new credentials!

---

## 🗄️ Database Structure

### New Table: `user_credentials`

```sql
CREATE TABLE public.user_credentials (
  id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);
```

### Security:
- ✅ Row Level Security (RLS) enabled
- ✅ Anyone can read (for login verification)
- ✅ Only authenticated admin users can insert/update/delete

---

## 🔧 Technical Implementation

### Files Created:

1. **`supabase/migrations/20251024000000_create_user_credentials.sql`**
   - Database migration for user credentials table

2. **`src/contexts/UserCredentialsContext.tsx`**
   - React context for managing user authentication state
   - Handles login/logout functionality
   - Stores authentication in localStorage (24-hour expiry)

3. **`src/components/UserLoginModal.tsx`**
   - Modal for regular users to login
   - Shows/hides password
   - Validates credentials against Supabase

4. **`src/components/ManageUserCredentials.tsx`**
   - Admin interface to create/edit user credentials
   - View current credentials
   - Show/hide password feature

### Files Modified:

1. **`src/App.tsx`**
   - Added `UserCredentialsProvider` wrapper

2. **`src/pages/Index.tsx`**
   - Added user login button in header
   - Shows logged-in state (green checkmark)
   - Dropdown menu for logout

3. **`src/pages/admin/Dashboard.tsx`**
   - Added "Manage User Credentials" button (desktop & mobile)
   - Integrated `ManageUserCredentials` modal

4. **`src/components/PhilippinesMapMapbox.tsx`**
   - Added authentication checks in `handleEnterProject()`
   - Added authentication checks in `handlePinOnMap()`
   - Shows toast message if not authenticated

5. **`src/integrations/supabase/types.ts`**
   - Added TypeScript types for `user_credentials` table

---

## 🚀 Setup Instructions

### 1. Run Database Migration

**Option A: Through Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251024000000_create_user_credentials.sql`
4. Paste and execute the SQL

**Option B: Using Supabase CLI**
```bash
supabase db push
```

### 2. Restart Development Server
```bash
npm run dev
```

### 3. Create First User Credentials
1. Login as admin
2. Go to "Manage User Credentials"
3. Create the first set of credentials

---

## 🧪 Testing Checklist

### As Admin:
- [ ] Can access "Manage User Credentials" modal
- [ ] Can create user credentials
- [ ] Can view existing credentials
- [ ] Can edit/update credentials
- [ ] Credentials are saved to Supabase

### As Regular User (Not Logged In):
- [ ] Can view map
- [ ] Can search places
- [ ] Can view project details
- [ ] **Cannot** enter project (shows auth required message)
- [ ] **Cannot** pin on map (shows auth required message)

### As Regular User (Logged In):
- [ ] User icon shows green checkmark after login
- [ ] Can enter project
- [ ] Can pin on map
- [ ] Can logout from dropdown menu
- [ ] Session persists after page reload (24 hours)

---

## 💡 Best Practices

1. **Password Security**:
   - Use a password that's easy to share but not too simple
   - Change the password periodically
   - Notify all users when changing credentials

2. **Credential Sharing**:
   - Share credentials through secure channels (email, chat)
   - Consider creating a printed card with credentials for field users

3. **User Training**:
   - Ensure users know they need to login before entering projects
   - Provide clear instructions on where to find the login button
   - Have a backup contact if users forget credentials

4. **Monitoring**:
   - Regularly check that credentials are working
   - Update credentials if needed
   - Maintain admin access to update credentials anytime

---

## 🆘 Troubleshooting

### Issue: "Invalid username or password"
**Solution**: 
- Verify you're using the correct credentials
- Check with your administrator for the latest credentials
- Ensure Caps Lock is not on

### Issue: Login button not visible
**Solution**:
- The "User Login" button should be in the header, next to the theme toggle
- On mobile, it may show just as "User" instead of "User Login"

### Issue: Still can't enter project after logging in
**Solution**:
- Check if the user icon shows a green checkmark (logged in state)
- Try logging out and logging in again
- Clear browser cache and try again

### Issue: Admin can't create credentials
**Solution**:
- Ensure the database migration has been run
- Check Supabase dashboard for any errors
- Verify admin user has necessary permissions

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Contact your system administrator
3. Refer to the technical documentation in the code comments

---

## 🎉 Summary

This feature provides **granular access control** for your project management system:
- Regular users must authenticate before adding projects
- Admins manage a single set of shared credentials
- Seamless UX with persistent sessions
- Clear visual feedback (green checkmark when logged in)

**Next Steps**:
1. Run the database migration
2. Create user credentials as admin
3. Share credentials with your team
4. Start using the authenticated project entry!

