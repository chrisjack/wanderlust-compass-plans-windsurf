-- Remove columns from planner_trips
ALTER TABLE planner_trips 
  DROP COLUMN IF EXISTS priority,
  DROP COLUMN IF EXISTS deadline_date;

-- Add client_id column
ALTER TABLE planner_trips
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id);

-- Create tags table
CREATE TABLE IF NOT EXISTS planner_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trip_tags junction table
CREATE TABLE IF NOT EXISTS planner_trip_tags (
  trip_id UUID REFERENCES planner_trips(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES planner_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (trip_id, tag_id)
);

-- Create links table
CREATE TABLE IF NOT EXISTS planner_trip_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES planner_trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create text entries table
CREATE TABLE IF NOT EXISTS planner_trip_texts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES planner_trips(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for new tables
ALTER TABLE planner_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_trip_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_trip_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_trip_texts ENABLE ROW LEVEL SECURITY;

-- Tags policies
CREATE POLICY "Users can view their own tags"
  ON planner_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM planner_trip_tags
    JOIN planner_trips ON planner_trips.id = planner_trip_tags.trip_id
    WHERE planner_trip_tags.tag_id = planner_tags.id
    AND planner_trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can create tags"
  ON planner_tags FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own tags"
  ON planner_tags FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM planner_trip_tags
    JOIN planner_trips ON planner_trips.id = planner_trip_tags.trip_id
    WHERE planner_trip_tags.tag_id = planner_tags.id
    AND planner_trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own tags"
  ON planner_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM planner_trip_tags
    JOIN planner_trips ON planner_trips.id = planner_trip_tags.trip_id
    WHERE planner_trip_tags.tag_id = planner_tags.id
    AND planner_trips.user_id = auth.uid()
  ));

-- Trip tags policies
CREATE POLICY "Users can view their own trip tags"
  ON planner_trip_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_tags.trip_id
    AND planner_trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can create trip tags"
  ON planner_trip_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_tags.trip_id
    AND planner_trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own trip tags"
  ON planner_trip_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_tags.trip_id
    AND planner_trips.user_id = auth.uid()
  ));

-- Links policies
CREATE POLICY "Users can view their own trip links"
  ON planner_trip_links FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_links.trip_id
    AND planner_trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can create trip links"
  ON planner_trip_links FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_links.trip_id
    AND planner_trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own trip links"
  ON planner_trip_links FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_links.trip_id
    AND planner_trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own trip links"
  ON planner_trip_links FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_links.trip_id
    AND planner_trips.user_id = auth.uid()
  ));

-- Text entries policies
CREATE POLICY "Users can view their own trip texts"
  ON planner_trip_texts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_texts.trip_id
    AND planner_trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can create trip texts"
  ON planner_trip_texts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_texts.trip_id
    AND planner_trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own trip texts"
  ON planner_trip_texts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_texts.trip_id
    AND planner_trips.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own trip texts"
  ON planner_trip_texts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM planner_trips
    WHERE planner_trips.id = planner_trip_texts.trip_id
    AND planner_trips.user_id = auth.uid()
  )); 