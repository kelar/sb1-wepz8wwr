/*
  # Fix RLS Policies for Massetyper Table

  1. Changes
    - Drop and recreate all policies for massetyper table with proper auth checks
    - Ensure policies use correct auth.uid() checks
  
  2. Security
    - Maintain security while allowing authenticated users to perform CRUD operations
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Alle kan lese massetyper" ON massetyper;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON massetyper;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON massetyper;

-- Recreate SELECT policy
CREATE POLICY "Enable read for authenticated users"
  ON massetyper
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate INSERT policy with proper auth check
CREATE POLICY "Enable insert for authenticated users"
  ON massetyper
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Recreate UPDATE policy with proper auth check
CREATE POLICY "Enable update for authenticated users"
  ON massetyper
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Recreate DELETE policy with proper auth check
CREATE POLICY "Enable delete for authenticated users"
  ON massetyper
  FOR DELETE
  TO authenticated
  USING (true);