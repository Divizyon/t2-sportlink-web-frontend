import { type StateCreator } from 'zustand';
import eventService from '@/lib/services/eventService';
import type { Event, EventFilterParams } from '@/interfaces/event';
import type { ApiError } from '@/lib/services/api';

export interface EventState {
  // State
  events: Event[];
  userEvents: Event[];
  userCreatedEvents: Event[];
  currentEvent: Event | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  getEvents: (params?: EventFilterParams) => Promise<void>;
  getEventById: (eventId: string) => Promise<void>;
  getEventBySlug: (slug: string) => Promise<void>;
  getUserEvents: () => Promise<void>;
  getUserCreatedEvents: () => Promise<void>;
  createEvent: (eventData: Partial<Event>) => Promise<{
    success: boolean;
    data?: Event;
    message: string | undefined;
  }>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<{
    success: boolean;
    data?: Event;
    message: string | undefined;
  }>;
  deleteEvent: (eventId: string) => Promise<{
    success: boolean;
    message: string | undefined;
  }>;
  joinEvent: (eventId: string) => Promise<{
    success: boolean;
    message: string | undefined;
  }>;
  leaveEvent: (eventId: string) => Promise<{
    success: boolean;
    message: string | undefined;
  }>;
  clearEventError: () => void;
  setPage: (page: number) => void;
}

