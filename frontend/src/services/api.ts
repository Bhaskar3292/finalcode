/**
 * API service for handling HTTP requests to Django backend
 * Includes authentication, error handling, and token management
 */

import { 
  LoginRequest, 
  LoginResponse, 
  User,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerification,
  ApiError
} from '../types/auth';

const API_BASE_URL = 'http://localhost:8000/';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get authentication headers with JWT token
   */
  private getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

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
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    let response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    // If unauthorized, try to refresh token and retry
    if (response.status === 401 && this.getRefreshToken()) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Request failed');
    }

    return response.json();
  }

  /**
   * User registration
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Registration failed');
      }

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * User login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          totp_token: data.totp_token
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Login failed');
      }

      // Store tokens and user data
      this.storeTokens(responseData.tokens.access, responseData.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(responseData.user));

      return responseData;
    } catch (error) {
      throw error;
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
    return this.makeRequest<{ message: string }>('/auth/password/change/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Setup Two-Factor Authentication
   */
  async setup2FA(): Promise<{
    secret: string;
    qr_code: string;
    backup_codes: string[];
  }> {
    return this.makeRequest<{
      secret: string;
      qr_code: string;
      backup_codes: string[];
    }>('/auth/2fa/setup/');
  }

  /**
   * Enable Two-Factor Authentication
   */
  async enable2FA(totp_token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/auth/2fa/setup/', {
      method: 'POST',
      body: JSON.stringify({ totp_token }),
    });
  }

  /**
   * Disable Two-Factor Authentication
   */
  async disable2FA(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/auth/2fa/disable/', {
      method: 'POST',
    });
  }

  /**
   * Unlock user account (admin only)
   */
  async unlockUserAccount(userId: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/auth/users/${userId}/unlock/`, {
      method: 'POST',
    });
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        await this.makeRequest('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
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
    return this.makeRequest<User>('/auth/profile/');
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/auth/password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Password reset request failed');
    }

    return responseData;
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/auth/password-reset/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Password reset failed');
    }

    return responseData;
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: EmailVerification): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/auth/verify-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Email verification failed');
    }

    return responseData;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
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
    return this.makeRequest<any[]>('/facilities/locations/');
  }

  /**
   * Create a new location
   */
  async createLocation(data: any): Promise<any> {
    return this.makeRequest<any>('/facilities/locations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get location details
   */
  async getLocation(id: number): Promise<any> {
    return this.makeRequest<any>(`/facilities/locations/${id}/`);
  }

  /**
   * Update location
   */
  async updateLocation(id: number, data: any): Promise<any> {
    return this.makeRequest<any>(`/facilities/locations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete location
   */
  async deleteLocation(id: number): Promise<void> {
    return this.makeRequest<void>(`/facilities/locations/${id}/`, {
      method: 'DELETE',
    });
  }

  /**
   * Get location dashboard
   */
  async getLocationDashboard(locationId: number): Promise<any> {
    return this.makeRequest<any>(`/facilities/locations/${locationId}/dashboard/`);
  }

  /**
   * Update dashboard section data
   */
  async updateDashboardSection(sectionId: number, data: any): Promise<any> {
    return this.makeRequest<any>(`/facilities/dashboard-section-data/${sectionId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ data }),
    });
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(): Promise<any> {
    return this.makeRequest<any>('/permissions/user/permissions/');
  }

  /**
   * Check specific permissions
   */
  async checkPermissions(permissionCodes: string[]): Promise<any> {
    const params = new URLSearchParams();
    permissionCodes.forEach(code => params.append('permission_codes', code));
    return this.makeRequest<any>(`/permissions/user/check/?${params.toString()}`);
  }

  /**
   * Get permissions matrix (admin only)
   */
  async getPermissionsMatrix(): Promise<any> {
    return this.makeRequest<any>('/permissions/roles/permissions/matrix/');
  }

  /**
   * Update role permissions (admin only)
   */
  async updateRolePermissions(role: string, permissions: any[]): Promise<any> {
    return this.makeRequest<any>('/permissions/roles/permissions/bulk-update/', {
      method: 'POST',
      body: JSON.stringify({ role, permissions }),
    });
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<any[]> {
    return this.makeRequest<any[]>('/auth/users/');
  }

  /**
   * Create user (admin only)
   */
  async createUser(data: any): Promise<any> {
    return this.makeRequest<any>('/auth/users/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update user (admin only)
   */
  async updateUser(id: number, data: any): Promise<any> {
    return this.makeRequest<any>(`/auth/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: number): Promise<void> {
    return this.makeRequest<void>(`/auth/users/${id}/`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();