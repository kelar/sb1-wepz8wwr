/*
  # Add RLS policies for forbruk table

  1. Changes
    - Add UPDATE policy for forbruk table
    - Add DELETE policy for forbruk table
  
  2. Security
    - Allow authenticated users to update and delete their forbruk records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Alle kan lese forbruk" ON forbruk;
DROP POLICY IF EXISTS "Authenticated users can insert forbruk" ON forbruk;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON forbruk
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON forbruk
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON forbruk
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON forbruk
  FOR DELETE
  TO authenticated
  USING (true);