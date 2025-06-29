-- Security Policies for Import Tables
-- Run this in the Supabase SQL Editor to add comprehensive RLS policies

-- Drop existing policies if they exist (for import tables)
DROP POLICY IF EXISTS "Users can insert their own imports" ON import_flights;
DROP POLICY IF EXISTS "Users can update their own imports" ON import_flights;
DROP POLICY IF EXISTS "Users can delete their own imports" ON import_flights;

DROP POLICY IF EXISTS "Users can insert their own imports" ON import_accommodation;
DROP POLICY IF EXISTS "Users can update their own imports" ON import_accommodation;
DROP POLICY IF EXISTS "Users can delete their own imports" ON import_accommodation;

DROP POLICY IF EXISTS "Users can insert their own imports" ON import_events;
DROP POLICY IF EXISTS "Users can update their own imports" ON import_events;
DROP POLICY IF EXISTS "Users can delete their own imports" ON import_events;

DROP POLICY IF EXISTS "Users can insert their own imports" ON import_transport;
DROP POLICY IF EXISTS "Users can update their own imports" ON import_transport;
DROP POLICY IF EXISTS "Users can delete their own imports" ON import_transport;

DROP POLICY IF EXISTS "Users can insert their own imports" ON import_cruise;
DROP POLICY IF EXISTS "Users can update their own imports" ON import_cruise;
DROP POLICY IF EXISTS "Users can delete their own imports" ON import_cruise;

-- Create INSERT policies for each table
CREATE POLICY "Users can insert their own imports" ON import_flights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports" ON import_accommodation
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports" ON import_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports" ON import_transport
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports" ON import_cruise
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policies for each table
CREATE POLICY "Users can update their own imports" ON import_flights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports" ON import_accommodation
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports" ON import_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports" ON import_transport
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports" ON import_cruise
  FOR UPDATE USING (auth.uid() = user_id);

-- Create DELETE policies for each table
CREATE POLICY "Users can delete their own imports" ON import_flights
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports" ON import_accommodation
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports" ON import_events
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports" ON import_transport
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports" ON import_cruise
  FOR DELETE USING (auth.uid() = user_id);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename LIKE 'import_%'
ORDER BY tablename, policyname; 