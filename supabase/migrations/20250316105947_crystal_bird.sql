/*
  # Update weight calculations in massetype stats function

  1. Changes
    - Drop and recreate get_massetype_stats function with proper weight calculations
    - Ensure weight_per_skuff is included in the JSON output
    - Add total_weight calculation based on weight_per_skuff and antall_skuffer

  2. Security
    - Maintain SECURITY DEFINER setting
    - Keep existing permissions for authenticated users
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_massetype_stats(timestamp with time zone, timestamp with time zone);

-- Recreate function with proper weight calculations
CREATE OR REPLACE FUNCTION get_massetype_stats(start_date timestamp with time zone, end_date timestamp with time zone)
RETURNS TABLE (
  massetyper json,
  sum_skuffer bigint,
  total_weight numeric(10,2)
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    json_build_object(
      'id', m.id,
      'navn', m.navn,
      'weight_per_skuff', m.weight_per_skuff
    ) as massetyper,
    COALESCE(SUM(f.antall_skuffer), 0) as sum_skuffer,
    COALESCE(SUM(f.antall_skuffer * COALESCE(m.weight_per_skuff, 0)), 0) as total_weight
  FROM massetyper m
  LEFT JOIN forbruk f ON f.massetype_id = m.id
    AND f.dato >= start_date
    AND f.dato < end_date
  GROUP BY m.id, m.navn, m.weight_per_skuff
  ORDER BY m.navn;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_massetype_stats TO authenticated;