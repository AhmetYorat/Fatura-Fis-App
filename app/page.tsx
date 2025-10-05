'use client';

import { 
  Home as HomeIcon, 
  Database,
  Upload,
  CircleCheckBig,
  CircleX,
  LoaderCircle,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  Plus,
  FolderOpen,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';

// Import new UI components
import { 
  Button,
  Input,
  Badge,
  Card,
  Alert,
  Skeleton,
  SkeletonCard,
  StatCard,
  DataTable,
  Progress
} from '@/components';
import { StatsGrid, StatsData } from '../components/ui/StatsGrid';
import { FilterPanel } from '../components/ui/FilterPanel';
import { FilterBadges } from '../components/ui/FilterBadges';
import { FisList } from '../components/FisList';
import SearchInput from '../components/SearchInput';

import { formatCurrency, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function Home() {
  // SWR fetcher function
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  
  const router = useRouter();
  
  // State için refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // SWR için istatistik verilerini çek
  const { data: statsResponse, error: statsError, isLoading: statsLoading, mutate: refreshStats } = useSWR('/api/stats', fetcher);
  
  // SWR için fiş listesini çek
  const { data: fislerResponse, error: fislerError, isLoading: fislerLoading, mutate: refreshFisler } = useSWR(
    `/api/fisler?refresh=${refreshTrigger}`, 
    fetcher
  );
  
  // Debug için data değişimini logla
  useEffect(() => {
    console.log('📊 Fisler data updated:', fislerResponse?.data?.length || 0, 'items');
    console.log('🔍 Latest fisler data:', fislerResponse?.data?.slice(0, 3));
  }, [fislerResponse]);
  
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [inputValue, setInputValue] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showProcessingNotification, setShowProcessingNotification] = useState(false);
  const [processingTimeLeft, setProcessingTimeLeft] = useState(25);
  const [initialFisCount, setInitialFisCount] = useState<number | null>(null);
  
  // Yeni fiş geldiğinde notification'ı kapat
  useEffect(() => {
    if (fislerResponse?.data && showProcessingNotification) {
      const currentCount = fislerResponse.data.length;
      
      // İlk yükleme ise sayıyı kaydet
      if (initialFisCount === null) {
        setInitialFisCount(currentCount);
        return;
      }
      
      // Yeni fiş geldiyse notification'ı kapat
      if (currentCount > initialFisCount) {
        console.log('🎉 Yeni fiş geldi! Notification kapatılıyor...');
        setShowProcessingNotification(false);
        setInitialFisCount(currentCount); // Güncel sayıyı kaydet
      }
    }
  }, [fislerResponse?.data, showProcessingNotification, initialFisCount]);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
  };

  const handleMultipleFileSelect = (files: File[]) => {
    // Maksimum 20 dosya kontrolü
    if (files.length > 20) {
      toast.error('En fazla 20 dosya seçebilirsiniz');
      return;
    }
    
    // Toplam dosya sayısı kontrolü (mevcut + yeni)
    if (uploadedFiles.length + files.length > 20) {
      toast.error(`En fazla 20 dosya seçebilirsiniz. Şu anda ${uploadedFiles.length} dosya seçili.`);
      return;
    }
    
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
  };

  const handleRemoveFileFromList = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllFiles = () => {
    setUploadedFiles([]);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Drag & Drop fonksiyonları
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleMultipleFileSelect(files);
    }
  };

  const handleTestToast = () => {
    toast.success('Toaster başarıyla çalışıyor! 🎉');
  };

  const testSupabaseConnection = async () => {
    setConnectionStatus('testing');
    
    try {
      const response = await fetch('/api/test-db');
      const result = await response.json();

      if (result.success) {
        setConnectionStatus('success');
        toast.success(`Veritabanı başarılı! 📊 ${result.stats.total_records} kayıt bulundu`);
        console.log('Database test result:', result);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Supabase error:', error);
      toast.error('Supabase bağlantı hatası');
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      toast.error('Lütfen bir dosya seçin');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Progress simülasyonu
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        toast.success('Dosya başarıyla yüklendi! 🎉');
        
        // İşleniyor bildirimi göster
        console.log('🔔 Processing notification gösteriliyor...');
        setShowProcessingNotification(true);
        setProcessingTimeLeft(25);
        
        // Mevcut fiş sayısını kaydet
        if (fislerResponse?.data) {
          setInitialFisCount(fislerResponse.data.length);
        }
        
        // 25 saniye geri sayım
        const countdownInterval = setInterval(() => {
          setProcessingTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setShowProcessingNotification(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // SWR cache'ini zorla temizle ve refresh yap
        setTimeout(() => {
          // FisList'teki SWR'ı refresh et
          mutate(key => typeof key === 'string' && key.includes('/api/fisler'));
        }, 2000);
        
        // 7 saniye sonra tekrar refresh
        setTimeout(() => {
          mutate(key => typeof key === 'string' && key.includes('/api/fisler'));
        }, 7000);
        
        // 12 saniye sonra tekrar refresh
        setTimeout(() => {
          mutate(key => typeof key === 'string' && key.includes('/api/fisler'));
        }, 12000);
        
        setTimeout(() => {
          setUploadedFile(null);
          setUploadProgress(0);
        }, 1000);
      } else {
        // AI tarafından reddedilen görsel kontrolü
        if (result.error && (
            result.error.includes('fiş olarak tanımlanamadı') || 
            result.error.includes('confidence') ||
            result.error.includes('görsel dosya çok küçük') ||
            result.error.includes('daha net bir fiş')
        )) {
          toast.error(result.error, {
            duration: 6000,
            style: {
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #F59E0B'
            }
          });
        } else {
          toast.error(result.error || 'Yükleme hatası');
        }
        
        // n8n'den gelen AI hataları da kontrol et
        if (result.n8nResponse?.error) {
          if (result.n8nResponse.error.includes('fiş') || 
              result.n8nResponse.error.includes('confidence') ||
              result.n8nResponse.error.includes('tanımlanamadı')) {
            toast.error(result.n8nResponse.error, {
              duration: 6000,
              style: {
                background: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #F59E0B'
              }
            });
          }
        }
        
        // Hata durumunda dosya seçimini iptal et
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Dosya yükleme hatası');
      // Hata durumunda dosya seçimini iptal et
      setUploadedFile(null);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleMultipleFileUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setTotalFiles(uploadedFiles.length);
    setCurrentFileIndex(0);

    try {
      let uploadedCount = 0;
      const totalFiles = uploadedFiles.length;

      // Her dosyayı sırayla yükle
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        // Mevcut dosya bilgilerini güncelle
        setCurrentFileIndex(i + 1);
        setCurrentFileName(file.name);
        
        // Dosya başlangıcı için progress
        const baseProgress = (i / totalFiles) * 100;
        setUploadProgress(baseProgress);

        const formData = new FormData();
        formData.append('file', file);

        // Upload progress simülasyonu
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const targetProgress = baseProgress + (100 / totalFiles) * 0.9;
            if (prev < targetProgress) {
              return Math.min(prev + Math.random() * 3 + 1, targetProgress);
            }
            return prev;
          });
        }, 150);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        // Progress interval'ı temizle
        clearInterval(progressInterval);

        const result = await response.json();

        if (response.ok) {
          uploadedCount++;
          console.log(`✅ ${file.name} başarıyla yüklendi`);
          
          // Dosya tamamlandığında progress güncelle
          const completedProgress = ((i + 1) / totalFiles) * 100;
          setUploadProgress(completedProgress);
          
          // Kısa bir bekleme ekle
          await new Promise(resolve => setTimeout(resolve, 200));
        } else {
          console.error(`❌ ${file.name} yükleme hatası:`, result.error);
          toast.error(`${file.name}: ${result.error || 'Yükleme hatası'}`);
        }
      }

      setUploadProgress(100);

      if (uploadedCount > 0) {
        toast.success(`${uploadedCount} dosya başarıyla yüklendi! 🎉`);
        
        // İşleniyor bildirimi göster
        console.log('🔔 Multiple file processing notification gösteriliyor...');
        setShowProcessingNotification(true);
        setProcessingTimeLeft(25);
        
        // Mevcut fiş sayısını kaydet
        if (fislerResponse?.data) {
          setInitialFisCount(fislerResponse.data.length);
        }
        
        // 25 saniye geri sayım
        const countdownInterval = setInterval(() => {
          setProcessingTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setShowProcessingNotification(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // SWR cache'ini zorla temizle ve refresh yap
        setTimeout(() => {
          mutate(key => typeof key === 'string' && key.includes('/api/fisler'));
        }, 2000);
        
        setTimeout(() => {
          mutate(key => typeof key === 'string' && key.includes('/api/fisler'));
        }, 7000);
        
        setTimeout(() => {
          mutate(key => typeof key === 'string' && key.includes('/api/fisler'));
        }, 12000);
        
        setTimeout(() => {
          setUploadedFiles([]);
          setUploadProgress(0);
          setCurrentFileIndex(0);
          setTotalFiles(0);
          setCurrentFileName('');
          // File input'u temizle
          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        }, 1000);
      } else {
        toast.error('Hiçbir dosya yüklenemedi');
        // Hata durumunda dosya listesini temizle
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('Multiple upload error:', error);
      toast.error('Dosya yükleme hatası');
      // Hata durumunda dosya listesini temizle
      setUploadedFiles([]);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setCurrentFileIndex(0);
        setTotalFiles(0);
        setCurrentFileName('');
      }, 1000);
    }
  };

  // Real data from API
  const fislerData = fislerResponse?.data || [];
  
  const tableColumns = [
    { key: 'fis_no' as const, title: 'Fiş No' },
    { 
      key: 'created_at' as const, 
      title: 'Tarih',
      render: (value: any) => new Date(value).toLocaleDateString('tr-TR')
    },
    { 
      key: 'total' as const, 
      title: 'Toplam', 
      align: 'right' as const,
      render: (value: any) => formatCurrency(value)
    }
  ];

  return (
    <div className="space-y-8">
      {/* İstatistik Kartları */}
      <StatsGrid 
        stats={statsResponse?.stats || null}
        isLoading={statsLoading}
        error={statsError?.message || null}
      />

      {/* Dosya Yükleme Bölümü */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="w-full text-center">
          <div 
            className={`border-2 border-dashed rounded-lg p-16 transition-colors w-full cursor-pointer ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => document.getElementById('file-upload')?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleMultipleFileSelect(files);
                }
              }}
              className="hidden"
            />
            
            <div className="text-center">
              {/* Folder Icon */}
              <div className="mb-4">
                <FolderOpen size={48} className="text-yellow-500 mx-auto" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Fiş/Fatura Yükle
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 mb-2">
                Dosyayı sürükleyip bırakın veya tıklayarak seçin
              </p>
              
              {/* Fiş Uyarısı */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 inline-block max-w-xs mx-auto">
                <p className="text-amber-800 text-sm font-medium">
                  ⚠️ Sadece fiş, fatura veya makbuz yükleyin
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  Diğer görseller otomatik olarak reddedilecektir
                </p>
              </div>
              
              {/* File Info */}
              <div className="space-y-1 text-sm text-gray-500">
                <p>Desteklenen formatlar: .pdf, .jpg, .jpeg, .png</p>
                <p>Maksimum dosya boyutu: 10MB | En fazla 20 dosya</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-4 space-y-3">
              {/* Dosya Sayacı - Ortalanmış */}
              <div className="text-center">
                <span className="text-sm font-medium text-gray-700">
                  {currentFileIndex} / {totalFiles} dosya yükleniyor
                </span>
              </div>
              
              {/* Mevcut Dosya Adı - Ortalanmış ve Kompakt */}
              {currentFileName && (
                <div className="flex justify-center">
                  <div className="text-xs text-gray-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-200 max-w-xs truncate">
                    📄 {currentFileName}
                  </div>
                </div>
              )}
              
              {/* Progress Bar ile Yüzde */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600 min-w-[2.5rem] text-right">
                  %{Math.round(uploadProgress)}
                </span>
              </div>
            </div>
          )}
          
          {/* Multiple Files Display */}
          {uploadedFiles.length > 0 && !isUploading && (
            <div className="mt-6 flex flex-col items-center">
              <div className="mb-4 w-full max-w-2xl">
                <div className="flex items-center justify-center mb-3 relative">
                  <p className="text-sm font-medium text-gray-700">
                    Seçilen dosyalar ({uploadedFiles.length}/20)
                  </p>
                  <button
                    onClick={handleClearAllFiles}
                    className="absolute right-0 text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Tümünü temizle
                  </button>
                </div>
                
                {/* Dosyalar - Yan Yana Grid - Ortalanmış */}
                <div className="flex justify-center mb-4">
                  <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                    {uploadedFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="w-full sm:w-auto sm:min-w-[200px] sm:max-w-[250px] p-2 bg-green-50 border border-green-200 rounded-lg relative group hover:bg-green-100 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-green-700 flex items-center gap-1 truncate flex-1">
                            <span className="text-green-600">✓</span>
                            <span className="truncate" title={file.name}>{file.name}</span>
                          </p>
                          {/* Silme butonu - hover'da görünür */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFileFromList(index);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-0.5 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700 flex-shrink-0"
                            title="Dosyayı kaldır"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button 
                variant="primary" 
                onClick={handleMultipleFileUpload}
                isLoading={isUploading}
                disabled={uploadedFiles.length === 0}
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                {uploadedFiles.length === 1 ? 'Faturayı Yükle' : `${uploadedFiles.length} Faturayı Yükle`}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filtre ve Arama Bölümü + Fiş Listesi */}
      <div className="space-y-6">
        {/* Üst kısım: Arama kutusu */}
        <SearchInput 
          placeholder="Fiş no, ürün adı veya açıklama ara..."
          className="w-full"
        />

        {/* Aktif Filtreler */}
        <FilterBadges />

        {/* Alt kısım: Filtre Paneli (sol) + Fiş Listesi (sağ) */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Filtre Paneli - Sol taraf (1/3 alan) */}
          <div className="self-start">
            <FilterPanel />
          </div>

          {/* Fiş Listesi - Sağ taraf (2/3 alan) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                {/* İşleniyor bildirimi */}
                {showProcessingNotification && (
                  <div className="bg-blue-500 p-4 rounded-lg mb-4 text-white border-2 border-blue-600">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white font-medium text-lg">
                        🔄 Fatura işleniyor, yakında listede görünecek...
                      </span>
                    </div>
                  </div>
                )}
                
                <FisList />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="mt-16 border-t border-gray-200/60 bg-gradient-to-r from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">{/* alert: removed test data list */}
            
            {/* Logo/Branding */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📋 Fatura Yönetim Sistemi
              </h3>
              <p className="text-sm text-gray-600">
                Modern ve güvenli fatura takip çözümü
              </p>
            </div>

            {/* Links */}
            <div className="text-center">
              <div className="flex justify-center space-x-6">
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                  Gizlilik
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                  Kullanım Şartları
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                  Destek
                </a>
              </div>
            </div>

            {/* Social Icons & Copyright */}
            <div className="text-center md:text-right">
              <div className="flex justify-center md:justify-end space-x-4 mb-3">
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}