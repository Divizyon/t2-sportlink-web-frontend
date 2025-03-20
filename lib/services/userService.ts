import api, { handleApiError, ApiError } from './api';
import { AxiosError } from 'axios';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

// User service class
class UserService {
  private readonly BASE_PATH = '/users';

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>(`${this.BASE_PATH}/me`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    try {
      const response = await api.post<{ token: string; user: User }>(
        `${this.BASE_PATH}/login`,
        credentials
      );
      // Store token
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Register user
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await api.post<User>(`${this.BASE_PATH}/register`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Update user profile
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>(`${this.BASE_PATH}/${userId}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    // Additional cleanup if needed
  }
}

export const userService = new UserService();
export default userService; 