/*
  # Fix RLS policies for massetyper table

  1. Changes
    - Drop existing policies
    - Create new simplified policies for authenticated users
    - Add user_id column for ownership tracking
    - Set default value for user_id to current user's ID

  2. Security
    - Enable all CRUD operations for authenticated users
    - Ensure user_id is set automatically
*/

-- Add user_id column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'massetyper' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE massetyper ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON massetyper;

-- Create new simplified policies
CREATE POLICY "Enable read access for authenticated users"
  ON massetyper
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON massetyper
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for authenticated users"
  ON massetyper
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for authenticated users"
  ON massetyper
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);