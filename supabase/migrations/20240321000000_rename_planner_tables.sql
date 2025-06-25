-- Rename existing tables
ALTER TABLE tasks RENAME TO planner_trips;
ALTER TABLE task_columns RENAME TO planner_columns;

-- Create new tables
CREATE TABLE planner_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL,
    deadline_date TIMESTAMP WITH TIME ZONE,
    planner_trip_id UUID REFERENCES planner_trips(id) ON DELETE CASCADE,
    column_id UUID REFERENCES planner_columns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE planner_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    planner_trip_id UUID REFERENCES planner_trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_planner_tasks_user_id ON planner_tasks(user_id);
CREATE INDEX idx_planner_tasks_planner_trip_id ON planner_tasks(planner_trip_id);
CREATE INDEX idx_planner_tasks_column_id ON planner_tasks(column_id);
CREATE INDEX idx_planner_notes_user_id ON planner_notes(user_id);
CREATE INDEX idx_planner_notes_planner_trip_id ON planner_notes(planner_trip_id);

-- Add RLS policies
ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own planner tasks"
    ON planner_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planner tasks"
    ON planner_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planner tasks"
    ON planner_tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planner tasks"
    ON planner_tasks FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own planner notes"
    ON planner_notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planner notes"
    ON planner_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planner notes"
    ON planner_notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planner notes"
    ON planner_notes FOR DELETE
    USING (auth.uid() = user_id); 