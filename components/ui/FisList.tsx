'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Skeleton, DataTable, Badge } from '@/components';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AlertCircle, FileText } from 'lucide-react';

interface FisData {
  id: string;
  fis_no: string;
  total: number;
  total_kdv: number;
  created_at: string;
  tarih_saat: string;
  items?: any[];
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FisListResponse {
  success: boolean;
  data: FisData[];
  pagination: PaginationData;
  filters: Record<string, string | null>;
  error?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FisListProps {
  className?: string;
}

export function FisList({ className = "" }: FisListProps) {
  const searchParams = useSearchParams();
  
  // URL parametrelerini query string'e çevir
  const queryString = searchParams.toString();
  const apiUrl = `/api/fisler${queryString ? `?${queryString}` : ''}`;
  
  const { data: response, error, isLoading } = useSWR<FisListResponse>(apiUrl, fetcher);

  // Tablo sütunları
  const columns = [
    { 
      key: 'fis_no' as const, 
      title: 'Fiş No',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span className="font-medium">{String(value || '')}</span>
        </div>
      )
    },
    { 
      key: 'tarih_saat' as const, 
      title: 'Tarih',
      render: (value: any) => formatDate(String(value || ''))
    },
    { 
      key: 'total' as const, 
      title: 'Toplam Tutar', 
      align: 'right' as const,
      render: (value: any) => formatCurrency(Number(value || 0))
    },
    { 
      key: 'total_kdv' as const, 
      title: 'KDV', 
      align: 'right' as const,
      render: (value: any) => formatCurrency(Number(value || 0))
    },
    { 
      key: 'items' as const, 
      title: 'Durum',
      render: (value: any) => (
        <Badge 
          variant={value && Array.isArray(value) && value.length > 0 ? 'success' : 'warning'}
        >
          {value && Array.isArray(value) && value.length > 0 ? 'İşlenmiş' : 'Ham Veri'}
        </Badge>
      )
    },
  ];

  // Loading durumu
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error durumu
  if (error || (response && !response.success)) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Veriler Yüklenemedi</h3>
        <p className="text-slate-600 mb-4">
          {response?.error || error?.message || 'Bilinmeyen bir hata oluştu'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  // Veri yok durumu
  if (!response?.data || response.data.length === 0) {
    const hasFilters = Object.values(response?.filters || {}).some(value => value);
    
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <FileText className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {hasFilters ? 'Filtrelerinize Uygun Sonuç Bulunamadı' : 'Henüz Fiş Bulunamadı'}
        </h3>
        <p className="text-slate-600 mb-4">
          {hasFilters 
            ? 'Farklı filtreler deneyerek arama yapabilirsiniz.'
            : 'İlk fişinizi yüklemek için yukarıdaki yükleme butonunu kullanın.'
          }
        </p>
        {hasFilters && (
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tüm Fişleri Göster
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sonuç özeti */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          {response.pagination.total} sonuçtan {response.data.length} tanesi gösteriliyor
        </span>
        <span>
          Sayfa {response.pagination.page} / {response.pagination.totalPages}
        </span>
      </div>

      {/* Fiş tablosu */}
      <DataTable 
        data={response.data}
        columns={columns}
        className="border rounded-lg"
      />

      {/* Sayfalama */}
      {response.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={!response.pagination.hasPrev}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(response.pagination.page - 1));
              window.location.href = `?${params.toString()}`;
            }}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Önceki
          </button>
          
          <span className="px-4 py-1 text-sm bg-blue-100 text-blue-700 rounded">
            {response.pagination.page}
          </span>
          
          <button
            disabled={!response.pagination.hasNext}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(response.pagination.page + 1));
              window.location.href = `?${params.toString()}`;
            }}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}