"use client";

import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Calendar, Users, MapPin, Pencil, Clock, Trophy, Tag, Trash, Eye, Check, Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  status: string;
  image: string;
  price: number;
  organizer: string;
  requirements: string[];
  prizes: string[];
  isApproved: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Futbol Turnuvası",
      description: "Yıllık futbol turnuvası başlıyor! Tüm takımlar katılabilir. Turnuva 3 gün sürecek ve her gün 4 maç oynanacak. Kazanan takıma 10.000 TL ödül verilecek.",
      date: "2024-06-15",
      time: "14:00",
      location: "Merkez Spor Salonu",
      category: "Futbol",
      capacity: 100,
      status: "Aktif",
      image: "/images/football-tournament.jpg",
      price: 500,
      organizer: "Spor Kulübü",
      requirements: ["Spor kıyafetleri", "Futbol ayakkabısı", "Su matarası"],
      prizes: ["10.000 TL", "Kupa", "Madalya"],
      isApproved: true
    },
    {
      id: "2",
      title: "Basketbol Maçı",
      description: "A takımı vs B takımı heyecanlı maç. Maç sonrası ödül töreni ve kokteyl düzenlenecek. Tüm basketbol severler davetlidir.",
      date: "2024-06-20",
      time: "19:00",
      location: "Kapalı Spor Salonu",
      category: "Basketbol",
      capacity: 50,
      status: "Aktif",
      image: "/images/basketball-match.jpg",
      price: 200,
      organizer: "Basketbol Federasyonu",
      requirements: ["Spor kıyafetleri", "Basketbol topu", "Spor çantası"],
      prizes: ["5.000 TL", "Kupa", "Madalya"],
      isApproved: false
    },
    {
      id: "3",
      title: "Voleybol Turnuvası",
      description: "Liselerarası voleybol turnuvası. Şehrimizdeki tüm liseler katılabilir.",
      date: "2024-07-10",
      time: "16:00",
      location: "Belediye Spor Salonu",
      category: "Voleybol",
      capacity: 75,
      status: "Aktif",
      image: "/images/volleyball-tournament.jpg",
      price: 0,
      organizer: "Gençlik Spor İl Müdürlüğü",
      requirements: ["Okul forması", "Spor ayakkabısı"],
      prizes: ["3.000 TL", "Kupa", "Madalya"],
      isApproved: false
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    capacity: 0,
    status: "Aktif",
    image: "",
    price: 0,
    organizer: "",
    requirements: [] as string[],
    prizes: [] as string[],
    isApproved: false
  });

  // Dosya yükleme için yardımcı fonksiyon
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, isNewEvent: boolean) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Yalnızca PNG, JPG ve JPEG formatlarını kabul et
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Lütfen sadece PNG, JPG veya JPEG formatında dosya yükleyiniz.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      if (isNewEvent) {
        setNewEvent({
          ...newEvent,
          image: base64String
        });
      } else if (selectedEvent) {
        setSelectedEvent({
          ...selectedEvent,
          image: base64String
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [searchQuery, setSearchQuery] = useState("");

  // Sayfa yüklendiğinde ilk etkinliği otomatik seç
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0] as Event);
    }
  }, [events, selectedEvent]);

  const handleAddEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
      ...newEvent
    };

    setEvents([event, ...events]);
    setSelectedEvent(event);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "",
      capacity: 0,
      status: "Aktif",
      image: "",
      price: 0,
      organizer: "",
      requirements: [],
      prizes: [],
      isApproved: false
    });
  };

  const handleEditEvent = () => {
    if (!editingEvent) return;

    setEvents(events.map(event => 
      event.id === editingEvent.id ? editingEvent : event
    ));
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    const remainingEvents = events.filter(event => event.id !== id);
    setEvents(remainingEvents);
    
    if (selectedEvent && selectedEvent.id === id) {
      if (remainingEvents.length > 0) {
        setSelectedEvent(remainingEvents[0] as Event);
      } else {
        setSelectedEvent(null);
      }
    }
  };

  const handleApproveEvent = (id: string) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, isApproved: true } : event
    ));
  };

  const handleRejectEvent = (id: string) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, isApproved: false } : event
    ));
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingApprovalEvents = events.filter(event => !event.isApproved);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-4rem)]">
      {/* Sol taraf (3/5) - İki parçaya bölünmüş */}
      <div className="lg:col-span-3 grid grid-cols-1 gap-6 overflow-y-auto">
        
        {/* Üst bölüm - Etkinlik Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Etkinlik Listesi</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Etkinlik ara..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Etkinlik
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Yeni Etkinlik Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Başlık</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Açıklama</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image">Resim</Label>
                      <div className="flex flex-col gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={(e) => handleImageUpload(e, true)}
                        />
                        {newEvent.image && (
                          <div className="relative w-full h-32 mt-2 rounded-md overflow-hidden">
                            <Image
                              src={newEvent.image}
                              alt="Etkinlik Önizleme"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-xs text-gray-500 mt-1">Sadece PNG, JPG ve JPEG formatları desteklenmektedir.</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Tarih</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Saat</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Konum</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select
                        value={newEvent.category}
                        onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Futbol">Futbol</SelectItem>
                          <SelectItem value="Basketbol">Basketbol</SelectItem>
                          <SelectItem value="Voleybol">Voleybol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="capacity">Kapasite</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={newEvent.capacity}
                        onChange={(e) => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Ücret (TL)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({ ...newEvent, price: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="organizer">Organizatör</Label>
                      <Input
                        id="organizer"
                        value={newEvent.organizer}
                        onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Durum</Label>
                      <Select
                        value={newEvent.status}
                        onValueChange={(value) => setNewEvent({ ...newEvent, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aktif">Aktif</SelectItem>
                          <SelectItem value="Pasif">Pasif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddEvent}>Etkinlik Ekle</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-auto">
              <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Onay</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr 
                      key={event.id}
                      className={`
                        hover:bg-green-50 cursor-pointer
                        ${selectedEvent?.id === event.id ? 'bg-green-100' : ''}
                      `}
                      style={{
                        borderLeft: selectedEvent?.id === event.id ? '6px solid #059669' : 'none'
                      }}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.date).toLocaleDateString('tr-TR')}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{event.category}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                        {event.status === "Aktif" ? 
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            Yayında
                          </Badge> : 
                          <Badge variant="secondary">
                            Taslak
                          </Badge>
                        }
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                        {event.isApproved ? 
                          <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
                            Onaylanmış
                          </Badge> : 
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">
                            Onay Bekliyor
                          </Badge>
                        }
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Alt bölüm - Admin Onay Alanı */}
        <Card>
          <CardHeader>
            <CardTitle>Etkinlik Onay Merkezi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Onay Bekleyen Etkinlikler ({pendingApprovalEvents.length})</h3>
            </div>
            {pendingApprovalEvents.length > 0 ? (
              <div className="overflow-auto">
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader>
              <TableRow>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizatör</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {pendingApprovalEvents.map((event) => (
                      <tr 
                        key={event.id}
                        className="hover:bg-orange-50 cursor-pointer"
                        onClick={() => {
                          setSelectedEvent(event);
                          setViewMode("preview");
                        }}
                      >
                        <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{event.organizer}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.date).toLocaleDateString('tr-TR')}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{event.category}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveEvent(event.id);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Onayla
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectEvent(event.id);
                              }}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Reddet
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </TableBody>
                </Table>
                  </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="text-gray-500">Onay bekleyen etkinlik bulunmamaktadır</div>
                  </div>
            )}
          </CardContent>
        </Card>
                  </div>

      {/* Sağ taraf (2/5) - Etkinlik Önizleme */}
      <div className="lg:col-span-2 overflow-y-auto">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Etkinlik Önizleme</CardTitle>
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
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold">{selectedEvent.title}</h3>
                      <Badge variant={selectedEvent.status === "Aktif" ? "outline" : "secondary"} className={selectedEvent.status === "Aktif" ? "border-green-500 text-green-600" : ""}>
                        {selectedEvent.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedEvent.date).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{selectedEvent.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedEvent.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Kapasite: {selectedEvent.capacity} kişi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span>Ücret: {selectedEvent.price} TL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span>Organizatör: {selectedEvent.organizer}</span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <h4 className="font-medium mb-2">Açıklama</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{selectedEvent.description}</p>
                    </div>
                    {selectedEvent.requirements.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Gerekli Ekipmanlar</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {selectedEvent.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedEvent.prizes.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Ödüller</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {selectedEvent.prizes.map((prize, index) => (
                            <li key={index}>{prize}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-title">Başlık</Label>
                      <Input
                        id="edit-title"
                        value={selectedEvent.title}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-description">Açıklama</Label>
                      <Textarea
                        id="edit-description"
                        value={selectedEvent.description}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
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
                        <span className="text-xs text-gray-500 mt-1">Sadece PNG, JPG ve JPEG formatları desteklenmektedir.</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-date">Tarih</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={selectedEvent.date}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-time">Saat</Label>
                      <Input
                        id="edit-time"
                        type="time"
                        value={selectedEvent.time}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-location">Konum</Label>
                      <Input
                        id="edit-location"
                        value={selectedEvent.location}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">Kategori</Label>
                      <Select
                        value={selectedEvent.category}
                        onValueChange={(value) => setSelectedEvent({ ...selectedEvent, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Futbol">Futbol</SelectItem>
                          <SelectItem value="Basketbol">Basketbol</SelectItem>
                          <SelectItem value="Voleybol">Voleybol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-capacity">Kapasite</Label>
                      <Input
                        id="edit-capacity"
                        type="number"
                        value={selectedEvent.capacity}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, capacity: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-price">Ücret (TL)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        value={selectedEvent.price}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, price: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-organizer">Organizatör</Label>
                      <Input
                        id="edit-organizer"
                        value={selectedEvent.organizer}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, organizer: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">Durum</Label>
                      <Select
                        value={selectedEvent.status}
                        onValueChange={(value) => setSelectedEvent({ ...selectedEvent, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aktif">Aktif</SelectItem>
                          <SelectItem value="Pasif">Pasif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => {
                        if (selectedEvent) {
                          setEvents(events.map(event => 
                            event.id === selectedEvent.id ? selectedEvent : event
                          ));
                          setViewMode("preview");
                        }
                      }}>Değişiklikleri Kaydet</Button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center text-gray-500 py-8">
                Önizlemek için bir etkinlik seçin
              </div>
            )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 