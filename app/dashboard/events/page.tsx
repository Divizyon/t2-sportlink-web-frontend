"use client";

import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Calendar, Users, MapPin, Pencil, Clock, Trophy, Tag, Trash, Eye, Check, Ban, X, Mail, Phone, Shield, Award, ChevronRight, AlertCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  date: string;
  time: string;
  category: string;
  capacity: number;
  status: "Aktif" | "Pasif" | "upcoming" | "ongoing" | "completed" | "cancelled";
  price: number;
  organizer: string;
  requirements?: string[];
  prizes?: string[];
  isApproved: boolean;
  createdBy: string;
  createdAt: string;
  visibility: "public" | "club_members";
  participants: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    registrationDate: string;
  }[];
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
      isApproved: true,
      visibility: "public",
      participants: [
        {
          id: "p1",
          name: "Mustafa Yılmaz",
          email: "mustafa@example.com",
          phone: "555-123-4567",
          registrationDate: "2024-05-01"
        },
        {
          id: "p2",
          name: "Ayşe Demir",
          email: "ayse@example.com",
          phone: "555-987-6543",
          registrationDate: "2024-05-02"
        },
        {
          id: "p3",
          name: "Mehmet Kaya",
          email: "mehmet@example.com",
          registrationDate: "2024-05-03"
        },
        {
          id: "p4",
          name: "Zeynep Şahin",
          email: "zeynep@example.com",
          phone: "555-456-7890",
          registrationDate: "2024-05-04"
        },
        {
          id: "p5",
          name: "Ali Öztürk",
          email: "ali@example.com",
          registrationDate: "2024-05-05"
        }
      ],
      createdBy: "admin",
      createdAt: "2024-06-01T12:00:00Z"
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
      isApproved: false,
      visibility: "public",
      participants: [],
      createdBy: "admin",
      createdAt: "2024-06-01T12:00:00Z"
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
      isApproved: false,
      visibility: "public",
      participants: [],
      createdBy: "admin",
      createdAt: "2024-06-01T12:00:00Z"
    }
  ]);

  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({
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
    isApproved: false,
    visibility: "public",
    participants: [],
    createdBy: "admin",
    createdAt: new Date().toISOString()
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
  const [searchField, setSearchField] = useState<"title" | "description" | "category" | "organizer">("title");
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[];
    status: string[];
    visibility: string[];
  }>({
    category: [],
    status: [],
    visibility: []
  });
  const [selectedParticipant, setSelectedParticipant] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    registrationDate: string;
  } | null>(null);

  const [newParticipant, setNewParticipant] = useState<{
    name: string;
    email: string;
    phone: string;
  }>({
    name: "",
    email: "",
    phone: ""
  });

  // Katılımcı istatistiklerine ilişkin popup durumları
  const [showAttendedEvents, setShowAttendedEvents] = useState(false);
  const [showSportsList, setShowSportsList] = useState(false);
  const [showReportsList, setShowReportsList] = useState(false);

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
    resetEvent();
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

  const handleAddParticipant = () => {
    if (!selectedEvent || !newParticipant.name || !newParticipant.email) return;
    
    const participant = {
      id: Date.now().toString(),
      name: newParticipant.name,
      email: newParticipant.email,
      phone: newParticipant.phone || undefined,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    
    const updatedEvent = {
      ...selectedEvent,
      participants: [...(selectedEvent.participants || []), participant]
    };
    
    setEvents(prevEvents => prevEvents.map(event => 
      event.id === selectedEvent.id ? updatedEvent as Event : event
    ));
    
    setSelectedEvent(updatedEvent as Event);
    
    setNewParticipant({
      name: "",
      email: "",
      phone: ""
    });
  };

  const handleEditParticipant = () => {
    if (!selectedEvent || !selectedParticipant) return;
    
    const updatedParticipants = selectedEvent.participants.map(participant => 
      participant.id === selectedParticipant.id ? selectedParticipant : participant
    );
    
    const updatedEvent = {
      ...selectedEvent,
      participants: updatedParticipants
    };
    
    setEvents(prevEvents => prevEvents.map(event => 
      event.id === selectedEvent.id ? updatedEvent as Event : event
    ));
    
    setSelectedEvent(updatedEvent as Event);
    setSelectedParticipant(null);
  };

  const handleDeleteParticipant = (id: string) => {
    if (!selectedEvent) return;
    
    const updatedParticipants = selectedEvent.participants.filter(participant => 
      participant.id !== id
    );
    
    const updatedEvent = {
      ...selectedEvent,
      participants: updatedParticipants
    };
    
    setEvents(prevEvents => prevEvents.map(event => 
      event.id === selectedEvent.id ? updatedEvent as Event : event
    ));
    
    setSelectedEvent(updatedEvent as Event);
    
    if (selectedParticipant && selectedParticipant.id === id) {
      setSelectedParticipant(null);
    }
  };

  const handleFilterChange = (type: 'category' | 'status' | 'visibility', value: string) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[type];
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [type]: currentFilters.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [type]: [...currentFilters, value]
        };
      }
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event[searchField].toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedFilters.category.length === 0 || 
      selectedFilters.category.includes(event.category);

    const matchesStatus = selectedFilters.status.length === 0 || 
      selectedFilters.status.includes(event.status);

    const matchesVisibility = selectedFilters.visibility.length === 0 || 
      selectedFilters.visibility.includes(event.visibility);

    return matchesSearch && matchesCategory && matchesStatus && matchesVisibility;
  });

  const pendingApprovalEvents = events.filter((event: Event) => !event.isApproved);

  const getTotalSelectedFilters = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
  };

  const resetEvent = () => {
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
      isApproved: false,
      visibility: "public",
      participants: [],
      createdBy: "admin",
      createdAt: new Date().toISOString()
    });
  };

  const handleChange = (name: string, value: string | number | string[] | boolean) => {
    if (name === "status") {
      // Ensure the value is one of the allowed status types
      const statusValue = value as "Aktif" | "Pasif" | "upcoming" | "ongoing" | "completed" | "cancelled";
      setSelectedEvent(prev => prev ? { ...prev, [name]: statusValue } : null);
    } else {
      setSelectedEvent(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

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
                          {['Futbol', 'Basketbol', 'Voleybol', 'Tenis', 'Yüzme', 'Diğer'].map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`category-${category}`}
                                checked={selectedFilters.category.includes(category)}
                                onChange={() => handleFilterChange('category', category)}
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
                          {['Aktif', 'Tamamlandı', 'İptal Edildi'].map((status) => (
                            <div key={status} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`status-${status}`}
                                checked={selectedFilters.status.includes(status)}
                                onChange={() => handleFilterChange('status', status)}
                                className="h-4 w-4"
                              />
                              <label htmlFor={`status-${status}`}>{status}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">Görünürlük</h4>
                        <div className="space-y-2">
                          {['Herkese Açık', 'Üyelere Özel'].map((visibility) => (
                            <div key={visibility} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`visibility-${visibility}`}
                                checked={selectedFilters.visibility.includes(visibility)}
                                onChange={() => handleFilterChange('visibility', visibility)}
                                className="h-4 w-4"
                              />
                              <label htmlFor={`visibility-${visibility}`}>{visibility}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Etkinlik Ekle
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
                        onValueChange={(value: "Aktif" | "Pasif" | "upcoming" | "ongoing" | "completed" | "cancelled") => 
                          setNewEvent({ ...newEvent, status: value })}
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
                    <div className="grid gap-2">
                      <Label htmlFor="visibility">Görünürlük</Label>
                      <Select
                        value={newEvent.visibility}
                        onValueChange={(value: "public" | "club_members") => setNewEvent({ ...newEvent, visibility: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Görünürlük seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Herkese Açık</SelectItem>
                          <SelectItem value="club_members">Kulüp Üyelerine Özel</SelectItem>
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
                        <Badge 
                          variant={
                            event.status === "Aktif" || event.status === "upcoming" ? "default" :
                            event.status === "ongoing" ? "outline" :
                            event.status === "completed" ? "secondary" :
                            "destructive"
                          }
                        >
                          {event.status}
                        </Badge>
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
                      <h4 className="font-medium mb-2">Etkinlik Detayları</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{selectedEvent.description}</p>
                    </div>
                    {selectedEvent.requirements && selectedEvent.requirements.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Gerekli Ekipmanlar</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          {selectedEvent.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedEvent.prizes && selectedEvent.prizes.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Ödüller</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          {selectedEvent.prizes.map((prize, index) => (
                            <li key={index}>{prize}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Sadece onaylanmış etkinlikler için katılımcılar bölümünü göster */}
                    {selectedEvent.isApproved && selectedEvent.participants && selectedEvent.participants.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Katılımcılar ({selectedEvent.participants.length} / {selectedEvent.capacity})</h4>
                        <div className="overflow-auto max-h-60 bg-gray-50 rounded-md">
                          <table className="min-w-full text-sm">
                            <thead className="sticky top-0 bg-gray-100">
                              <tr>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">İsim</th>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedEvent.participants.map((participant) => (
                                <tr 
                                  key={participant.id} 
                                  className="hover:bg-gray-100 cursor-pointer"
                                  onClick={() => setSelectedParticipant(participant)}
                                >
                                  <td className="py-2 px-3">{participant.name}</td>
                                  <td className="py-2 px-3 text-blue-600">{participant.email}</td>
                                  <td className="py-2 px-3">{participant.phone || "-"}</td>
                                  <td className="py-2 px-3">{new Date(participant.registrationDate).toLocaleDateString('tr-TR')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-sm"
                          >
                            Katılımcıları Dışa Aktar
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedEvent.isApproved && (!selectedEvent.participants || selectedEvent.participants.length === 0) && (
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Katılımcılar (0 / {selectedEvent.capacity})</h4>
                        <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                          Henüz katılımcı bulunmamaktadır.
                        </div>
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
                        <span className="text-xs text-gray-500 mt-1">Sadece PNG, JPG ve JPEG formatları desteklenmektedir.</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-date">Tarih</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={selectedEvent.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-time">Saat</Label>
                      <Input
                        id="edit-time"
                        type="time"
                        value={selectedEvent.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-location">Konum</Label>
                      <Input
                        id="edit-location"
                        value={selectedEvent.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">Kategori</Label>
                      <Select
                        value={selectedEvent.category}
                        onValueChange={(value) => handleChange('category', value)}
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
                        onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                      />
                    </div>
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
                        value={selectedEvent.organizer}
                        onChange={(e) => handleChange('organizer', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-status">Durum</Label>
                          <Select
                            value={selectedEvent.status}
                            onValueChange={(value) => handleChange('status', value as "Aktif" | "Pasif" | "upcoming" | "ongoing" | "completed" | "cancelled")}
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
                        <div className="grid gap-2">
                          <Label htmlFor="visibility">Görünürlük</Label>
                          <Select
                            value={selectedEvent.visibility}
                            onValueChange={(value: "public" | "club_members") => handleChange('visibility', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Görünürlük seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Herkese Açık</SelectItem>
                              <SelectItem value="club_members">Kulüp Üyelerine Özel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
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

      {/* Katılımcı Detay Popup */}
      {selectedParticipant && (
        <Dialog open={!!selectedParticipant} onOpenChange={(open) => !open && setSelectedParticipant(null)}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="px-6 pt-5 pb-3 bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {selectedParticipant?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl text-gray-800">{selectedParticipant?.name}</DialogTitle>
                    <CardDescription className="text-sm flex items-center gap-2 mt-1">
                      <span>@{selectedParticipant?.name.toLowerCase().replace(/\s+/g, '')}</span>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Katılımcı
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>
            <div className="px-6 pt-5 pb-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Kişisel Bilgiler</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">E-posta</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{selectedParticipant?.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Telefon</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{selectedParticipant?.phone || "Belirtilmemiş"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Etkinlik Bilgileri</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">Kayıt Tarihi</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">
                        {selectedParticipant?.registrationDate && new Date(selectedParticipant.registrationDate).toLocaleDateString("tr-TR")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-gray-700">Etkinlik</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">
                        {selectedEvent?.title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Rol Yönetimi</h3>
                  <div className="flex items-center justify-between px-1 mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">Kullanıcı Rolü</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value="user"
                        onValueChange={() => {}}
                      >
                        <SelectTrigger id="edit-role" className="w-[120px] h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">Üye</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={() => {}} className="w-full bg-green-600 hover:bg-green-700 text-sm h-9">
                    Kaydet
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Katılımcı İstatistikleri</h3>
                  <div className="space-y-3">
                    <div 
                      onClick={() => setShowAttendedEvents(true)}
                      className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100 p-3 rounded border mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium">Katıldığı Etkinlikler</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs mr-1">1</Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => setShowSportsList(true)}
                      className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100 p-3 rounded border mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Spor Dalları</span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex flex-wrap gap-1 justify-end items-center mr-1">
                          <Badge variant="outline" className="text-xs">{selectedEvent?.category || "Genel"}</Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div 
                      onClick={() => setShowReportsList(true)}
                      className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100 p-3 rounded border mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Hakkında Raporlar</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200 mr-1">2</Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">{selectedEvent?.title}</h4>
                  <span className="text-xs text-gray-500">{selectedEvent?.date && new Date(selectedEvent.date).toLocaleDateString("tr-TR")}</span>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{selectedEvent?.location}</span>
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
              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <Badge className="mr-2">{selectedEvent?.category || "Genel"}</Badge>
                  <span className="text-sm text-gray-700">
                    {selectedEvent?.category === "Futbol" ? "11 kişilik takım sporu" : 
                     selectedEvent?.category === "Basketbol" ? "5 kişilik takım sporu" : 
                     selectedEvent?.category === "Voleybol" ? "6 kişilik takım sporu" : 
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
    </div>
  );
} 