-- Enable Realtime for projects table
-- This allows real-time subscriptions to work properly

-- Enable replication for projects table
ALTER TABLE public.projects REPLICA IDENTITY FULL;

-- Enable realtime for projects table
-- Note: In Supabase, you may also need to enable this in the dashboard:
-- Database -> Replication -> Enable for 'projects' table

-- Create a publication for realtime if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add projects table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Grant necessary permissions for realtime
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;

-- Ensure the subscription works for all changes
COMMENT ON TABLE public.projects IS 'Projects table with realtime enabled for live updates';

