/*
  # Fix forbruk policies and add update policy

  1. Changes
    - Drop existing policies
    - Create new simplified policies for authenticated users
    - Add explicit update policy
  
  2. Security
    - Enable all CRUD operations for authenticated users
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON forbruk;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON forbruk;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON forbruk;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON forbruk;

-- Create new simplified policies
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
  USING (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON forbruk
  FOR DELETE
  TO authenticated
  USING (true);