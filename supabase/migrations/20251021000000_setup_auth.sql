-- Enable email confirmation in Supabase
-- Note: Email confirmation settings are configured in the Supabase dashboard
-- This migration ensures proper policies are in place

-- Create a function to check if user is authenticated
CREATE OR REPLACE FUNCTION auth.user_is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update projects table policies to allow admin updates
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

-- Policy: Authenticated users can update projects
CREATE POLICY "Authenticated users can update projects"
ON public.projects
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can delete projects
CREATE POLICY "Authenticated users can delete projects"
ON public.projects
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Add index on created_at for better performance on admin dashboard
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Add index on branch for filtering
CREATE INDEX IF NOT EXISTS idx_projects_branch ON public.projects(branch);

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

