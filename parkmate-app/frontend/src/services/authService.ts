import apiClient from './apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      credentials
    );
    
    // Store access token
    localStorage.setItem('accessToken', response.data.data.accessToken);
    
    return response.data.data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      userData
    );
    
    // Store access token
    localStorage.setItem('accessToken', response.data.data.accessToken);
    
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },

  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete('/auth/account', { data: { password } });
    localStorage.removeItem('accessToken');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};

export default authService;
