import { authService, eventService, userService, sportService, newsService, friendService } from '@/lib/services';

/**
 * API Client - Farklı servislerin metotlarına kolay erişim sağlayan merkezi API istemcisi
 * Bu yapı component'lerde ve sayfalarda kullanılabilir
 */
export const apiClient = {
  // Auth işlemleri
  auth: {
    login: authService.login.bind(authService),
    register: authService.register.bind(authService),
    logout: authService.logout.bind(authService),
    forgotPassword: authService.resetPassword.bind(authService),
    resendEmailConfirmation: authService.resendEmailConfirmation.bind(authService),
    isAuthenticated: authService.isAuthenticated.bind(authService),
    getCurrentUser: authService.getCurrentUser.bind(authService)
  },
  
  // Kullanıcı profili işlemleri
  user: {
    getProfile: userService.getProfile.bind(userService),
    updateProfile: userService.updateProfile.bind(userService),
    changePassword: userService.changePassword.bind(userService),
    updateProfilePicture: userService.updateProfilePicture.bind(userService)
  },
  
  // Etkinlik işlemleri
  events: {
    listEvents: eventService.listEvents.bind(eventService),
    getEvent: eventService.getEventById.bind(eventService),
    getEventBySlug: eventService.getEventBySlug.bind(eventService),
    createEvent: eventService.createEvent.bind(eventService),
    updateEvent: eventService.updateEvent.bind(eventService),
    deleteEvent: eventService.deleteEvent.bind(eventService),
    joinEvent: eventService.joinEvent.bind(eventService),
    leaveEvent: eventService.leaveEvent.bind(eventService),
    getUserEvents: eventService.getUserEvents.bind(eventService),
    getUserCreatedEvents: eventService.getUserCreatedEvents.bind(eventService)
  },
  
  // Spor dalları işlemleri
  sports: {
    listSports: sportService.listSports.bind(sportService),
    getSport: sportService.getSportById.bind(sportService),
    getPopularSports: sportService.getPopularSports.bind(sportService),
    getSportsByCategory: sportService.getSportsByCategory.bind(sportService)
  },
  
  // Haber işlemleri
  news: {
    listNews: newsService.listNews.bind(newsService),
    getNewsById: newsService.getNewsById.bind(newsService),
    getNewsBySport: newsService.getNewsBySport.bind(newsService),
    getFeaturedNews: newsService.getFeaturedNews.bind(newsService)
  },
  
  // Arkadaşlık işlemleri
  friends: {
    sendFriendRequest: friendService.sendFriendRequest.bind(friendService),
    acceptFriendRequest: friendService.acceptFriendRequest.bind(friendService),
    rejectFriendRequest: friendService.rejectFriendRequest.bind(friendService),
    removeFriend: friendService.removeFriend.bind(friendService),
    listFriendRequests: friendService.listFriendRequests.bind(friendService),
    listFriends: friendService.listFriends.bind(friendService),
    getFriendshipStatus: friendService.getFriendshipStatus.bind(friendService)
  }
};

export default apiClient; 