import { useStore } from '@/lib/store';
import type { UserType } from '@/interfaces/user';

/**
 * Hook for user management
 */
const useUsers = () => {
  const store = useStore();
  
  return {
    // State
    users: store.users,
    selectedUser: store.selectedUser,
    totalUsers: store.totalUsers,
    currentPage: store.currentPage,
    pageSize: store.pageSize,
    isLoading: store.isLoading,
    error: store.error,
    
    // Actions
    getUsers: store.getUsers,
    getUserById: store.getUserById,
    createUser: store.createUser,
    updateUser: store.updateUser,
    deleteUser: store.deleteUser,
    selectUser: store.selectUser,
  };
};

export default useUsers; 