-- Fix UPDATE policy for projects table
-- This ensures authenticated users (admins) can update projects

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;

-- Create a clear UPDATE policy for authenticated users
CREATE POLICY "Authenticated users can update all projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Also add DELETE policy if not exists
DROP POLICY IF EXISTS "Anyone can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

CREATE POLICY "Authenticated users can delete projects"
ON public.projects
FOR DELETE  
TO authenticated
USING (true);

-- Verify RLS is enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Grant necessary table permissions
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT ON public.projects TO anon, authenticated;
GRANT UPDATE ON public.projects TO authenticated;
GRANT DELETE ON public.projects TO authenticated;

