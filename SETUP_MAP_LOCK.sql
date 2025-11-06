-- ========================================
-- MAP LOCK FEATURE - QUICK SETUP SCRIPT
-- ========================================
-- Run this in your Supabase SQL Editor to set up the map lock feature
-- This creates the app_settings table and configures permissions

-- Step 1: Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Step 2: Enable Row Level Security
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.app_settings;
DROP POLICY IF EXISTS "Only authenticated users can insert settings" ON public.app_settings;
DROP POLICY IF EXISTS "Only authenticated users can update settings" ON public.app_settings;
DROP POLICY IF EXISTS "Only authenticated users can delete settings" ON public.app_settings;

-- Step 4: Create RLS Policies
-- Anyone can view settings (needed for checking if map is locked)
CREATE POLICY "Settings are viewable by everyone"
ON public.app_settings
FOR SELECT
USING (true);

-- Only authenticated admin users can insert settings
CREATE POLICY "Only authenticated users can insert settings"
ON public.app_settings
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated admin users can update settings
CREATE POLICY "Only authenticated users can update settings"
ON public.app_settings
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated admin users can delete settings
CREATE POLICY "Only authenticated users can delete settings"
ON public.app_settings
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Step 5: Create trigger for updated_at (if function exists)
-- Note: This assumes update_updated_at_column() function already exists
-- If it doesn't exist, create it first
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
    
    CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Step 6: Insert default map lock setting (unlocked by default)
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES ('map_lock_enabled', 'false', 'Controls whether the map requires user authentication to view')
ON CONFLICT (setting_key) DO NOTHING;

-- Step 7: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(setting_key);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these queries to verify everything is set up correctly:

-- 1. Check if table exists and has data
SELECT * FROM public.app_settings;
-- Expected result: 1 row with setting_key='map_lock_enabled' and setting_value='false'

-- 2. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'app_settings';
-- Expected result: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- 3. Check if index was created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'app_settings';
-- Expected result: Should show idx_app_settings_key

-- ========================================
-- OPTIONAL: Enable Realtime
-- ========================================
-- If you want real-time updates for map lock status, run this:
-- (This may already be enabled)

-- ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;

-- ========================================
-- SUCCESS!
-- ========================================
-- If all queries ran successfully, the map lock feature is now ready!
-- Go to your admin dashboard and click "Map Access" to test it.

