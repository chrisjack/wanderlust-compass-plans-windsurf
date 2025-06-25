-- Add user_id column to import_flights if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='import_flights' AND column_name='user_id'
    ) THEN
        ALTER TABLE import_flights ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add user_id column to import_accommodation if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='import_accommodation' AND column_name='user_id'
    ) THEN
        ALTER TABLE import_accommodation ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add user_id column to import_events if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='import_events' AND column_name='user_id'
    ) THEN
        ALTER TABLE import_events ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add user_id column to import_transport if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='import_transport' AND column_name='user_id'
    ) THEN
        ALTER TABLE import_transport ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add user_id column to import_cruise if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='import_cruise' AND column_name='user_id'
    ) THEN
        ALTER TABLE import_cruise ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$; 