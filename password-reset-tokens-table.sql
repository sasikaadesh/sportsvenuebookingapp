-- Password Reset Tokens Table
-- Run this in Supabase SQL Editor

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Enable RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone can insert reset tokens" ON password_reset_tokens;
CREATE POLICY "Anyone can insert reset tokens" 
  ON password_reset_tokens 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Anyone can read their own reset tokens" 
  ON password_reset_tokens 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Anyone can update their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Anyone can update their own reset tokens" 
  ON password_reset_tokens 
  FOR UPDATE 
  USING (true);

-- Function to clean up expired tokens (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens 
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON password_reset_tokens TO anon;
GRANT ALL ON password_reset_tokens TO authenticated;

