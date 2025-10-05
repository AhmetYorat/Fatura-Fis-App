import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' }, 
        { status: 400 }
      );
    }

    // Dosya validasyonu
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'dan büyük olamaz' }, 
        { status: 400 }
      );
    }

    // Desteklenen dosya tipleri
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya tipi. Sadece PDF, JPG, PNG dosyaları kabul edilir.' }, 
        { status: 400 }
      );
    }

    // Görsel dosyalar için ek kontrol
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      // Minimum boyut kontrolü (çok küçük resimler muhtemelen fiş değildir)
      if (file.size < 10000) { // 10KB'dan küçük
        return NextResponse.json(
          { error: 'Görsel dosya çok küçük. Lütfen daha kaliteli bir fiş fotoğrafı yükleyin.' }, 
          { status: 400 }
        );
      }
    }

    // n8n webhook URL'sini kontrol et
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl || n8nWebhookUrl === 'https://your-n8n-instance.com/webhook/your-webhook-path') {
      // n8n yapılandırılmamışsa eski davranışı koru
      console.log('n8n webhook yapılandırılmamış, yerel işlem yapılıyor');
      console.log('Yüklenen dosya:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      });

      return NextResponse.json({
        message: 'Dosya başarıyla yüklendi (yerel)',
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        }
      });
    }

    // n8n webhook'una dosyayı gönder
    console.log('n8n webhook\'una gönderiliyor:', n8nWebhookUrl);
    
    const n8nFormData = new FormData();
    n8nFormData.append('file', file);
    n8nFormData.append('originalName', file.name);
    n8nFormData.append('fileSize', file.size.toString());
    n8nFormData.append('fileType', file.type);
    n8nFormData.append('uploadedAt', new Date().toISOString());

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      body: n8nFormData,
      headers: {
        // FormData için Content-Type header'ı otomatik set edilir
      }
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n webhook hatası: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

    const n8nData = await n8nResponse.json();
    
    console.log('n8n yanıtı:', n8nData);

    // n8n'den gelen yanıtı front-end'e döndür
    return NextResponse.json({
      message: 'Dosya başarıyla işlendi',
      n8nResponse: n8nData,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Dosya yükleme hatası: ' + (error as Error).message }, 
      { status: 500 }
    );
  }
}