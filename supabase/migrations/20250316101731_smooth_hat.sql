/*
  # Fix RLS Policies for Massetyper Table

  1. Changes
    - Drop and recreate all policies with simplified conditions
    - Add user_id column to track ownership
    - Add default value for user_id using auth.uid()
  
  2. Security
    - Maintain RLS with proper authentication checks
    - Ensure each record is associated with the creating user
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

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON massetyper;

-- Create new policies with simplified conditions
CREATE POLICY "Enable read access for authenticated users"
  ON massetyper
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON massetyper
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update access for authenticated users"
  ON massetyper
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete access for authenticated users"
  ON massetyper
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);