"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Spor Haberleri Yönetimi</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Haber ara..."
              className="pl-8 w-[300px]"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Haber Ekle
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Haber Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Yayın Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Görüntülenme</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Konyaspor'un Yeni Transferi
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Futbol</Badge>
                </TableCell>
                <TableCell>10 Nisan 2024</TableCell>
                <TableCell>
                  <Badge variant="default">Yayında</Badge>
                </TableCell>
                <TableCell>1,234</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Basketbol Şampiyonası Başlıyor
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Basketbol</Badge>
                </TableCell>
                <TableCell>8 Nisan 2024</TableCell>
                <TableCell>
                  <Badge variant="secondary">Taslak</Badge>
                </TableCell>
                <TableCell>0</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 