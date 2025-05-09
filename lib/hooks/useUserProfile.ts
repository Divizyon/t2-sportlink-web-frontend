import { useState, useCallback } from 'react';
import { userService } from '@/lib/services';
import type { User } from '@/interfaces/user';

/**
 * Kullanıcı profili hook'u - profil verilerini yönetir ve güncellemeleri yapar
 */
const useUserProfile = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Profil verilerini yükler
   */
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.getProfile();
      
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Profil yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      setError('Profil bilgileri yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Profil verilerini günceller
   */
  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.updateProfile(profileData);
      
      if (response.success && response.data) {
        setProfile(response.data);
        return { success: true, message: response.message };
      }
      
      setError(response.message || 'Profil güncellenirken bir hata oluştu');
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      setError('Profil bilgileri güncellenirken bir sorun oluştu');
      return { success: false, message: 'Profil bilgileri güncellenirken bir sorun oluştu' };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Profil fotoğrafını günceller
   */
  const updateProfilePicture = useCallback(async (imageFile: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.updateProfilePicture(imageFile);
      
      if (response.success && response.data) {
        // Eğer response.data üzerinde profile_picture varsa güncelleyelim
        if (profile && response.data.profile_picture) {
          const updatedProfile = { 
            ...profile, 
            profile_picture: response.data.profile_picture 
          };
          setProfile(updatedProfile);
        }
        return { success: true, message: response.message };
      }
      
      setError(response.message || 'Profil fotoğrafı güncellenirken bir hata oluştu');
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Profil fotoğrafı güncellenirken hata:', error);
      setError('Profil fotoğrafı güncellenirken bir sorun oluştu');
      return { success: false, message: 'Profil fotoğrafı güncellenirken bir sorun oluştu' };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  /**
   * Şifre değiştirme
   */
  const changePassword = useCallback(async (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.changePassword(data);
      
      if (response.success) {
        return { success: true, message: response.message };
      }
      
      setError(response.message || 'Şifre değiştirilirken bir hata oluştu');
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Şifre değiştirilirken hata:', error);
      setError('Şifre değiştirilirken bir sorun oluştu');
      return { success: false, message: 'Şifre değiştirilirken bir sorun oluştu' };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    updateProfilePicture,
    changePassword
  };
};

export default useUserProfile; 