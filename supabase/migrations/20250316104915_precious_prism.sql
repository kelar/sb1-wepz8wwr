/*
  # Add database functions for statistics

  1. New Functions
    - `get_massetype_stats`: Aggregates forbruk data by massetype
    - `get_prosjekt_stats`: Aggregates forbruk data by prosjekt

  2. Security
    - Functions are accessible to authenticated users only
*/

-- Function to get massetype statistics
CREATE OR REPLACE FUNCTION get_massetype_stats(start_date timestamp with time zone, end_date timestamp with time zone)
RETURNS TABLE (
  massetyper json,
  sum_skuffer bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    json_build_object(
      'id', m.id,
      'navn', m.navn
    ) as massetyper,
    COALESCE(SUM(f.antall_skuffer), 0) as sum_skuffer
  FROM massetyper m
  LEFT JOIN forbruk f ON f.massetype_id = m.id
    AND f.dato >= start_date
    AND f.dato < end_date
  GROUP BY m.id, m.navn
  ORDER BY m.navn;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_massetype_stats TO authenticated;

-- Function to get prosjekt statistics
CREATE OR REPLACE FUNCTION get_prosjekt_stats(start_date timestamp with time zone, end_date timestamp with time zone)
RETURNS TABLE (
  prosjekter json,
  sum_skuffer bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    json_build_object(
      'id', p.id,
      'navn', p.navn
    ) as prosjekter,
    COALESCE(SUM(f.antall_skuffer), 0) as sum_skuffer
  FROM prosjekter p
  LEFT JOIN forbruk f ON f.prosjekt_id = p.id
    AND f.dato >= start_date
    AND f.dato < end_date
  GROUP BY p.id, p.navn
  ORDER BY p.navn;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_prosjekt_stats TO authenticated;