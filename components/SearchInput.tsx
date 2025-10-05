'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './Button';
import { useDebounce } from '@/lib/hooks';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ 
  placeholder = "Fiş/fatura ara...", 
  className = "" 
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  // Debounce search term to avoid too many URL updates
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update URL when debounced search term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }
    
    // Reset to first page when searching
    params.delete('page');
    
    router.push(`?${params.toString()}`, { scroll: false });
  }, [debouncedSearchTerm, router, searchParams]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
          aria-label="Arama"
        />
        {searchTerm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            aria-label="Aramayı temizle"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Search status indicator */}
      {debouncedSearchTerm && (
        <div className="ml-2 text-sm text-muted-foreground">
          "{debouncedSearchTerm}" için aranıyor...
        </div>
      )}
    </div>
  );
}