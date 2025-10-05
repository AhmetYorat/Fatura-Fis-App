'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Package, Eye, Trash2, AlertTriangle, Check, Square, CheckSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { mutate } from 'swr';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import type { Fis } from '@/types/database';

interface FisListResponse {
  success: boolean;
  data: Fis[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function FisList() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFisIds, setSelectedFisIds] = useState<Set<string>>(new Set());
  const [exportMode, setExportMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 20;

  // URL'den filtreleri al
  const search = searchParams.get('search') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const fisNo = searchParams.get('fisNo') || '';
  const minAmount = searchParams.get('minAmount') || '';
  const maxAmount = searchParams.get('maxAmount') || '';

  // API endpoint oluştur
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', pageSize.toString());
    
    if (search) params.set('search', search);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (fisNo) params.set('fisNo', fisNo);
    if (minAmount) params.set('minAmount', minAmount);
    if (maxAmount) params.set('maxAmount', maxAmount);
    
    return `/api/fisler?${params.toString()}`;
  };

  const { data, error, isLoading } = useSWR<FisListResponse>(buildApiUrl(), async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Veriler alınamadı');
    return res.json();
  }, {
    revalidateOnFocus: true,
    refreshInterval: 0,
    revalidateOnReconnect: true
  });

  const handlePrevPage = () => {
    if (data?.pagination.hasPrev) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.pagination.hasNext) {
      setPage(page + 1);
    }
  };

  // Page numarasını doğrudan set etme
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.pagination.totalPages || 1)) {
      setPage(newPage);
    }
  };

  // Seçim modu yönetimi
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setExportMode(false);
    setSelectedFisIds(new Set());
  };

  const handleExportButton = async () => {
    // If not currently in any selection mode, enter selection mode in export state
    if (!selectionMode) {
      setSelectionMode(true);
      setExportMode(true);
      setSelectedFisIds(new Set());
      toast('Excel\'e aktarmak için fişleri seçin');
      return;
    }

    // If we're in selection mode + export mode and have selected items, perform export
    if (selectionMode && exportMode) {
      if (selectedFisIds.size === 0) {
        toast.error('Lütfen aktarılacak fişleri seçin');
        return;
      }
      await exportSelectedToExcel();
      return;
    }

    // If we're in selection mode but not export mode, switch to export mode
    setExportMode(true);
    setSelectedFisIds(new Set());
    toast('Excel\'e aktarmak için fişleri seçin');
  };

  const exportSelectedToExcel = async () => {
    if (!data || !data.data) return;
    const selectedFis = data.data.filter((f) => selectedFisIds.has(f.id));
    if (selectedFis.length === 0) {
      toast.error('Seçili fiş yok');
      return;
    }

    setIsExporting(true);
    try {
      const rows = selectedFis.map((fis) => ({
        'Fiş No': fis.fis_no,
        'Fiş Tarihi': fis.tarih_saat ? format(new Date(fis.tarih_saat), 'd MMMM yyyy HH:mm', { locale: tr }) : '',
  'Oluşturulma Tarihi': format(new Date(fis.created_at), 'd MMMM yyyy HH:mm', { locale: tr }),
        'Toplam': formatCurrency(fis.total),
        'Ürün Sayısı': Array.isArray(fis.items) ? fis.items.length : 0,
        // use newline separators so Excel can wrap lines
        'Ürünler': Array.isArray(fis.items) ? fis.items.map(it => `${it.name} x ${it.quantity}`).join('\n') : ''
      }));

      const XLSX = (await import('xlsx')) as any;
      const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });

      // set reasonable column widths and enable wrap for Ürünler column
      const headers = Object.keys(rows[0] || {});
      ws['!cols'] = headers.map((h: string) => ({ wch: h === 'Ürünler' ? 80 : (h.includes('Toplam') ? 14 : 12) }));

      // find Ürünler column index and set wrapText on its cells
      const range = XLSX.utils.decode_range(ws['!ref']);
      const produktyIndex = headers.indexOf('Ürünler');
      if (produktyIndex >= 0) {
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
          const addr = XLSX.utils.encode_cell({ c: produktyIndex, r: R });
          if (ws[addr]) {
            ws[addr].t = 's';
            ws[addr].v = String(ws[addr].v || '');
            // set cell style to wrap text (Excel will use this when opening)
            ws[addr].s = Object.assign({}, ws[addr].s, { alignment: { wrapText: true } });
          }
        }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Fişler');

      const fileName = `fisler_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(`${selectedFis.length} fiş Excel'e aktarıldı`);

      // reset selection/export state
      setSelectedFisIds(new Set());
      setSelectionMode(false);
      setExportMode(false);
    } catch (err) {
      console.error('Excel export hatası', err);
      toast.error('Excel oluşturulurken hata oluştu');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleFisSelection = (fisId: string) => {
    const newSelected = new Set(selectedFisIds);
    if (newSelected.has(fisId)) {
      newSelected.delete(fisId);
    } else {
      newSelected.add(fisId);
    }
    setSelectedFisIds(newSelected);
  };

  const selectAllFis = () => {
    if (!data?.data) return;
    const allIds = new Set(data.data.map(fis => fis.id));
    setSelectedFisIds(allIds);
  };

  const clearSelection = () => {
    setSelectedFisIds(new Set());
  };

  // Direkt silme
  const handleBulkDelete = async () => {
    if (selectedFisIds.size === 0) return;
    
    setDeleting(true);
    try {
      const fisIdsArray = Array.from(selectedFisIds);
      
      console.log('Silme işlemi başlatılıyor:', fisIdsArray);
      
      const response = await fetch('/api/fisler', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: fisIdsArray }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Silme işlemi başarısız');
      }

      console.log('Silme işlemi başarılı:', result);

      toast.success(`${selectedFisIds.size} fiş başarıyla silindi!`);
      
      // Cache'i yenile - tüm ilgili endpoint'leri güncelle
      await mutate(buildApiUrl());
      await mutate('/api/stats');
      
      // Seçimi temizle
      setSelectedFisIds(new Set());
      setSelectionMode(false);
      
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error(`Fişler silinirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Hata durumu
  if (error) {
    return (
      <div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
        </div>
      </div>
    );
  }

  // Yükleme durumu
  if (isLoading) {
    return (
      <div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-4 bg-white">
              <div className="animate-pulse flex justify-between">
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="animate-pulse flex justify-between mt-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Boş durum
  if (data && data.data.length === 0) {
    return (
      <div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="flex justify-center mb-4">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Henüz kayıt yok</h3>
          <p className="text-gray-500">İlk fişini yükle veya filtreleri değiştir.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Seçim Modu Aktifken Ek Kontroller */}
      {selectionMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {exportMode ? "Excel'e aktarmak için fişleri seçin" : 'Silmek istediğiniz fişleri seçin'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAllFis}
                className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-100"
              >
                Tümünü Seç
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fiş Listesi Header ve Silme Butonu */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Fiş Listesi</h2>
        
        {/* Kompakt Seçim ve Silme Kontrolü */}
        <div className="flex items-center gap-2">
          {selectionMode && selectedFisIds.size > 0 && (
            <span className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
              {selectedFisIds.size} seçili
            </span>
          )}

          <button
            onClick={toggleSelectionMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              selectionMode 
                ? 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200' 
                : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
            }`}
          >
            {!selectionMode && <Trash2 className="h-4 w-4" />}
            {selectionMode ? 'İptal' : 'Silmek için Seç'}
          </button>

          {/* Excel export button - styled same as selection but green when inactive */}
          <button
            onClick={handleExportButton}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              exportMode ? 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            disabled={isExporting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l3-3m-3 3-3-3M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7" />
            </svg>
            {isExporting ? 'Aktarılıyor...' : "Excel'e Aktar"}
          </button>

          {selectionMode && selectedFisIds.size > 0 && !exportMode && (
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Sil ({selectedFisIds.size})
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {data?.data.map((fis) => (
          <div key={fis.id} className={`rounded-xl border p-4 bg-white hover:shadow-md transition-all ${
            selectedFisIds.has(fis.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                {selectionMode && (
                  <button
                    onClick={() => toggleFisSelection(fis.id)}
                    className="p-1"
                  >
                    {selectedFisIds.has(fis.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                )}
                <h3 title={`Fiş #${fis.fis_no}`} className="font-medium text-gray-900 truncate max-w-[10rem] md:max-w-none">Fiş #{fis.fis_no}</h3>
              </div>
              <span className="font-semibold text-lg text-green-600">{formatCurrency(fis.total)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(fis.created_at), 'd MMMM yyyy HH:mm', { locale: tr })}
                <span className="mx-2">•</span>
                <span>{Array.isArray(fis.items) ? fis.items.length : 0} ürün</span>
              </div>
              <Link
                href={`/detay/${fis.id}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                Detay Gör
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Sayfalama */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-500">
            Toplam {data.pagination.total} kayıt • Sayfa {data.pagination.page}/{data.pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={!data.pagination.hasPrev}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Önceki sayfa"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Sayfa numaraları */}
            <div className="flex items-center space-x-1">
              {/* İlk sayfa */}
              {data.pagination.page > 3 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    1
                  </button>
                  {data.pagination.page > 4 && <span className="text-gray-400">...</span>}
                </>
              )}
              
              {/* Önceki sayfa */}
              {data.pagination.page > 1 && (
                <button
                  onClick={() => handlePageChange(data.pagination.page - 1)}
                  className="px-3 py-1 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  {data.pagination.page - 1}
                </button>
              )}
              
              {/* Mevcut sayfa */}
              <button
                className="px-3 py-1 rounded-lg text-sm border border-blue-500 bg-blue-500 text-white font-medium"
                disabled
              >
                {data.pagination.page}
              </button>
              
              {/* Sonraki sayfa */}
              {data.pagination.page < data.pagination.totalPages && (
                <button
                  onClick={() => handlePageChange(data.pagination.page + 1)}
                  className="px-3 py-1 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  {data.pagination.page + 1}
                </button>
              )}
              
              {/* Son sayfa */}
              {data.pagination.page < data.pagination.totalPages - 2 && (
                <>
                  {data.pagination.page < data.pagination.totalPages - 3 && <span className="text-gray-400">...</span>}
                  <button
                    onClick={() => handlePageChange(data.pagination.totalPages)}
                    className="px-3 py-1 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {data.pagination.totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={handleNextPage}
              disabled={!data.pagination.hasNext}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Sonraki sayfa"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {showDeleteModal && selectedFisIds.size > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full p-2 bg-red-100 w-10 h-10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fişleri Sil</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              <strong>{selectedFisIds.size} fiş</strong> kalıcı olarak silinecek. 
              Bu işlem geri alınamaz. Emin misiniz?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Sil ({selectedFisIds.size})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}