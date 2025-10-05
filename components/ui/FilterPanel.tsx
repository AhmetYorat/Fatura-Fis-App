'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components';

export interface FilterValues {
  startDate: string;
  endDate: string;
  fisNo: string;
  minAmount: string;
  maxAmount: string;
}

interface FilterPanelProps {
  onFilterChange?: (filters: FilterValues) => void;
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [fisNo, setFisNo] = useState(searchParams.get('fisNo') || '');
  const [minAmount, setMinAmount] = useState(searchParams.get('minAmount') || '');
  const [maxAmount, setMaxAmount] = useState(searchParams.get('maxAmount') || '');

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();

    const filters: FilterValues = {
      startDate,
      endDate,
      fisNo,
      minAmount,
      maxAmount
    };

    // URL parametrelerini güncelle
    const params = new URLSearchParams(searchParams.toString());
    
    if (startDate) params.set('startDate', startDate);
    else params.delete('startDate');
    
    if (endDate) params.set('endDate', endDate);
    else params.delete('endDate');
    
    if (fisNo) params.set('fisNo', fisNo);
    else params.delete('fisNo');
    
    if (minAmount) params.set('minAmount', minAmount);
    else params.delete('minAmount');
    
    if (maxAmount) params.set('maxAmount', maxAmount);
    else params.delete('maxAmount');

    router.push(`/?${params.toString()}`);
    
    // Callback çağır
    onFilterChange?.(filters);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setFisNo('');
    setMinAmount('');
    setMaxAmount('');
    router.push('/');
    
    // Callback çağır
    onFilterChange?.({
      startDate: '',
      endDate: '',
      fisNo: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const isDateRangeValid = !startDate || !endDate || new Date(startDate) <= new Date(endDate);
  const hasActiveFilters = startDate || endDate || fisNo || minAmount || maxAmount;

  return (
    <div>
      {/* Mobile toggle button - visible only on small screens */}
      <div className="md:hidden mb-2">
        <button
          type="button"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
          className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900"
        >
          <span>Filtreler</span>
          <svg className={`h-4 w-4 transform transition-transform ${mobileOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Desktop: always visible. Mobile: collapsible */}
      <div className={`${mobileOpen ? 'block' : 'hidden'} md:block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm`}>
        <h2 className="font-medium text-gray-900 mb-4">Filtreler</h2>

        <form onSubmit={handleFilter} className="space-y-4">
        {/* Tarih Aralığı */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Başlangıç Tarihi
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Bitiş Tarihi
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
              !isDateRangeValid 
                ? 'border-red-300 focus:ring-red-300' 
                : 'border-gray-300 focus:ring-blue-300'
            }`}
            aria-invalid={!isDateRangeValid}
            aria-describedby={!isDateRangeValid ? 'dateError' : undefined}
          />
          {!isDateRangeValid && (
            <p id="dateError" className="text-xs text-red-500 mt-1">
              Bitiş tarihi başlangıç tarihinden önce olamaz
            </p>
          )}
        </div>

        {/* Fiş No */}
        <div>
          <label htmlFor="fisNo" className="block text-sm font-medium text-gray-700 mb-1">
            Fiş Numarası
          </label>
          <input
            id="fisNo"
            type="text"
            value={fisNo}
            onChange={(e) => setFisNo(e.target.value)}
            placeholder="Örn: FSH001"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        {/* Tutar Aralığı */}
        <div>
          <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Min. Tutar (₺)
          </label>
          <input
            id="minAmount"
            type="number"
            min="0"
            step="0.01"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Maks. Tutar (₺)
          </label>
          <input
            id="maxAmount"
            type="number"
            min="0"
            step="0.01"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            placeholder="1000.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        {/* Butonlar */}
        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={!isDateRangeValid}
            className="flex-1"
          >
            Filtrele
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
            disabled={!hasActiveFilters}
          >
            Sıfırla
          </Button>
        </div>
        </form>

        {/* Aktif Filtre Göstergesi */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Aktif Filtreler:</p>
            <div className="space-y-1">
              {startDate && <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Başlangıç: {startDate}</span>}
              {endDate && <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-1">Bitiş: {endDate}</span>}
              {fisNo && <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-1">Fiş: {fisNo}</span>}
              {minAmount && <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-1">Min: ₺{minAmount}</span>}
              {maxAmount && <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-1">Maks: ₺{maxAmount}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}