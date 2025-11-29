-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS category_type TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Update project_status enum
-- Postgres doesn't support ALTER TYPE inside a transaction block nicely for multiple values in some versions, 
-- but we can try adding them one by one or just using text for flexibility if needed. 
-- For now, let's attempt to add the values.
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'not_started';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'ongoing';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'terminated';

-- Create indexes for better query performance on filtered fields
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category_type);
CREATE INDEX IF NOT EXISTS idx_projects_region ON public.projects(region);
CREATE INDEX IF NOT EXISTS idx_projects_year ON public.projects(year);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
