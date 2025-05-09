"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ListFilter, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

interface ReportFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: "all" | "active" | "blocked";
  setStatusFilter: (status: "all" | "active" | "blocked") => void;
  clearFilters: () => void;
  onSearch?: () => void;
}

export function ReportFilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  clearFilters,
  onSearch,
}: ReportFilterBarProps) {
  
  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 mt-2">
      <div className="flex items-center gap-4">
        <div className="relative flex w-[300px] overflow-hidden rounded-md ring-1 ring-input">
          <Input
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button 
            variant="outline" 
            className="rounded-none h-9 px-3 border-0 bg-background hover:bg-muted"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Select>
          <SelectTrigger className="w-10 h-10 p-0 [&>svg]:hidden">
            <div className="flex items-center justify-center w-full h-full relative">
              <Filter className="h-5 w-5" />
              {statusFilter !== "all" && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary"></span>
              )}
            </div>
          </SelectTrigger>
          <SelectContent>
            <div className="mb-2 px-2 font-semibold text-sm">Duruma Göre Filtrele</div>
            <div className="flex flex-col gap-2 p-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="filter-all" 
                  checked={statusFilter === "all"}
                  onCheckedChange={() => setStatusFilter("all")}
                />
                <div className="flex items-center text-sm cursor-pointer">
                  <ListFilter className="mr-2 h-4 w-4" />
                  <label htmlFor="filter-all">Tümü</label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="filter-active" 
                  checked={statusFilter === "active"}
                  onCheckedChange={() => setStatusFilter("active")}
                />
                <div className="flex items-center text-sm cursor-pointer">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  <label htmlFor="filter-active">Aktif</label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="filter-blocked" 
                  checked={statusFilter === "blocked"}
                  onCheckedChange={() => setStatusFilter("blocked")}
                />
                <div className="flex items-center text-sm cursor-pointer">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-red-600" />
                  <label htmlFor="filter-blocked">Engellendi</label>
                </div>
              </div>
            </div>
            
            {statusFilter !== "all" && (
              <div className="flex justify-center p-2 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Filtreleri Temizle
                </Button>
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 