-- Migration: Add Archive columns for existing users
-- This migration ensures all existing users have an Archive column

-- First, add the is_archive column to the planner_columns table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'planner_columns' 
        AND column_name = 'is_archive'
    ) THEN
        ALTER TABLE planner_columns ADD COLUMN is_archive BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create Archive columns for all users who don't have one
INSERT INTO planner_columns (title, position, user_id, is_archive)
SELECT 
    'Archive' as title,
    COALESCE(MAX(pc.position) + 1, 1) as position,
    p.id as user_id,
    TRUE as is_archive
FROM profiles p
LEFT JOIN planner_columns pc ON p.id = pc.user_id
LEFT JOIN planner_columns existing_archive ON p.id = existing_archive.user_id AND existing_archive.title = 'Archive'
WHERE existing_archive.id IS NULL
GROUP BY p.id;

-- Update the is_archive flag for any existing Archive columns that might not have it set
UPDATE planner_columns 
SET is_archive = TRUE 
WHERE title = 'Archive' AND (is_archive IS NULL OR is_archive = FALSE); 