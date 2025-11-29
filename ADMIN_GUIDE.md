# Admin System Guide

## 🔐 Admin Features

The Project Management System now includes a full-featured admin authentication and management system.

## Features

### 1. **Admin Authentication**
- **Sign Up**: Create admin accounts with email verification
- **Sign In**: Secure login with session management
- **Forgot Password**: Password reset via email
- **Protected Routes**: Dashboard only accessible to authenticated admins

### 2. **Admin Dashboard**
- View all submitted projects in a table format
- Edit project details
- Delete projects
- Organized by submission date (newest first)
- Filter and search capabilities

### 3. **Project Management**
- **Edit Projects**: Modify all project fields including:
  - Project ID
  - Description
  - Status (Active, Completed, Inactive)
  - Branch (ADC, QGDC, QMB)
  - Engineer Name
  - User Name
  - Contact Information
  - Additional Details
  - Project Date
- **Delete Projects**: Remove projects with confirmation dialog

## Getting Started

### For Admins

#### 1. Create an Admin Account
1. Click the **"Admin"** button (shield icon) in the top-right header
2. Click **"Sign Up"** on the sign-in page
3. Fill in your details:
   - **Full Name**: Your full name
   - **Email Address**: Must be a valid, active email
   - **Password**: Minimum 8 characters
   - **Confirm Password**: Must match password
4. Click **"Sign Up"**
5. **Important**: Check your email inbox for verification link
6. Click the verification link in the email
7. Return to the site and sign in

#### 2. Sign In
1. Click the **"Admin"** button in the header
2. Enter your email and password
3. Click **"Sign In"**
4. You'll be redirected to the Admin Dashboard

#### 3. Manage Projects
- **View Projects**: All projects are displayed in a table
- **Edit**: Click the edit (pencil) icon next to any project
- **Delete**: Click the delete (trash) icon and confirm
- **View Map**: Click "View Map" to see the public map view
- **Sign Out**: Click "Sign Out" when done

### Password Requirements
- Minimum 8 characters
- Required for account security

### Email Verification
- All new accounts require email verification
- Check your spam folder if you don't receive the email
- Verification link expires after 24 hours

## Routes

### Public Routes
- `/` - Home page with project map
- `/admin/signin` - Admin sign in
- `/admin/signup` - Admin registration
- `/admin/forgot-password` - Password reset

### Protected Routes (Requires Authentication)
- `/admin/dashboard` - Admin dashboard with project management

## Database Structure

### Authentication
- Powered by Supabase Auth
- Email confirmation enabled
- Secure password hashing
- Session management

### Permissions
- **Public Users**: Can view and submit projects
- **Admin Users**: Can view, edit, and delete all projects
- **Policies**: Row-level security enforced

## Security Features

### 🔒 Security Measures
1. **Email Verification**: All accounts must verify email before access
2. **Password Strength**: Minimum 8 characters required
3. **Protected Routes**: Dashboard only accessible when signed in
4. **Row-Level Security**: Database policies enforce access control
5. **Secure Sessions**: Auto-logout on session expiry
6. **HTTPS Required**: Authentication requires secure connection

### 🛡️ Database Policies
- **View Projects**: Anyone can view
- **Create Projects**: Anyone can create (public submission)
- **Update Projects**: Only authenticated admins
- **Delete Projects**: Only authenticated admins

## Supabase Configuration

### Email Settings
Configure in Supabase Dashboard → Authentication → Email Templates:

1. **Confirm Signup**: Customize email verification template
2. **Reset Password**: Customize password reset template
3. **Site URL**: Set to your production domain
4. **Redirect URLs**: Add allowed redirect URLs

### Steps to Configure
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Set **Site URL**: Your production URL (e.g., `https://yourdomain.com`)
4. Add **Redirect URLs**: 
   - `https://yourdomain.com/admin/dashboard`
   - `http://localhost:5173/admin/dashboard` (for development)

## Common Issues & Solutions

### ❌ "Email not confirmed"
**Solution**: Check your email and click the verification link. Check spam folder.

### ❌ "Invalid login credentials"
**Solution**: 
- Ensure you've verified your email
- Check password is correct
- Try password reset if forgotten

### ❌ "Location permission denied" (for public users)
**Solution**: Public users can still use "Pin on Map" or "Search Place" without location access

### ❌ Can't access dashboard
**Solution**: 
- Ensure you're signed in
- Check if email is verified
- Try signing out and back in

## Development Notes

### File Structure
```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication context & logic
├── components/
│   ├── ProtectedRoute.tsx       # Route protection wrapper
│   └── EditProjectModal.tsx     # Project editing modal
├── pages/
│   ├── admin/
│   │   ├── SignIn.tsx          # Sign in page
│   │   ├── SignUp.tsx          # Registration page
│   │   ├── ForgotPassword.tsx  # Password reset page
│   │   └── Dashboard.tsx       # Admin dashboard
│   └── Index.tsx               # Public map page
└── App.tsx                     # Route configuration
```

### Supabase Migrations
```
supabase/migrations/
└── 20251021000000_setup_auth.sql   # Auth policies & indexes
```

## API Endpoints (Supabase)

### Authentication
- `supabase.auth.signUp()` - Register new user
- `supabase.auth.signInWithPassword()` - Sign in
- `supabase.auth.signOut()` - Sign out
- `supabase.auth.resetPasswordForEmail()` - Request password reset
- `supabase.auth.getSession()` - Get current session

### Database
- `supabase.from('projects').select()` - Fetch projects
- `supabase.from('projects').update()` - Update project (admin only)
- `supabase.from('projects').delete()` - Delete project (admin only)

## Support

For issues or questions:
1. Check this guide first
2. Review Supabase Auth documentation
3. Check browser console for errors
4. Verify Supabase configuration

## Future Enhancements

Potential features to add:
- [ ] Admin roles (super admin, moderator)
- [ ] Project approval workflow
- [ ] Bulk operations
- [ ] Export projects to CSV/Excel
- [ ] Advanced filtering and search
- [ ] Project history/audit log
- [ ] Email notifications for new projects
- [ ] Analytics dashboard

---

**Version**: 1.0.0  
**Last Updated**: October 2025

