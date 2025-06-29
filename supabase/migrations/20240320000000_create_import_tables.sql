-- Create import_flights table
CREATE TABLE IF NOT EXISTS import_flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_number TEXT,
  airline TEXT,
  departure_airport TEXT,
  arrival_airport TEXT,
  departure_time TIMESTAMP WITH TIME ZONE,
  arrival_time TIMESTAMP WITH TIME ZONE,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create import_accommodation table
CREATE TABLE IF NOT EXISTS import_accommodation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_name TEXT,
  check_in_date DATE,
  check_out_date DATE,
  room_type TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create import_events table
CREATE TABLE IF NOT EXISTS import_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create import_transport table
CREATE TABLE IF NOT EXISTS import_transport (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transport_type TEXT,
  departure_location TEXT,
  arrival_location TEXT,
  departure_time TIMESTAMP WITH TIME ZONE,
  arrival_time TIMESTAMP WITH TIME ZONE,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create import_cruise table
CREATE TABLE IF NOT EXISTS import_cruise (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cruise_line TEXT,
  ship_name TEXT,
  departure_port TEXT,
  arrival_port TEXT,
  departure_date DATE,
  arrival_date DATE,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE import_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_accommodation ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_cruise ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own imports" ON import_flights;
DROP POLICY IF EXISTS "Users can view their own imports" ON import_accommodation;
DROP POLICY IF EXISTS "Users can view their own imports" ON import_events;
DROP POLICY IF EXISTS "Users can view their own imports" ON import_transport;
DROP POLICY IF EXISTS "Users can view their own imports" ON import_cruise;

-- Create policies for each table
CREATE POLICY "Users can view their own imports" ON import_flights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports" ON import_flights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports" ON import_flights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports" ON import_flights
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own imports" ON import_accommodation
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports" ON import_accommodation
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports" ON import_accommodation
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports" ON import_accommodation
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own imports" ON import_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports" ON import_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports" ON import_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports" ON import_events
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own imports" ON import_transport
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports" ON import_transport
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports" ON import_transport
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports" ON import_transport
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own imports" ON import_cruise
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports" ON import_cruise
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports" ON import_cruise
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports" ON import_cruise
  FOR DELETE USING (auth.uid() = user_id); 