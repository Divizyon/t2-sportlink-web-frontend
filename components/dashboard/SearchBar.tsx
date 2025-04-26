'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';

type SearchBarProps = {
  searchQuery: string;
  onSearch: (query: string) => void;
};

export function SearchBar({
  searchQuery,
  onSearch,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Duyuru Ara..."
        className="max-w-sm"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button variant="outline" size="icon">
        <SearchIcon className="h-4 w-4" />
      </Button>
    </div>
  );
} 