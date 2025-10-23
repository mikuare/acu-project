-- ============================================================
-- RLS POLICY FIX FOR ADMIN EDIT FUNCTIONALITY
-- ============================================================
-- Run this script in your Supabase SQL Editor to fix the
-- issue where admin edits don't save to the database
-- ============================================================

-- Step 1: Drop all existing policies on projects table
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
DROP POLICY IF EXISTS "Anyone can create projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update all projects" ON public.projects;
DROP POLICY IF EXISTS "enable_update_for_authenticated" ON public.projects;
DROP POLICY IF EXISTS "Anyone can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;
DROP POLICY IF EXISTS "enable_select_for_all" ON public.projects;
DROP POLICY IF EXISTS "enable_insert_for_all" ON public.projects;
DROP POLICY IF EXISTS "enable_delete_for_authenticated" ON public.projects;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new policies with clear permissions

-- SELECT: Everyone can view all projects (public and authenticated)
CREATE POLICY "allow_all_select"
ON public.projects
FOR SELECT
USING (true);

-- INSERT: Everyone can insert projects (for public submissions)
CREATE POLICY "allow_all_insert"
ON public.projects
FOR INSERT
WITH CHECK (true);

-- UPDATE: Authenticated users (admins) can update any project
CREATE POLICY "allow_authenticated_update"
ON public.projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Authenticated users (admins) can delete any project
CREATE POLICY "allow_authenticated_delete"
ON public.projects
FOR DELETE
TO authenticated
USING (true);

-- Step 4: Grant necessary table permissions
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT ON public.projects TO anon, authenticated;
GRANT UPDATE ON public.projects TO authenticated;
GRANT DELETE ON public.projects TO authenticated;

-- Step 5: Ensure realtime is configured
ALTER TABLE public.projects REPLICA IDENTITY FULL;

-- Step 6: Verify publication for realtime
DO $$
BEGIN
  -- Remove table from publication if it exists
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.projects;
  EXCEPTION
    WHEN undefined_object THEN
      NULL;
  END;
  
  -- Add table to publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
END $$;

-- ============================================================
-- VERIFICATION QUERIES (Run these after the script)
-- ============================================================

-- Verify policies are created:
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;

-- Verify permissions:
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'projects'
ORDER BY grantee, privilege_type;

-- Test update (replace with actual project ID):
-- UPDATE public.projects 
-- SET description = 'TEST UPDATE' 
-- WHERE project_id = '24HE-0123'
-- RETURNING *;

