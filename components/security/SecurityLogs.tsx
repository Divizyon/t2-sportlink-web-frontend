import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, Filter, Search, ListFilter, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

interface SecurityLogsProps {
  initialSearchQuery?: string;
}

export function SecurityLogs({ initialSearchQuery = "" }: SecurityLogsProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedLogTypes, setSelectedLogTypes] = useState<string[]>([]);

  const clearFilter = () => {
    setSelectedLogTypes([]);
    toast({
      title: "Filtreler Temizlendi",
      description: "Tüm filtreler temizlendi."
    });
  };

  const handleLogTypeChange = (value: string) => {
    setSelectedLogTypes(prev => {
      // Eğer zaten seçiliyse, kaldır
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } 
      // Değilse ekle
      else {
        return [...prev, value];
      }
    });
  };

  const filteredLogs = [
    { event: "Şüpheli Giriş Denemesi", date: "15 Nisan 2024", status: "Kritik", type: "critical" },
    { event: "Güvenlik Güncellemesi", date: "14 Nisan 2024", status: "Bilgi", type: "info" },
    { event: "Başarısız Giriş", date: "13 Nisan 2024", status: "Uyarı", type: "warning" },
    { event: "Yeni Admin Eklendi", date: "12 Nisan 2024", status: "Bilgi", type: "info" },
  ].filter(log => {
    if (selectedLogTypes.length === 0) {
      return true;
    }
    return selectedLogTypes.includes(log.type);
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Loglar</CardTitle>
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-4">
            <div className="relative flex w-[300px] overflow-hidden rounded-md ring-1 ring-input">
              <Input
                placeholder="Log ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button 
                variant="outline" 
                className="rounded-none h-9 px-3 border-0 bg-background hover:bg-muted"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <Select>
              <SelectTrigger className="w-10 h-10 p-0 [&>svg]:hidden">
                <div className="flex items-center justify-center w-full h-full relative">
                  <Filter className="h-5 w-5" />
                  {selectedLogTypes.length > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary"></span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                <div className="mb-2 px-2 font-semibold text-sm">Olay Türüne Göre Filtrele</div>
                <div className="flex flex-col gap-2 p-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-all" 
                      checked={selectedLogTypes.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLogTypes([]);
                        }
                      }}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <ListFilter className="mr-2 h-4 w-4" />
                      <label htmlFor="filter-all">Tümü</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-critical" 
                      checked={selectedLogTypes.includes("critical")}
                      onCheckedChange={() => handleLogTypeChange("critical")}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-red-600" />
                      <label htmlFor="filter-critical">Kritik</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-warning" 
                      checked={selectedLogTypes.includes("warning")}
                      onCheckedChange={() => handleLogTypeChange("warning")}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-yellow-600" />
                      <label htmlFor="filter-warning">Uyarı</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-info" 
                      checked={selectedLogTypes.includes("info")}
                      onCheckedChange={() => handleLogTypeChange("info")}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                      <label htmlFor="filter-info">Bilgi</label>
                    </div>
                  </div>
                </div>
                
                {selectedLogTypes.length > 0 && (
                  <div className="flex justify-center p-2 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={clearFilter}>
                      Filtreleri Temizle
                    </Button>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Olay</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell className="flex items-center">
                  {log.status === "Kritik" ? (
                    <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  {log.event}
                </TableCell>
                <TableCell>{log.date}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      log.status === "Kritik" ? "destructive" : 
                      log.status === "Uyarı" ? "outline" : "secondary"
                    }
                  >
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Kriterlere uygun log bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 