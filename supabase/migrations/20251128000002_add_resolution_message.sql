-- Add resolution_message column to project_reports table
ALTER TABLE project_reports ADD COLUMN IF NOT EXISTS resolution_message TEXT;
