-- Add timekeeper_name column to project_implementations table
-- This stores the name of the person who verified the project implementation

ALTER TABLE project_implementations 
ADD COLUMN IF NOT EXISTS timekeeper_name TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN project_implementations.timekeeper_name IS 'Name of the time keeper/checker who verified the project implementation';
