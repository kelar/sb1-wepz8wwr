/*
  # Initial Schema for Masse Tracker App

  1. New Tables
    - `massetyper`: Lagrer ulike typer masse (singel, pukk, grus, etc.)
      - `id` (uuid, primary key)
      - `navn` (text)
      - `created_at` (timestamp)
    
    - `prosjekter`: Lagrer prosjekter/bruksområder
      - `id` (uuid, primary key)
      - `navn` (text)
      - `created_at` (timestamp)
    
    - `forbruk`: Lagrer forbruk av masse per prosjekt
      - `id` (uuid, primary key)
      - `massetype_id` (uuid, foreign key)
      - `prosjekt_id` (uuid, foreign key)
      - `antall_skuffer` (integer)
      - `dato` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Massetyper tabell
CREATE TABLE massetyper (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  navn text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE massetyper ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alle kan lese massetyper"
  ON massetyper
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert massetyper"
  ON massetyper
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Prosjekter tabell
CREATE TABLE prosjekter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  navn text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prosjekter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alle kan lese prosjekter"
  ON prosjekter
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert prosjekter"
  ON prosjekter
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Forbruk tabell
CREATE TABLE forbruk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  massetype_id uuid REFERENCES massetyper(id),
  prosjekt_id uuid REFERENCES prosjekter(id),
  antall_skuffer integer NOT NULL,
  dato timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forbruk ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alle kan lese forbruk"
  ON forbruk
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert forbruk"
  ON forbruk
  FOR INSERT
  TO authenticated
  WITH CHECK (true);