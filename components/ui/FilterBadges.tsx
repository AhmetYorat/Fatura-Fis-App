'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { Badge } from '@/components';

interface FilterBadgesProps {
  className?: string;
}

export function FilterBadges({ className = "" }: FilterBadgesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Aktif filtreleri al
  const activeFilters = {
    search: searchParams.get('search'),
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    fisNo: searchParams.get('fisNo'),
    minAmount: searchParams.get('minAmount'),
    maxAmount: searchParams.get('maxAmount'),
  };

  // Herhangi bir aktif filtre var mı kontrol et
  const hasActiveFilters = Object.values(activeFilters).some(value => value);

  // Belirli bir filtreyi kaldır
  const removeFilter = (filterKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterKey);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Tüm filtreleri temizle
  const clearAllFilters = () => {
    router.push('/', { scroll: false });
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Miktar formatı
  const formatAmount = (amount: string) => {
    return `${amount} TL`;
  };

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 p-4 bg-slate-50 rounded-lg ${className}`}>
      <span className="text-sm font-medium text-slate-600">Aktif Filtreler:</span>
      
      {activeFilters.search && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <span>Arama: "{activeFilters.search}"</span>
          <button
            onClick={() => removeFilter('search')}
            className="ml-1 hover:bg-slate-300 rounded p-0.5"
            aria-label="Arama filtresini kaldır"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeFilters.startDate && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <span>Başlangıç: {formatDate(activeFilters.startDate)}</span>
          <button
            onClick={() => removeFilter('startDate')}
            className="ml-1 hover:bg-slate-300 rounded p-0.5"
            aria-label="Başlangıç tarihi filtresini kaldır"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeFilters.endDate && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <span>Bitiş: {formatDate(activeFilters.endDate)}</span>
          <button
            onClick={() => removeFilter('endDate')}
            className="ml-1 hover:bg-slate-300 rounded p-0.5"
            aria-label="Bitiş tarihi filtresini kaldır"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeFilters.fisNo && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <span>Fiş No: {activeFilters.fisNo}</span>
          <button
            onClick={() => removeFilter('fisNo')}
            className="ml-1 hover:bg-slate-300 rounded p-0.5"
            aria-label="Fiş no filtresini kaldır"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeFilters.minAmount && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <span>Min: {formatAmount(activeFilters.minAmount)}</span>
          <button
            onClick={() => removeFilter('minAmount')}
            className="ml-1 hover:bg-slate-300 rounded p-0.5"
            aria-label="Minimum tutar filtresini kaldır"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeFilters.maxAmount && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <span>Maks: {formatAmount(activeFilters.maxAmount)}</span>
          <button
            onClick={() => removeFilter('maxAmount')}
            className="ml-1 hover:bg-slate-300 rounded p-0.5"
            aria-label="Maksimum tutar filtresini kaldır"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Tümünü temizle butonu */}
      <button
        onClick={clearAllFilters}
        className="text-sm text-slate-500 hover:text-slate-700 underline ml-2"
      >
        Tümünü Temizle
      </button>
    </div>
  );
}