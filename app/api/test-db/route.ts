import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Tablo var mı kontrol et
    const { data: fisler, error, count } = await supabase
      .from('fisler')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    // İstatistikler hesapla
    const totalAmount = fisler?.reduce((sum, fis) => sum + Number(fis.total), 0) || 0;
    const totalKdv = fisler?.reduce((sum, fis) => sum + Number(fis.total_kdv), 0) || 0;
    const avgAmount = count ? totalAmount / count : 0;

    // Bugünkü kayıtlar
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = fisler?.filter(fis => 
      fis.created_at.startsWith(today)
    ).length || 0;

    return NextResponse.json({
      success: true,
      message: 'Supabase bağlantısı başarılı!',
      stats: {
        total_records: count,
        total_amount: totalAmount,
        total_kdv: totalKdv,
        average_amount: avgAmount,
        today_records: todayRecords
      },
      sample_data: fisler?.slice(0, 2), // İlk 2 kayıt
      schema_check: {
        has_fis_no: fisler?.[0]?.hasOwnProperty('fis_no'),
        has_items: fisler?.[0]?.hasOwnProperty('items'),
        has_total: fisler?.[0]?.hasOwnProperty('total'),
        items_is_array: Array.isArray(fisler?.[0]?.items)
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Veritabanı bağlantı hatası',
      details: error
    }, { status: 500 });
  }
}