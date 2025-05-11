"use client";

import React, { useState } from 'react';
import type { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, MapPin, Pencil, Clock, Trophy, Tag, Eye, Mail, Phone, Shield, Award, ChevronRight, AlertCircle, Info, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import type { Event, Participant } from "@/interfaces/event";

interface EventPreviewProps {
  selectedEvent: Event | null;
  viewMode: "preview" | "edit";
  handleChange: (name: string, value: string | number | string[] | boolean) => void;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>, isNewEvent: boolean) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  formatDate: (dateString: string) => string;
  defaultImage: string;
  setViewMode: React.Dispatch<React.SetStateAction<"preview" | "edit">>;
  renderSelectWithFallback: (value: string | undefined, onChange: (value: string) => void, placeholder: string, options: { value: string, label: string }[]) => React.ReactNode;
  handleEditEvent: () => Promise<void>;
}

const EventPreview: React.FC<EventPreviewProps> = ({
  selectedEvent,
  viewMode,
  handleChange,
  handleImageUpload,
  getStatusBadge,
  formatDate,
  defaultImage,
  setViewMode,
  renderSelectWithFallback,
  handleEditEvent
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showAttendedEvents, setShowAttendedEvents] = useState(false);
  const [showSportsList, setShowSportsList] = useState(false);
  const [showReportsList, setShowReportsList] = useState(false);

  // Türkçe karakterleri İngilizce karakterlere çeviren yardımcı fonksiyon
  const toEnglish = (str: string) =>
    str
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'I')
      .replace(/ş/g, 's')
      .replace(/Ş/g, 'S')
      .replace(/ö/g, 'o')
      .replace(/Ö/g, 'O')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'U')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'C')
      .replace(/ğ/g, 'g')
      .replace(/Ğ/g, 'G');

  // Katılımcıları CSV formatına dönüştüren ve indiren fonksiyon
  const exportParticipantsToCSV = () => {
    if (!selectedEvent || !selectedEvent.participants || selectedEvent.participants.length === 0) {
      alert("İndirilebilecek katılımcı bulunamadı.");
      return;
    }

    // CSV başlıkları
    const headers = ['İsim', 'E-posta', 'Telefon', 'Kayıt Tarihi'];
    
    // Katılımcı verilerini hazırlama
    const data = selectedEvent.participants.map(participant => {
      const user = participant.user;
      if (!user) return null;
      
      return [
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.phone || '-',
        formatDate(participant.joined_at)
      ];
    }).filter(Boolean); // null değerleri filtrele
    
    // CSV içeriğini oluşturma
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
      // Her hücredeki virgülleri kontrol et ve gerekirse tırnak içine al
      const formattedRow = row?.map(cell => {
        // Hücre içinde virgül, tırnak veya yeni satır varsa tırnak içine al
        if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          // Tırnak içindeki tırnakları escape et
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      });
      
      csvContent += formattedRow?.join(',') + '\n';
    });
    
    // CSV dosyasını indirme
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${toEnglish(selectedEvent.title)}_katilimcilar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Katılımcılar tablosunu oluşturan yardımcı fonksiyon
  const renderParticipants = (participants: Participant[] | undefined) => {
    if (!participants || participants.length === 0) {
      return (
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-md text-center text-gray-500 dark:text-gray-400">
          Henüz katılımcı bulunmamaktadır.
        </div>
      );
    }

    return (
      <div className="overflow-auto max-h-60 bg-gray-50 dark:bg-slate-800 rounded-md">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-100 dark:bg-slate-700">
            <tr>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">İsim</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">E-posta</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Telefon</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {participants.map((participant) => {
              const user = participant.user;
              if (!user) return null;

              return (
                <tr
                  key={participant.user_id}
                  className="hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                  onClick={() => {
                    // Participant nesnesi oluştururken kesin tip kontrolü için
                    const participantData: {
                      user_id: string;
                      joined_at: string;
                      event_id?: string;
                      role?: string;
                      name?: string;
                      email?: string;
                      phone?: string;
                      registration_date?: string;
                    } = {
                      user_id: participant.user_id,
                      joined_at: participant.joined_at
                    };

                    // Opsiyonel alanları sadece değerleri varsa ekle
                    if (participant.event_id) participantData.event_id = participant.event_id;
                    if (participant.role) participantData.role = participant.role;
                    participantData.name = `${user.first_name} ${user.last_name}`;
                    participantData.email = user.email;
                    if (user.phone) participantData.phone = user.phone;
                    participantData.registration_date = participant.joined_at;

                    setSelectedParticipant(participantData);
                  }}
                >
                  <td className="py-2 px-3">{`${user.first_name} ${user.last_name}`}</td>
                  <td className="py-2 px-3 text-blue-600 dark:text-blue-400">{user.email}</td>
                  <td className="py-2 px-3">{user.phone || "-"}</td>
                  <td className="py-2 px-3">{formatDate(participant.joined_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{viewMode === "edit" ? "Etkinlik Düzenle" : "Etkinlik Önizleme"}</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "preview" ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("preview")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "edit" ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              disabled={!selectedEvent}
              onClick={() => setViewMode("edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedEvent ? (
            viewMode === "preview" ? (
              <div className="space-y-6">
                <div className="relative h-48 w-full rounded-lg overflow-hidden">
                  <Image
                    src={selectedEvent.image || defaultImage}
                    alt={selectedEvent.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">{selectedEvent.title}</h3>
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(selectedEvent.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{selectedEvent.start_time ? formatDate(selectedEvent.start_time).split(',')[1] : ''} - {selectedEvent.end_time ? formatDate(selectedEvent.end_time).split(',')[1] : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEvent.location_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Kapasite: {selectedEvent.max_participants} kişi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Spor: {selectedEvent.sport ? selectedEvent.sport.name : 'Belirtilmemiş'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>Organizatör: {selectedEvent.creator ? `${selectedEvent.creator.first_name} ${selectedEvent.creator.last_name}` : 'Belirtilmemiş'}</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Etkinlik Detayları</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{selectedEvent.description}</p>
                  </div>

                  {/* Katılımcılar bölümünü tüm etkinlikler için göster */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-1 text-blue-500" />
                      <span>Katılımcılar ({selectedEvent.participants?.length || 0} / {selectedEvent.max_participants || 0})</span>
                    </h4>

                    {/* Katılımcı listesi */}
                    {renderParticipants(selectedEvent.participants)}

                    {/* Katılımcıları dışa aktarma butonu */}
                    <div className="mt-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm"
                        onClick={exportParticipantsToCSV}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Katılımcıları Dışa Aktar
                      </Button>
                    </div>

                    {/* Eğer katılımcı yoksa bilgi mesajı */}
                    {(!selectedEvent.participants?.length) && (
                      <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-md text-center flex items-center justify-center">
                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Henüz katılımcı bulunmamaktadır.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : ( // Edit Mode
              <div className="space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto pr-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title">Başlık</Label>
                    <Input
                      id="edit-title"
                      value={selectedEvent.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Açıklama</Label>
                    <Textarea
                      id="edit-description"
                      value={selectedEvent.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-image">Resim</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="edit-image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => handleImageUpload(e, false)}
                      />
                      {selectedEvent.image && (
                        <div className="relative w-full h-32 mt-2 rounded-md overflow-hidden">
                          <Image
                            src={selectedEvent.image}
                            alt="Etkinlik Resmi"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sadece PNG, JPG ve JPEG formatları desteklenmektedir.</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-date">Tarih</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      // Format date for input type='date'
                      value={selectedEvent.event_date ? new Date(selectedEvent.event_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange('event_date', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-time">Başlangıç Saati</Label>
                    <Input
                      id="edit-time"
                      type="time"
                      // Güvenli bir şekilde saati formatla
                      value={
                        selectedEvent.start_time ?
                          (() => {
                            try {
                              return new Date(selectedEvent.start_time).toTimeString().substring(0, 5);
                            } catch (e) {
                              return '';
                            }
                          })() :
                          ''
                      }
                      onChange={(e) => handleChange('start_time', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-end-time">Bitiş Saati</Label>
                    <Input
                      id="edit-end-time"
                      type="time"
                      // Güvenli bir şekilde saati formatla
                      value={
                        selectedEvent.end_time ?
                          (() => {
                            try {
                              return new Date(selectedEvent.end_time).toTimeString().substring(0, 5);
                            } catch (e) {
                              return '';
                            }
                          })() :
                          ''
                      }
                      onChange={(e) => handleChange('end_time', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-location">Konum</Label>
                    <Input
                      id="edit-location"
                      value={selectedEvent.location_name}
                      onChange={(e) => handleChange('location_name', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sport">Spor</Label>
                    {renderSelectWithFallback(
                      selectedEvent.sport_id?.toString(),
                      (value) => handleChange('sport_id', value),
                      "Spor seçin",
                      [
                        { value: "1", label: "Futbol" },
                        { value: "2", label: "Basketbol" },
                        { value: "3", label: "Voleybol" },
                        { value: "4", label: "Tenis" },
                        { value: "5", label: "Yüzme" },
                        // Add other sports as needed
                      ]
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-capacity">Kapasite</Label>
                    <Input
                      id="edit-capacity"
                      type="number"
                      min="1"
                      value={selectedEvent.max_participants}
                      onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
                    />
                  </div>
                  {/* Price and Organizer seem removed in original code? Let's assume they are not needed for now 
                  <div className="grid gap-2">
                    <Label htmlFor="edit-price">Ücret (TL)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={selectedEvent.price}
                      onChange={(e) => handleChange('price', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-organizer">Organizatör</Label>
                    <Input
                      id="edit-organizer"
                      value={selectedEvent.organizer} // Assuming 'organizer' exists on Event, might need creator info
                      onChange={(e) => handleChange('organizer', e.target.value)}
                    />
                  </div>
                   */}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">Durum</Label>
                      {renderSelectWithFallback(
                        selectedEvent.status,
                        (value) => handleChange('status', value),
                        "Durum seçin",
                        [
                          { value: "pending", label: "Beklemede" },
                          { value: "active", label: "Aktif" },
                          { value: "cancelled", label: "İptal Edildi" },
                        ]
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleEditEvent}>Değişiklikleri Kaydet</Button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Önizlemek için bir etkinlik seçin
            </div>
          )}
        </CardContent>
      </Card>

      {/* Katılımcı Detay Popup */}
      {selectedParticipant && (
        <Dialog open={!!selectedParticipant} onOpenChange={(open) => !open && setSelectedParticipant(null)}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="px-6 pt-5 pb-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-blue-950 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white dark:border-slate-700 shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {selectedParticipant?.name ? (
                        <>
                          {selectedParticipant.name.split(' ').map(n => n[0]).join('')}
                        </>
                      ) : (
                        <>
                          UK
                        </>
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl text-gray-800 dark:text-gray-100">
                      {selectedParticipant?.name ? (
                        <>
                          {selectedParticipant.name}
                        </>
                      ) : (
                        <>
                          Kullanıcı
                        </>
                      )}
                    </DialogTitle>
                    <CardDescription className="text-sm flex items-center gap-2 mt-1">
                      {selectedParticipant?.name && (
                        <>
                          @{selectedParticipant.name.toLowerCase().replace(/\s+/g, '')}
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>
            <div className="px-6 pt-5 pb-4">
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Kişisel Bilgiler</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</span>
                      </div>
                      <span className="text-sm bg-white dark:bg-slate-700 px-2 py-1 rounded border dark:border-slate-600">{selectedParticipant.email || "Belirtilmemiş"}</span>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</span>
                      </div>
                      <span className="text-sm bg-white dark:bg-slate-700 px-2 py-1 rounded border dark:border-slate-600">{selectedParticipant.phone || "Belirtilmemiş"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Etkinlik Bilgileri</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kayıt Tarihi</span>
                      </div>
                      <span className="text-sm bg-white dark:bg-slate-700 px-2 py-1 rounded border dark:border-slate-600">
                        {selectedParticipant?.registration_date && formatDate(selectedParticipant.registration_date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Etkinlik</span>
                      </div>
                      <span className="text-sm bg-white dark:bg-slate-700 px-2 py-1 rounded border dark:border-slate-600">
                        {selectedEvent?.title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Katılımcı İstatistikleri</h3>
                  <div className="space-y-3">
                    <div
                      onClick={() => setShowAttendedEvents(true)}
                      className="flex items-center justify-between cursor-pointer bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 p-3 rounded border dark:border-slate-600 mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium">Katıldığı Etkinlikler</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs mr-1">1</Badge> {/* Static count */}
                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>

                    <div
                      onClick={() => setShowSportsList(true)}
                      className="flex items-center justify-between cursor-pointer bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 p-3 rounded border dark:border-slate-600 mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Spor Dalları</span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex flex-wrap gap-1 justify-end items-center mr-1">
                          <Badge variant="outline" className="text-xs">{selectedEvent?.sport?.name ?? "Genel"}</Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-end space-x-2 border-t dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setSelectedParticipant(null)}
              >
                Kapat
              </Button>
              <Button
                variant="destructive"
                // onClick={handleRemoveParticipant}
                className="flex items-center gap-1"
              >
                <Shield className="h-4 w-4" />
                Etkinlikten Çıkar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Katıldığı Etkinlikler Popup */}
      <Dialog open={showAttendedEvents} onOpenChange={setShowAttendedEvents}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Katıldığı Etkinlikler</DialogTitle>
            <DialogDescription>
              Kullanıcının katıldığı tüm etkinliklerin listesi
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {/* Static content, needs dynamic data */}
              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">{selectedEvent?.title}</h4>
                  <span className="text-xs text-gray-500">{selectedEvent?.event_date && formatDate(selectedEvent.event_date)}</span>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{selectedEvent?.location_name}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spor Dalları Popup */}
      <Dialog open={showSportsList} onOpenChange={setShowSportsList}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tercih Ettiği Spor Dalları</DialogTitle>
            <DialogDescription>
              Kullanıcının tercih ettiği spor dalları
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {/* Static content, needs dynamic data */}
              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <Badge className="mr-2">{selectedEvent?.sport?.name ?? "Genel"}</Badge>
                  <span className="text-sm text-gray-700">
                    {selectedEvent?.sport?.name === "Futbol" ? "11 kişilik takım sporu" :
                      selectedEvent?.sport?.name === "Basketbol" ? "5 kişilik takım sporu" :
                        selectedEvent?.sport?.name === "Voleybol" ? "6 kişilik takım sporu" :
                          "Spor dalı hakkında bilgi bulunmuyor"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hakkında Raporlar Popup */}
      <Dialog open={showReportsList} onOpenChange={setShowReportsList}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Hakkında Yapılan Raporlar</DialogTitle>
            <DialogDescription>
              Kullanıcı hakkında yapılan raporların listesi
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {/* Static content, needs dynamic data */}
              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs mr-2 text-red-600 border-red-200 bg-red-50">
                      Uygunsuz Davranış
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">22.06.2024</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Etkinlik sırasında diğer katılımcılara karşı uygunsuz davranışlar sergiledi.
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">Rapor Eden: Ahmet Demir</span>
                  </div>
                  <Badge className="text-xs bg-green-500">
                    Çözüldü
                  </Badge>
                </div>
              </div>

              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs mr-2 text-red-600 border-red-200 bg-red-50">
                      Katılmama
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">15.05.2024</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Kayıt olduğu halde etkinliğe katılmadı ve haber vermedi.
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">Rapor Eden: Mehmet Yılmaz</span>
                  </div>
                  <Badge className="text-xs bg-blue-500">
                    İncelemede
                  </Badge>
                </div>
              </div>

              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs mr-2 text-red-600 border-red-200 bg-red-50">
                      Sözlü Taciz
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">03.04.2024</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Etkinlik sırasında sözlü tacizde bulunduğu iddia edildi.
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">Rapor Eden: Zeynep Kaya</span>
                  </div>
                  <Badge className="text-xs bg-gray-500">
                    İncelenmedi
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventPreview; 