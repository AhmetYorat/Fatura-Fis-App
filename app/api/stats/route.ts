import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Tüm fisler verilerini al
    const { data: fisler, error, count } = await supabase
      .from('fisler')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        error: 'Veritabanı hatası',
        details: error.message
      }, { status: 500 });
    }

    // İstatistikleri hesapla
    const totalRecords = count || 0;
    const totalAmount = fisler?.reduce((sum, fis) => sum + Number(fis.total), 0) || 0;
    const totalKdv = fisler?.reduce((sum, fis) => sum + Number(fis.total_kdv), 0) || 0;
    const averageAmount = totalRecords > 0 ? totalAmount / totalRecords : 0;

    // Bugünkü kayıtlar (created_at bazında)
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = fisler?.filter(fis => 
      fis.created_at.startsWith(today)
    ).length || 0;

    return NextResponse.json({
      success: true,
      stats: {
        total_records: totalRecords,
        total_amount: Math.round(totalAmount * 100) / 100, // 2 decimal places
        total_kdv: Math.round(totalKdv * 100) / 100,
        average_amount: Math.round(averageAmount * 100) / 100,
        today_records: todayRecords
      },
      recent_fisler: fisler?.slice(0, 5) || [] // Son 5 fiş
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      error: 'İstatistik verilerinde hata',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}