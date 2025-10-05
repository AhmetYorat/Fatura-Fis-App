-- JSONB içinde arama yapmak için PostgreSQL function oluştur

-- Önce mevcut function'ı sil
DROP FUNCTION IF EXISTS search_fisler(TEXT);

CREATE OR REPLACE FUNCTION search_fisler(search_term TEXT DEFAULT '')
RETURNS TABLE (
  id UUID,
  fis_no TEXT,
  tarih_saat TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total DECIMAL,
  total_kdv DECIMAL,
  items JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF search_term = '' OR search_term IS NULL THEN
    RETURN QUERY
    SELECT f.id, f.fis_no, f.tarih_saat, f.created_at, f.updated_at, f.total, f.total_kdv, f.items
    FROM fisler f
    ORDER BY f.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT f.id, f.fis_no, f.tarih_saat, f.created_at, f.updated_at, f.total, f.total_kdv, f.items
    FROM fisler f
    WHERE 
      f.fis_no ILIKE '%' || search_term || '%'
      OR EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(f.items) AS item 
        WHERE item->>'name' ILIKE '%' || search_term || '%'
      )
    ORDER BY f.created_at DESC;
  END IF;
END;
$$;

-- Supabase RPC için function permission
GRANT EXECUTE ON FUNCTION search_fisler(TEXT) TO anon, authenticated;