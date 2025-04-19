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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, UserX, MessageSquare } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Güvenlik Olayları</CardTitle>
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
              <TableRow>
                <TableCell className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                  Şüpheli Giriş Denemesi
                </TableCell>
                <TableCell>15 Nisan 2024</TableCell>
                <TableCell>
                  <Badge variant="destructive">Kritik</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                  Güvenlik Güncellemesi
                </TableCell>
                <TableCell>14 Nisan 2024</TableCell>
                <TableCell>
                  <Badge variant="secondary">Bilgi</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Engellenen Kullanıcılar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Sebep</TableHead>
                <TableHead>Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="flex items-center">
                  <UserX className="mr-2 h-4 w-4 text-destructive" />
                  user123
                </TableCell>
                <TableCell>Spam</TableCell>
                <TableCell>15 Nisan 2024</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4 text-destructive" />
                  user456
                </TableCell>
                <TableCell>Kötüye Kullanım</TableCell>
                <TableCell>14 Nisan 2024</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 