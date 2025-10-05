-- Supabase Fatura Sistemi Veritabanı Şeması
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- fisler tablosunu oluştur
CREATE TABLE IF NOT EXISTS fisler (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fis_no TEXT NOT NULL,
    tarih_saat TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_kdv NUMERIC(10,2) NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Indeksler
CREATE INDEX IF NOT EXISTS idx_fisler_fis_no ON fisler(fis_no);
CREATE INDEX IF NOT EXISTS idx_fisler_tarih_saat ON fisler(tarih_saat);
CREATE INDEX IF NOT EXISTS idx_fisler_created_at ON fisler(created_at);
CREATE INDEX IF NOT EXISTS idx_fisler_total ON fisler(total);

-- RLS (Row Level Security) politikaları
ALTER TABLE fisler ENABLE ROW LEVEL SECURITY;

-- Tüm kullanıcılar okuyabilir
CREATE POLICY "Enable read access for all users" ON fisler
    FOR SELECT
    USING (true);

-- Tüm kullanıcılar ekleyebilir
CREATE POLICY "Enable insert access for all users" ON fisler
    FOR INSERT
    WITH CHECK (true);

-- Tüm kullanıcılar güncelleyebilir
CREATE POLICY "Enable update access for all users" ON fisler
    FOR UPDATE
    USING (true);

-- Updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at trigger'ı
CREATE TRIGGER update_fisler_updated_at 
    BEFORE UPDATE ON fisler 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Örnek veri ekleme (test için)
INSERT INTO fisler (fis_no, tarih_saat, total, total_kdv, items) VALUES 
(
    'FSH001',
    '2024-10-03 14:30:00+03',
    15.84,
    1.42,
    '[
        {
            "name": "YUMURTA",
            "quantity": 10,
            "unit_price": 0.5,
            "kdv": 0.37,
            "total": 5.74
        },
        {
            "name": "EKMEK", 
            "quantity": 5,
            "unit_price": 1.0,
            "kdv": 0.05,
            "total": 5.1
        },
        {
            "name": "SÜT",
            "quantity": 2,
            "unit_price": 2.5,
            "kdv": 1.0,
            "total": 6.0
        }
    ]'::jsonb
),
(
    'FSH002',
    '2024-10-03 16:45:00+03',
    22.50,
    2.05,
    '[
        {
            "name": "DOMATES",
            "quantity": 2,
            "unit_price": 3.5,
            "kdv": 0.63,
            "total": 7.63
        },
        {
            "name": "SOĞAN",
            "quantity": 3,
            "unit_price": 2.0,
            "kdv": 0.54,
            "total": 6.54
        },
        {
            "name": "PATATES",
            "quantity": 4,
            "unit_price": 2.0,
            "kdv": 0.88,
            "total": 8.88
        }
    ]'::jsonb
),
(
    'FSH003',
    '2024-10-02 10:15:00+03',
    8.75,
    0.79,
    '[
        {
            "name": "ÇIKOLATA",
            "quantity": 1,
            "unit_price": 4.5,
            "kdv": 0.41,
            "total": 4.91
        },
        {
            "name": "BISKÜVI",
            "quantity": 2,
            "unit_price": 1.75,
            "kdv": 0.32,
            "total": 3.82
        }
    ]'::jsonb
);