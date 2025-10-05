'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, Receipt, Calendar, Clock, CreditCard, Percent, Package, Calculator, TrendingUp, Target, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Fis } from '@/types/database';

async function getFisDetail(id: string): Promise<Fis | null> {
  const { data, error } = await supabase
    .from('fisler')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fiş detayı alınırken hata:', error);
    return null;
  }

  return data;
}

export default function DetayPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [fis, setFis] = useState<Fis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadFis() {
      const { id } = await params;
      const fisData = await getFisDetail(id);
      setFis(fisData);
      setLoading(false);
      
      if (!fisData) {
        notFound();
      }
    }
    
    loadFis();
  }, [params]);

  const handleDelete = async () => {
    if (!fis) return;
    
    setDeleting(true);
    try {
      console.log('Fiş silme işlemi başlatılıyor:', fis.id);
      
      const response = await fetch('/api/fisler', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [fis.id] }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Silme işlemi başarısız');
      }

      console.log('Fiş silme işlemi başarılı:', result);

      toast.success('Fiş başarıyla silindi!');
      
      // Ana sayfaya dönerken cache'i temizle
      if (typeof window !== 'undefined') {
        // SWR cache'ini temizle
        const { mutate } = await import('swr');
        await mutate('/api/fisler');
        await mutate('/api/stats');
      }
      
      router.push('/');
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error(`Fiş silinirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!fis) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Ana Sayfa
          </Link>
        </nav>

        {/* Başlık Kartı */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Fiş #{fis.fis_no}</h1>
              <p className="text-slate-600">
                {format(new Date(fis.tarih_saat || fis.created_at), 'd MMMM yyyy HH:mm', { locale: tr })}
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Sil</span>
            </button>
          </div>
        </div>

        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Fiş Bilgileri */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h2 className="text-sm font-medium text-slate-600 mb-3">Fiş Bilgileri</h2>
            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-slate-50 w-9 h-9 flex items-center justify-center text-blue-600">
                <Receipt size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-600">Fiş No</p>
                <p className="text-lg font-semibold">{fis.fis_no}</p>
              </div>
            </div>
          </div>

          {/* Tarih Bilgileri */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h2 className="text-sm font-medium text-slate-600 mb-3">Tarih Bilgileri</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full p-2 bg-slate-50 w-9 h-9 flex items-center justify-center text-blue-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Fiş Tarihi</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(fis.tarih_saat || fis.created_at), 'd MMMM yyyy', { locale: tr })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full p-2 bg-slate-50 w-9 h-9 flex items-center justify-center text-blue-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Oluşturulma</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(fis.created_at), 'd MMMM yyyy HH:mm', { locale: tr })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Toplam Bilgiler */}
          <div className="bg-green-500 text-white rounded-2xl p-4">
            <h2 className="text-sm font-medium text-green-100 mb-3">Toplam Bilgiler</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full p-2 bg-green-400 bg-opacity-20 w-9 h-9 flex items-center justify-center text-white">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-sm text-green-100">Toplam Tutar</p>
                  <p className="text-lg font-semibold">{formatCurrency(fis.total)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full p-2 bg-green-400 bg-opacity-20 w-9 h-9 flex items-center justify-center text-white">
                  <Percent size={20} />
                </div>
                <div>
                  <p className="text-sm text-green-100">KDV Toplamı</p>
                  <p className="text-lg font-semibold">{formatCurrency(fis.total_kdv || 0)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full p-2 bg-green-400 bg-opacity-20 w-9 h-9 flex items-center justify-center text-white">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-sm text-green-100">Ürün Sayısı</p>
                  <p className="text-lg font-semibold">{Array.isArray(fis.items) ? fis.items.length : 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ürün Tablosu */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 overflow-hidden">
          <h2 className="text-lg font-medium mb-4">Ürün Listesi</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="p-3 text-sm font-medium text-slate-600">Ürün Adı</th>
                  <th className="p-3 text-sm font-medium text-slate-600 text-right">Miktar</th>
                  <th className="p-3 text-sm font-medium text-slate-600 text-right">Birim Fiyat</th>
                  <th className="p-3 text-sm font-medium text-slate-600 text-right">KDV</th>
                  <th className="p-3 text-sm font-medium text-slate-600 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(fis.items) && fis.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3">{item.name || 'Ürün adı yok'}</td>
                    <td className="p-3 text-right tabular-nums">{item.quantity || 0}</td>
                    <td className="p-3 text-right tabular-nums">{formatCurrency(item.unit_price || 0)}</td>
                    <td className="p-3 text-right tabular-nums">{formatCurrency(item.kdv || 0)}</td>
                    <td className="p-3 text-right font-medium tabular-nums">{formatCurrency(item.total || 0)}</td>
                  </tr>
                ))}
                {(!Array.isArray(fis.items) || fis.items.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      Ürün bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KDV ve Toplam Özet Bölümü */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="rounded-full p-2 bg-blue-50 w-10 h-10 flex items-center justify-center">
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Fatura Özeti</h3>
          </div>
          
          <div className="space-y-4">
            {/* Ara Toplam */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-gray-100 w-9 h-9 flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">Ara Toplam (KDV Hariç)</span>
              </div>
              <span className="font-semibold text-lg text-gray-900">{formatCurrency((fis.total || 0) - (fis.total_kdv || 0))}</span>
            </div>
            
            {/* KDV Toplamı */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-blue-100 w-9 h-9 flex items-center justify-center">
                  <Percent className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-blue-700">KDV Toplamı</span>
              </div>
              <span className="font-semibold text-lg text-blue-600">{formatCurrency(fis.total_kdv || 0)}</span>
            </div>
            
            {/* Ayırıcı Çizgi */}
            <div className="flex items-center my-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <div className="px-4">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            
            {/* Genel Toplam */}
            <div className="mx-4">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-3 bg-white w-12 h-12 flex items-center justify-center shadow-md">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="font-semibold text-white text-lg">Genel Toplam (KDV Dahil)</span>
                </div>
                <span className="font-bold text-2xl text-white">{formatCurrency(fis.total || 0)}</span>
              </div>
            </div>
            
            {/* Ek Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex justify-center mb-2">
                  <div className="rounded-full p-2 bg-purple-100 w-10 h-10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-sm text-purple-600 font-medium">Toplam Ürün</div>
                <div className="text-xl font-bold text-purple-700">{Array.isArray(fis.items) ? fis.items.length : 0}</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex justify-center mb-2">
                  <div className="rounded-full p-2 bg-orange-100 w-10 h-10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-sm text-orange-600 font-medium">KDV Oranı</div>
                <div className="text-xl font-bold text-orange-700">
                  {fis.total && fis.total_kdv ? 
                    `%${(((fis.total_kdv) / (fis.total - fis.total_kdv)) * 100).toFixed(0)}` : 
                    'N/A'
                  }
                </div>
              </div>
              
              <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex justify-center mb-2">
                  <div className="rounded-full p-2 bg-indigo-100 w-10 h-10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div className="text-sm text-indigo-600 font-medium">Fiş Tarihi</div>
                <div className="text-xl font-bold text-indigo-700">
                  {format(new Date(fis.tarih_saat || fis.created_at), 'd MMM yyyy', { locale: tr })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="text-center text-sm text-slate-500">
          Son güncellenme: {format(new Date(fis.updated_at || fis.created_at), 'd MMMM yyyy HH:mm', { locale: tr })}
        </div>

        {/* Silme Onay Modalı */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full p-2 bg-red-100 w-10 h-10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Fişi Sil</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                <strong>Fiş #{fis.fis_no}</strong> kalıcı olarak silinecek. 
                Bu işlem geri alınamaz. Emin misiniz?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
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
                      Sil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}