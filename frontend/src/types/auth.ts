/**
 * Authentication related TypeScript interfaces
 * Defines types for user data, tokens, and API responses
 */

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'contributor' | 'viewer';
  organization: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  
  // Computed properties
  get name(): string;
  get is_admin(): boolean;
  get is_contributor(): boolean;
  get is_viewer(): boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  totp_token?: string;
}


export interface LoginResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}


export interface ApiError {
  error?: string;
  message?: string;
  [key: string]: any;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  password_confirm: string;
}

export interface EmailVerification {
  token: string;
}