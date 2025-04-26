'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SearchIcon } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: {
    category: string[];
    status: string[];
  };
  onFilterChange: (type: 'category' | 'status', value: string) => void;
}

export function FilterBar({ 
  searchQuery, 
  onSearch, 
  selectedFilters, 
  onFilterChange 
}: FilterBarProps) {
  const getTotalSelectedFilters = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Duyuru ara..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
        <Button variant="outline" size="icon">
          <SearchIcon className="h-4 w-4" />
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              Filtrele {getTotalSelectedFilters() > 0 ? `(${getTotalSelectedFilters()})` : ''}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filtreleme Seçenekleri</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <h4 className="font-medium">Kategori</h4>
                <div className="space-y-2">
                  {['Etkinlik', 'Bilgilendirme'].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedFilters.category.includes(category)}
                        onChange={() => onFilterChange('category', category)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`category-${category}`}>{category}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Durum</h4>
                <div className="space-y-2">
                  {['Aktif', 'Pasif', 'Taslak'].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`status-${status}`}
                        checked={selectedFilters.status.includes(status)}
                        onChange={() => onFilterChange('status', status)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`status-${status}`}>{status}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 