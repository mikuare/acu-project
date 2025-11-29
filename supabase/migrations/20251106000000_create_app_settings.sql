-- Create app_settings table to store global app configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view settings (needed for checking if map is locked)
CREATE POLICY "Settings are viewable by everyone"
ON public.app_settings
FOR SELECT
USING (true);

-- Policy: Only authenticated admin users can insert/update/delete settings
CREATE POLICY "Only authenticated users can insert settings"
ON public.app_settings
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update settings"
ON public.app_settings
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete settings"
ON public.app_settings
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default map lock setting (unlocked by default)
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES ('map_lock_enabled', 'false', 'Controls whether the map requires user authentication to view')
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(setting_key);

