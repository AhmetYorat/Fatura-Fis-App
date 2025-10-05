import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side için service role key kullan
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // URL parametrelerini al
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const fisNo = searchParams.get('fisNo');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Supabase query'si başlat
    let query = supabase
      .from('fisler')
      .select('*', { count: 'exact' });

    // Filtreler uygula
    if (search) {
      // Supabase RPC function kullanarak hem fiş no hem de ürün içeriğinde arama
      const searchTerm = search.trim();
      
      try {
        // Custom PostgreSQL function çağır
        const { data: searchData, error: searchError } = await supabase
          .rpc('search_fisler', { search_term: searchTerm });
          
        if (searchError) {
          console.log('RPC search not available, fallback to basic search:', searchError);
          // RPC yoksa normal arama yap
          query = query.ilike('fis_no', `%${searchTerm}%`);
        } else {
          // RPC sonuçlarını kullan
          if (searchData && searchData.length > 0) {
            const ids = searchData.map((item: any) => item.id);
            query = query.in('id', ids);
          } else {
            // Hiç sonuç yoksa boş sorgu
            query = query.eq('id', '00000000-0000-0000-0000-000000000000');
          }
        }
      } catch (error) {
        console.log('RPC error, using basic search:', error);
        // Hata durumunda basit arama
        query = query.ilike('fis_no', `%${searchTerm}%`);
      }
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      // Bitiş tarihine gün sonu ekle
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDateTime.toISOString());
    }

    if (fisNo) {
      query = query.ilike('fis_no', `%${fisNo}%`);
    }

    if (minAmount) {
      query = query.gte('total', parseFloat(minAmount));
    }

    if (maxAmount) {
      query = query.lte('total', parseFloat(maxAmount));
    }

    // Sayfalama uygula
    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: 'Veritabanı hatası', 
        details: error.message 
      }, { status: 500 });
    }

    // Toplam sayfa sayısını hesapla
    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        search,
        startDate,
        endDate,
        fisNo,
        minAmount,
        maxAmount
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası', 
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        error: 'Geçersiz ID listesi'
      }, { status: 400 });
    }

    console.log('Silme işlemi başlatılıyor:', ids);

    // Raw SQL ile silme işlemi (RLS bypass için)
    const { data, error } = await supabase.rpc('delete_fisler', { 
      fis_ids: ids 
    });

    if (error) {
      console.error('Supabase silme hatası:', error);
      
      // Eğer function yoksa normal delete dene
      const { data: deleteData, error: deleteError } = await supabase
        .from('fisler')
        .delete()
        .in('id', ids)
        .select();

      if (deleteError) {
        console.error('Normal delete de başarısız:', deleteError);
        return NextResponse.json({
          error: 'Veritabanı silme hatası',
          details: deleteError.message
        }, { status: 500 });
      }

      console.log('Normal delete başarılı:', deleteData);
      
      return NextResponse.json({
        success: true,
        message: `${ids.length} fiş başarıyla silindi`,
        deletedIds: ids,
        method: 'normal_delete'
      });
    }

    console.log('RPC silme işlemi başarılı:', data);

    return NextResponse.json({
      success: true,
      message: `${ids.length} fiş başarıyla silindi`,
      deletedIds: ids,
      method: 'rpc_delete'
    });

  } catch (error) {
    console.error('DELETE API Error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}