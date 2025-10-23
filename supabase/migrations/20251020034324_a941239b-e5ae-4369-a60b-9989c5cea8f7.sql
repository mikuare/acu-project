-- Create enum for project status
CREATE TYPE project_status AS ENUM ('active', 'inactive', 'completed');

-- Create enum for branches with color coding
CREATE TYPE branch_type AS ENUM ('ADC', 'QGDC', 'QMB');

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  description TEXT NOT NULL,
  status project_status DEFAULT 'active',
  project_date DATE NOT NULL DEFAULT CURRENT_DATE,
  engineer_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  contact_social TEXT,
  branch branch_type NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  image_url TEXT,
  additional_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view projects (public access)
CREATE POLICY "Projects are viewable by everyone"
ON public.projects
FOR SELECT
USING (true);

-- Policy: Anyone can insert projects (for now - you can add auth later)
CREATE POLICY "Anyone can create projects"
ON public.projects
FOR INSERT
WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project images
CREATE POLICY "Anyone can view project images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Anyone can upload project images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Anyone can update their project images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'project-images');

CREATE POLICY "Anyone can delete project images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'project-images');