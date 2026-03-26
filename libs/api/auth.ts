import api from './index';

// Authentication Services
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),

  register: (userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    organization_name?: string;
  }) =>
    api.post('/auth/register/', userData),

  registerWithInvitation: (userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    invitation_token: string;
  }) =>
    api.post('/auth/register/invitation/', userData),

  registerWithWorkspaceInvitation: (userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    invitation_token: string;
  }) =>
    api.post('/auth/register/workspace-invitation/', userData),

  getInvitationDetails: (token: string) =>
    api.get(`/workspaces/invitations/${token}/details/`),

  acceptWorkspaceInvitation: (token: string) =>
    api.post('/workspaces/invitations/accept/', { token }),

  logout: (refresh_token?: string) =>
    api.post('/auth/logout/', { refresh_token }),

  refreshToken: (refresh_token: string) =>
    api.post('/auth/refresh-token/', { refresh_token }),

  getProfile: () =>
    api.get('/auth/me/'),

  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    role?: string;
    phone?: string;
    bio?: string;
    avatar?: File;
    last_active_workspace?: string;
  }) => {
    // If we have an avatar file, we must send as FormData
    if (data.avatar instanceof File || Object.keys(data).length > 0) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string | Blob);
        }
      });
      return api.patch('/auth/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.patch('/auth/profile/', data);
  },

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password/', { email }),

  resetPassword: (uid: string, token: string, password: string) =>
    api.post('/auth/reset-password/', { uid, token, password }),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/auth/change-password/', data),

  createOrganization: (name: string) =>
    api.post('/auth/create-organization/', { name }),

  verifyOtp: (email: string, otp: string) =>
    api.post('/auth/verify-otp/', { email, otp }),

  resendOtp: (email: string) =>
    api.post('/auth/resend-otp/', { email }),

  googleLogin: (id_token: string) =>
    api.post('/auth/google/', { id_token }),

  appleLogin: (id_token: string) =>
    api.post('/auth/apple/', { id_token }),
};

// Legacy functions for backward compatibility
export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await authService.login(credentials.email, credentials.password);
    const { token, refresh_token, user } = response.data;

    // Store tokens
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refresh_token);

    return { token, user };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const register = async (data: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
}) => {
  try {
    const response = await authService.register(data);
    // Registration no longer returns tokens - user must verify OTP first
    return { success: true, user: response.data.user, message: response.data.message };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    if (refresh_token) {
      await authService.logout(refresh_token);
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export default authService;
