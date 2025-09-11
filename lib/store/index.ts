import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Slices
import createAuthSlice, { type AuthState } from './slices/authSlice';
import createUserProfileSlice, { type UserProfileState } from './slices/userSlice';
import createSportSlice, { type SportState } from './slices/sportSlice';
import { createNewsSlice, type NewsState } from './slices/newsSlice';
import createFriendSlice, { type FriendState } from './slices/friendSlice';
import createEventSlice, { type EventState } from './slices/eventSlice';
import createAnnouncementSlice, { type AnnouncementState } from './slices/announcementSlice';
import createReportSlice, { type ReportState } from './slices/reportSlice';

// Store State Type
export type StoreState = AuthState & 
  UserProfileState & 
  SportState & 
  NewsState & 
  FriendState & 
  EventState &
  AnnouncementState &
  ReportState;

// Create combined store with all slices
export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        // Auth slice
        ...createAuthSlice(...a),
        
        // User profile slice
        ...createUserProfileSlice(...a),
        
        // Sport slice
        ...createSportSlice(...a),
        
        // News slice
        ...createNewsSlice(...a),
        
        // Friend slice
        ...createFriendSlice(...a),
        
        // Event slice
        ...createEventSlice(...a),

        // Announcement slice
        ...createAnnouncementSlice(...a),
        
        // Report slice
        ...createReportSlice(...a),
      }),
      {
        name: 'sport-vision-store',
        partialize: (state) => ({
          // Sadece kalıcı olması gereken state'leri belirt
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
          profile: state.profile
        }),
      }
    ),
    {
      name: 'SportVisionStore',
    }
  )
);

export default useStore;
