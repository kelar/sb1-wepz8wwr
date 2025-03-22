/*
  # Add user_id to prosjekter table and update policies

  1. Changes
    - Add user_id column to prosjekter table
    - Update RLS policies to use user_id for access control

  2. Security
    - Enable RLS
    - Add policies for authenticated users based on user_id
*/

-- Add user_id column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prosjekter' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE prosjekter ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Alle kan lese prosjekter" ON prosjekter;
DROP POLICY IF EXISTS "Authenticated users can insert prosjekter" ON prosjekter;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON prosjekter
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON prosjekter
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for authenticated users"
  ON prosjekter
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for authenticated users"
  ON prosjekter
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);