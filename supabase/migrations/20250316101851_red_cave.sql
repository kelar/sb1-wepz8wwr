/*
  # Fix Authentication and RLS Policies

  1. Changes
    - Simplify RLS policies to use basic authentication checks
    - Remove user_id requirements for now to simplify data access
    - Enable basic CRUD operations for authenticated users
  
  2. Security
    - Maintain RLS with authentication checks
    - Allow authenticated users to access all records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON massetyper;

-- Create simplified policies
CREATE POLICY "Enable read access for authenticated users"
  ON massetyper
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON massetyper
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON massetyper
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON massetyper
  FOR DELETE
  TO authenticated
  USING (true);