-- Create report status enum
CREATE TYPE report_status AS ENUM ('pending', 'catered', 'cancelled');

-- Create project_reports table
CREATE TABLE IF NOT EXISTS project_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  message TEXT NOT NULL,
  proof_urls TEXT[],
  status report_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE project_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone to submit a report
CREATE POLICY "Allow public insert reports" ON project_reports FOR INSERT WITH CHECK (true);

-- Allow admins (authenticated users) to view all reports
CREATE POLICY "Allow admins to view reports" ON project_reports FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to update reports (e.g., change status)
CREATE POLICY "Allow admins to update reports" ON project_reports FOR UPDATE USING (auth.role() = 'authenticated');

-- Create storage bucket for report proofs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-proofs', 'report-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access Proofs" ON storage.objects FOR SELECT USING ( bucket_id = 'report-proofs' );
CREATE POLICY "Public Upload Proofs" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'report-proofs' );
