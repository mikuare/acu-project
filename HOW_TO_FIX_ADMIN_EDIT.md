# How to Fix Admin Edit Functionality

## Problem
Admin edits in the dashboard don't save to the database due to Row Level Security (RLS) policy issues in Supabase.

## Solution
Run the SQL script in your Supabase Dashboard to fix the RLS policies.

### Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Log in to your account
   - Select your project: `qopovmrvzonuwsfevvid`

2. **Open SQL Editor**
   - In the left sidebar, click on **SQL Editor**
   - Click **New query** button

3. **Run the Fix Script**
   - Copy the entire contents of `RLS_FIX_SCRIPT.sql` file
   - Paste it into the SQL Editor
   - Click **Run** button (or press Ctrl+Enter)

4. **Verify the Fix**
   - Scroll down to see the verification queries output
   - You should see 4 policies created:
     - `allow_all_select`
     - `allow_all_insert`
     - `allow_authenticated_update`
     - `allow_authenticated_delete`

5. **Test in Your App**
   - Go back to your application
   - Sign in as admin
   - Edit a project
   - The changes should now save and appear immediately!

## What This Fixes

The SQL script:
- ✅ Removes conflicting old policies
- ✅ Creates new clear policies for SELECT, INSERT, UPDATE, DELETE
- ✅ Grants proper permissions to authenticated users (admins)
- ✅ Configures realtime properly
- ✅ Allows admins to edit and delete projects
- ✅ Allows public users to view and create projects

## Alternative: Quick Fix via SQL

If you just want to quickly test, run this minimal version in SQL Editor:

```sql
-- Quick fix for UPDATE permission
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;

CREATE POLICY "allow_authenticated_update"
ON public.projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

GRANT UPDATE ON public.projects TO authenticated;
```

Then test your admin edit functionality again!

