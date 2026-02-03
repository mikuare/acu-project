-- Add document_urls column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS document_urls TEXT;

-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-documents', 'project-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project documents
CREATE POLICY "Anyone can view project documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-documents');

CREATE POLICY "Anyone can upload project documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'project-documents');

CREATE POLICY "Anyone can update their project documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'project-documents');

CREATE POLICY "Anyone can delete project documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'project-documents');