const createEventSlice: StateCreator<EventState, [], [], EventState> = (set, get) => {
  return {
    // Initial state
    events: [],
    userEvents: [],
    userCreatedEvents: [],
    currentEvent: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },
    isLoading: false,
    error: null,

    // Actions
    getEvents: async (params) => {
      set({ isLoading: true, error: null });

      try {
        const response = await eventService.listEvents(params);

        if (response.success && response.data) {
          set({
            events: response.data,
            pagination: response.pagination || {
              total: response.data.length,
              page: 1,
              limit: 10,
              totalPages: Math.ceil(response.data.length / 10)
            },
            isLoading: false
          });
        } else {
          set({
            error: response.message || 'Etkinlikler yüklenirken bir hata oluştu',
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Etkinlikler yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Etkinlikler yüklenirken bir sorun oluştu',
          isLoading: false
        });
      }
    },

    getEventById: async (eventId: string) => {
      set({ isLoading: true, error: null });

      try {
        const response = await eventService.getEventById(eventId);

        if (response.success && response.data) {
          set({
            currentEvent: response.data,
            isLoading: false
          });
        } else {
          set({
            error: response.message || 'Etkinlik detayları yüklenirken bir hata oluştu',
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Etkinlik detayları yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Etkinlik detayları yüklenirken bir sorun oluştu',
          isLoading: false
        });
      }
    },

    getEventBySlug: async (slug: string) => {
      set({ isLoading: true, error: null });

      try {
        const response = await eventService.getEventBySlug(slug);

        if (response.success && response.data) {
          set({
            currentEvent: response.data,
            isLoading: false
          });
        } else {
          set({
            error: response.message || 'Etkinlik detayları yüklenirken bir hata oluştu',
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Etkinlik detayları yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Etkinlik detayları yüklenirken bir sorun oluştu',
          isLoading: false
        });
      }
    },

    getUserEvents: async () => {
      set({ isLoading: true, error: null });

      try {
        const response = await eventService.getUserEvents();

        if (response.success && response.data) {
          set({
            userEvents: response.data.events,
            isLoading: false
          });
        } else {
          set({
            error: response.message || 'Katıldığınız etkinlikler yüklenirken bir hata oluştu',
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Katıldığınız etkinlikler yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Katıldığınız etkinlikler yüklenirken bir sorun oluştu',
          isLoading: false
        });
      }
    },

    getUserCreatedEvents: async () => {
      set({ isLoading: true, error: null });

      try {
        const response = await eventService.getUserCreatedEvents();

        if (response.success && response.data) {
          set({
            userCreatedEvents: response.data.events,
            isLoading: false
          });
        } else {
          set({
            error: response.message || 'Oluşturduğunuz etkinlikler yüklenirken bir hata oluştu',
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Oluşturduğunuz etkinlikler yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Oluşturduğunuz etkinlikler yüklenirken bir sorun oluştu',
          isLoading: false
        });
      }
    },

    createEvent: async (eventData: Partial<Event>) => {
      set({ isLoading: true, error: null });

      try {
        const response = await eventService.createEvent(eventData);
        set({ isLoading: false });

        if (response.success && response.data) {
          // Oluşturulan etkinliği user created events listesine ekle
          set((state) => ({
            userCreatedEvents: [response.data!, ...state.userCreatedEvents]
          }));

          return {
            success: true,
            data: response.data,
            message: response.message
          };
        } else {
          set({
            error: response.message || 'Etkinlik oluşturulurken bir hata oluştu'
          });

          return {
            success: false,
            message: response.message
          };
        }
      } catch (error) {
        console.error('Etkinlik oluşturulurken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Etkinlik oluşturulurken bir sorun oluştu';

        set({
          error: errorMessage,
          isLoading: false
        });

        return {
          success: false,
          message: errorMessage
        };
      }
    },

    updateEvent: async (eventId: string, eventData: Partial<Event>) => {
      set({ isLoading: true, error: null });

      try {
        const response = await eventService.updateEvent(eventId, eventData);
        set({ isLoading: false });

        if (response.success && response.data) {
          // Mevcut etkinliği güncelle
          set((state) => ({
            currentEvent: response.data || null,
            // Listelerdeki etkinliği de güncelle
            userCreatedEvents: state.userCreatedEvents.map(
              e => e.id === eventId ? response.data! : e
            ),
            events: state.events.map(
              e => e.id === eventId ? response.data! : e
            )
          }));

          return {
            success: true,
            data: response.data,
            message: response.message
          };
        } else {
          set({
            error: response.message || 'Etkinlik güncellenirken bir hata oluştu'
          });

          return {
            success: false,
            message: response.message
          };
        }
      } catch (error) {
        console.error('Etkinlik güncellenirken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Etkinlik güncellenirken bir sorun oluştu';

        set({
          error: errorMessage,
          isLoading: false
        });

        return {
          success: false,
          message: errorMessage
        };
      }
    },

    deleteEvent: async (eventId: string) => {
      set({ isLoading: true, error: null });

      try {
        const response = await eventService.deleteEvent(eventId);
        set({ isLoading: false });

        if (response.success) {
          // Etkinliği listelerden kaldır
          set((state) => ({
            userCreatedEvents: state.userCreatedEvents.filter(e => e.id !== eventId),
            events: state.events.filter(e => e.id !== eventId),
            currentEvent: state.currentEvent?.id === eventId ? null : state.currentEvent
          }));

          return {
            success: true,
            message: response.message
          };
        } else {
          set({
            error: response.message || 'Etkinlik silinirken bir hata oluştu'
          });

          return {
            success: false,
            message: response.message
          };
        }
      } catch (error) {
        console.error('Etkinlik silinirken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Etkinlik silinirken bir sorun oluştu';

        set({
          error: errorMessage,
          isLoading: false
        });

        return {
          success: false,
          message: errorMessage
        };
      }
    },

    joinEvent: async (eventId: string) => {
      set({ isLoading: true, error: null });

      try {
        const response = await eventService.joinEvent(eventId);
        set({ isLoading: false });

        if (response.success) {
          // Katılımcı sayısını artır
          set((state) => {
            if (state.currentEvent && state.currentEvent.id === eventId) {
              return {
                currentEvent: {
                  ...state.currentEvent,
                  participantCount: (state.currentEvent.participantCount || 0) + 1
                },
                userEvents: [...state.userEvents, state.currentEvent]
              };
            }
            return state;
          });

          return {
            success: true,
            message: response.message
          };
        } else {
          set({
            error: response.message || 'Etkinliğe katılırken bir hata oluştu'
          });

          return {
            success: false,
            message: response.message
          };
        }
      } catch (error) {
        console.error('Etkinliğe katılırken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Etkinliğe katılırken bir sorun oluştu';

        set({
          error: errorMessage,
          isLoading: false
        });

        return {
          success: false,
          message: errorMessage
        };
      }
    },

    leaveEvent: async (eventId: string) => {
      set({ isLoading: true, error: null });

      try {
        const response = await eventService.leaveEvent(eventId);
        set({ isLoading: false });

        if (response.success) {
          // Katılımcı sayısını azalt
          set((state) => {
            if (state.currentEvent && state.currentEvent.id === eventId) {
              return {
                currentEvent: {
                  ...state.currentEvent,
                  participantCount: Math.max(0, (state.currentEvent.participantCount || 0) - 1)
                },
                userEvents: state.userEvents.filter(e => e.id !== eventId)
              };
            }
            return {
              userEvents: state.userEvents.filter(e => e.id !== eventId)
            };
          });

          return {
            success: true,
            message: response.message
          };
        } else {
          set({
            error: response.message || 'Etkinlikten ayrılırken bir hata oluştu'
          });

          return {
            success: false,
            message: response.message
          };
        }
      } catch (error) {
        console.error('Etkinlikten ayrılırken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Etkinlikten ayrılırken bir sorun oluştu';

        set({
          error: errorMessage,
          isLoading: false
        });

        return {
          success: false,
          message: errorMessage
        };
      }
    },

    clearEventError: () => set({ error: null }),

    setPage: (page: number) => {
      set((state) => ({
        pagination: {
          ...state.pagination,
          page
        }
      }));
      // Sayfa değiştiğinde etkinlikleri yenile
      const params = {
        page,
        limit: 10
      };
      get().getEvents(params);
    }
  };
};

export default createEventSlice; 