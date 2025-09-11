import { useStore } from '@/lib/store';
import type { LoginCredentials, RegisterData } from '@/lib/services/authService';

// Auth hook - Zustand store'dan kimlik doğrulama işlemlerini alır
const useAuth = (requiredRole?: string) => {
  const store = useStore();
  
  // Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
  const hasRequiredRole = (): boolean => {
    // Debug logları
    console.log('Role check debug:', {
      requiredRole,
      isAuthenticated: store.isAuthenticated,
      user: store.user,
      userRole: store.user?.role
    });

    if (!requiredRole) {
      console.log('No role required, returning true');
      return true;
    }

    if (!store.isAuthenticated || !store.user) {
      console.log('User not authenticated or no user data');
      return false;
    }

    // Kullanıcı rolü undefined ise, localStorage'dan kontrol et
    if (!store.user.role) {
      console.log('User role is undefined, checking localStorage');
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const localUser = JSON.parse(userStr);
          console.log('LocalStorage user role:', localUser.role);
          store.user.role = localUser.role;
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }

    // Eğer "admin" rolü gerekiyorsa, kullanıcı "admin" veya "superadmin" rolüne sahip mi diye kontrol eder
    if (requiredRole === 'admin') {
      const hasRole = store.user.role === 'admin' || store.user.role === 'superadmin';
      console.log('Admin role check result:', hasRole);
      return hasRole;
    }

    // Diğer roller için de benzer kontrol yapılabilir
    const hasRole = store.user.role === requiredRole;
    console.log('Role check result:', hasRole);
    return hasRole;
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