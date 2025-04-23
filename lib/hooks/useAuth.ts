import { useStore } from '@/lib/store';
import type { LoginCredentials, RegisterData } from '@/lib/services/authService';

// Auth hook - Zustand store'dan kimlik doğrulama işlemlerini alır
const useAuth = (requiredRole?: string) => {
  const store = useStore();
  
  // Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
  const hasRequiredRole = (): boolean => {
    if (!requiredRole) return true; // Eğer required role belirtilmemişse her zaman true döner
    if (!store.isAuthenticated || !store.user) return false; // Kullanıcı giriş yapmamışsa false döner
    
    // Eğer "admin" rolü gerekiyorsa, kullanıcı "admin" rolüne sahip mi diye kontrol eder
    if (requiredRole === 'admin') {
      return store.user.role === 'admin';
    }
    
    // Diğer roller için de benzer kontrol yapılabilir
    // Örneğin: moderator, user, premium-user vb.
    return store.user.role === requiredRole;
  };
  
  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    hasRequiredRole: hasRequiredRole(),
    
    // Actions
    login: store.login,
    register: store.register,
    logout: store.logout,
    forgotPassword: store.forgotPassword,
    resendEmailConfirmation: store.resendEmailConfirmation,
    verifyEmail: store.verifyEmail,
    clearError: store.clearError
  };
};

export default useAuth; 