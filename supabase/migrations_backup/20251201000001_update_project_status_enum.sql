-- 1. Add 'implemented' to the enum
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'implemented';

-- 2. Update the records
UPDATE projects SET status = 'implemented' WHERE status = 'completed';
