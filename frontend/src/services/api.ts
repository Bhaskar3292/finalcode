/**
 * API service for handling HTTP requests to Django backend
 * Uses centralized Axios configuration with authentication and error handling
 */

import api from '../api/axios';
import { 
  LoginRequest, 
  LoginResponse, 
  User,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerification,
  ApiError
} from '../types/auth';

class ApiService {
  /**
   * Store tokens in localStorage
   */
  private storeTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  /**
   * Clear tokens from localStorage
   */
  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  /**
   * User registration
   */
  async register(data: any): Promise<any> {
    try {
      const response = await api.post('/auth/register/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  /**
   * User login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login/', {
        email: data.email,
        password: data.password,
        totp_token: data.totp_token
      });

      const responseData = response.data;

      // Store tokens and user data
      this.storeTokens(responseData.tokens.access, responseData.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(responseData.user));

      return responseData;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  /**
   * Change password
   */
  async changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/password/change/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Password change failed');
    }
  }

  /**
   * Setup Two-Factor Authentication
   */
  async setup2FA(): Promise<{
    secret: string;
    qr_code: string;
    backup_codes: string[];
  }> {
    try {
      const response = await api.get('/auth/2fa/setup/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '2FA setup failed');
    }
  }

  /**
   * Enable Two-Factor Authentication
   */
  async enable2FA(totp_token: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/2fa/setup/', { totp_token });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '2FA enable failed');
    }
  }

  /**
   * Disable Two-Factor Authentication
   */
  async disable2FA(): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/2fa/disable/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '2FA disable failed');
    }
  }

  /**
   * Unlock user account (admin only)
   */
  async unlockUserAccount(userId: number): Promise<{ message: string }> {
    try {
      const response = await api.post(`/auth/users/${userId}/unlock/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Account unlock failed');
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get user profile');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/password-reset/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Password reset request failed');
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/password-reset/confirm/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Password reset failed');
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: EmailVerification): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/verify-email/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Email verification failed');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Facility Management API methods

  /**
   * Get all locations
   */
  async getLocations(): Promise<any[]> {
    try {
      const response = await api.get('/facilities/locations/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get locations');
    }
  }

  /**
   * Create a new location
   */
  async createLocation(data: any): Promise<any> {
    try {
      const response = await api.post('/facilities/locations/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create location');
    }
  }

  /**
   * Get location details
   */
  async getLocation(id: number): Promise<any> {
    try {
      const response = await api.get(`/facilities/locations/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get location');
    }
  }

  /**
   * Update location
   */
  async updateLocation(id: number, data: any): Promise<any> {
    try {
      const response = await api.patch(`/facilities/locations/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update location');
    }
  }

  /**
   * Delete location
   */
  async deleteLocation(id: number): Promise<void> {
    try {
      await api.delete(`/facilities/locations/${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete location');
    }
  }

  /**
   * Get location dashboard
   */
  async getLocationDashboard(locationId: number): Promise<any> {
    try {
      const response = await api.get(`/facilities/locations/${locationId}/dashboard/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get dashboard');
    }
  }

  /**
   * Update dashboard section data
   */
  async updateDashboardSection(sectionId: number, data: any): Promise<any> {
    try {
      const response = await api.patch(`/facilities/dashboard-section-data/${sectionId}/`, { data });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update dashboard section');
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(): Promise<any> {
    try {
      const response = await api.get('/permissions/user/permissions/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get permissions');
    }
  }

  /**
   * Check specific permissions
   */
  async checkPermissions(permissionCodes: string[]): Promise<any> {
    try {
      const params = new URLSearchParams();
      permissionCodes.forEach(code => params.append('permission_codes', code));
      const response = await api.get(`/permissions/user/check/?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to check permissions');
    }
  }

  /**
   * Get permissions matrix (admin only)
   */
  async getPermissionsMatrix(): Promise<any> {
    try {
      const response = await api.get('/permissions/roles/permissions/matrix/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get permissions matrix');
    }
  }

  /**
   * Update role permissions (admin only)
   */
  async updateRolePermissions(role: string, permissions: any[]): Promise<any> {
    try {
      const response = await api.post('/permissions/roles/permissions/bulk-update/', { 
        role, 
        permissions 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update role permissions');
    }
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<any[]> {
    try {
      const response = await api.get('/auth/users/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get users');
    }
  }

  /**
   * Create user (admin only)
   */
  async createUser(data: any): Promise<any> {
    try {
      const response = await api.post('/auth/users/create/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create user');
    }
  }

  /**
   * Update user (admin only)
   */
  async updateUser(id: number, data: any): Promise<any> {
    try {
      const response = await api.patch(`/auth/users/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/auth/users/${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete user');
    }
  }

  /**
   * Get tanks for a location
   */
  async getTanks(locationId?: number): Promise<any[]> {
    try {
      const endpoint = locationId 
        ? `/facilities/locations/${locationId}/tanks/`
        : '/facilities/tanks/';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get tanks');
    }
  }

  /**
   * Create tank
   */
  async createTank(data: any, locationId?: number): Promise<any> {
    try {
      const endpoint = locationId 
        ? `/facilities/locations/${locationId}/tanks/`
        : '/facilities/tanks/';
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create tank');
    }
  }

  /**
   * Update tank
   */
  async updateTank(id: number, data: any): Promise<any> {
    try {
      const response = await api.patch(`/facilities/tanks/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update tank');
    }
  }

  /**
   * Delete tank
   */
  async deleteTank(id: number): Promise<void> {
    try {
      await api.delete(`/facilities/tanks/${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete tank');
    }
  }

  /**
   * Get permits for a location
   */
  async getPermits(locationId?: number): Promise<any[]> {
    try {
      const endpoint = locationId 
        ? `/facilities/locations/${locationId}/permits/`
        : '/facilities/permits/';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get permits');
    }
  }

  /**
   * Create permit
   */
  async createPermit(data: any, locationId?: number): Promise<any> {
    try {
      const endpoint = locationId 
        ? `/facilities/locations/${locationId}/permits/`
        : '/facilities/permits/';
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create permit');
    }
  }

  /**
   * Update permit
   */
  async updatePermit(id: number, data: any): Promise<any> {
    try {
      const response = await api.patch(`/facilities/permits/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update permit');
    }
  }

  /**
   * Delete permit
   */
  async deletePermit(id: number): Promise<void> {
    try {
      await api.delete(`/facilities/permits/${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete permit');
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<any> {
    try {
      const response = await api.get('/facilities/stats/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get dashboard stats');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}

export const apiService = new ApiService();