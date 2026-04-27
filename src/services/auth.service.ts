import apiClient from '@/lib/apiClient';
import { setTokens, clearTokens } from '@/lib/tokenStorage';

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/api/users/login/', { email, password });
    setTokens(res.data.access, res.data.refresh);
    return res.data;
  },

  logout(): void {
    clearTokens();
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/users/forgot-password/', { email });
  },

  async verifyOtp(email: string, code: string): Promise<void> {
    await apiClient.post('/api/users/verify-otp/', { email, code });
  },

  async resetPassword(email: string, new_password: string, confirm_password: string): Promise<void> {
    await apiClient.post('/api/users/reset-password/', { email, new_password, confirm_password });
  },

  async changePassword(current_password: string, new_password: string, confirm_password: string): Promise<void> {
    await apiClient.post('/api/users/change-password/', { current_password, new_password, confirm_password });
  },
};
