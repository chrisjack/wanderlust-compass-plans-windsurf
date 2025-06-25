-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_user_emails_email;

-- Create user_emails table
CREATE TABLE IF NOT EXISTS user_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own emails" ON user_emails;
DROP POLICY IF EXISTS "Users can insert their own emails" ON user_emails;
DROP POLICY IF EXISTS "Users can update their own emails" ON user_emails;
DROP POLICY IF EXISTS "Users can delete their own emails" ON user_emails;

-- Create policies
CREATE POLICY "Users can view their own emails" ON user_emails
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emails" ON user_emails
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emails" ON user_emails
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails" ON user_emails
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_user_emails_email ON user_emails(email); 