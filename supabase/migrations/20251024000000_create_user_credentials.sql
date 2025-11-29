-- Create user_credentials table for regular user authentication
-- This stores ONE set of credentials shared by ALL regular users
-- Only admin users can create/edit these credentials

CREATE TABLE IF NOT EXISTS public.user_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read (for login verification)
CREATE POLICY "Anyone can read user credentials"
  ON public.user_credentials
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only authenticated admin users can insert
CREATE POLICY "Only admins can insert user credentials"
  ON public.user_credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated admin users can update
CREATE POLICY "Only admins can update user credentials"
  ON public.user_credentials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated admin users can delete
CREATE POLICY "Only admins can delete user credentials"
  ON public.user_credentials
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_credentials_updated_at
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_user_credentials_updated_at();

-- Add comment to table
COMMENT ON TABLE public.user_credentials IS 'Stores shared credentials for regular users to authenticate before entering projects';

