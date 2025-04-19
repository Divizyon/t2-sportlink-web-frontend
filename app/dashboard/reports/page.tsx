"use client";

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
import { Calendar, Download, BarChart2 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Raporlar</h2>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Tarih Seç
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Etkinlik
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12% geçen aya göre
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Katılımcı
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-muted-foreground">
              +8% geçen aya göre
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ortalama Katılım
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              +2% geçen aya göre
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popüler Spor Dalları</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Spor Dalı</TableHead>
                <TableHead>Etkinlik Sayısı</TableHead>
                <TableHead>Toplam Katılım</TableHead>
                <TableHead>Ortalama Katılım</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Futbol</TableCell>
                <TableCell>45</TableCell>
                <TableCell>1,234</TableCell>
                <TableCell>27</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Basketbol</TableCell>
                <TableCell>32</TableCell>
                <TableCell>856</TableCell>
                <TableCell>26</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Voleybol</TableCell>
                <TableCell>28</TableCell>
                <TableCell>672</TableCell>
                <TableCell>24</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etkinlik Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etkinlik</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Katılımcı</TableHead>
                <TableHead>Memnuniyet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Futbol Turnuvası</TableCell>
                <TableCell>15 Nisan 2024</TableCell>
                <TableCell>32/32</TableCell>
                <TableCell>%92</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Basketbol Maçı</TableCell>
                <TableCell>12 Nisan 2024</TableCell>
                <TableCell>20/20</TableCell>
                <TableCell>%88</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 