"use client";

// Client-side authentication utilities
export const AuthClient = {
  // Get token from localStorage
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  // Set token in localStorage
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },

  // Remove token from localStorage
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  // Get authorization header for API calls
  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Logout user
  logout(): void {
    this.removeToken();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};

// Helper function for authenticated API calls
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = AuthClient.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...AuthClient.getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, logout and redirect
  if (response.status === 401) {
    AuthClient.logout();
    throw new Error('Unauthorized');
  }

  return response;
}
