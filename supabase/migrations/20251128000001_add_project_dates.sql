-- Add new date columns to projects table
ALTER TABLE public.projects 
ADD COLUMN effectivity_date DATE,
ADD COLUMN actual_start_date DATE,
ADD COLUMN expiry_date DATE;

-- Comments
COMMENT ON COLUMN public.projects.effectivity_date IS 'The date when the project becomes effective';
COMMENT ON COLUMN public.projects.actual_start_date IS 'The actual start date of the project';
COMMENT ON COLUMN public.projects.expiry_date IS 'The expiry date of the project';
