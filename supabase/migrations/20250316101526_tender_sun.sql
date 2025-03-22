/*
  # Update RLS Policies for Massetyper Table

  1. Changes
    - Update INSERT policy for massetyper table to properly handle authenticated users
    - Add UPDATE and DELETE policies for massetyper table
  
  2. Security
    - Ensure authenticated users can insert new massetyper
    - Add policies for updating and deleting massetyper
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert massetyper" ON massetyper;

-- Create new INSERT policy
CREATE POLICY "Enable insert for authenticated users"
  ON massetyper
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add UPDATE policy
CREATE POLICY "Enable update for authenticated users"
  ON massetyper
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add DELETE policy
CREATE POLICY "Enable delete for authenticated users"
  ON massetyper
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);