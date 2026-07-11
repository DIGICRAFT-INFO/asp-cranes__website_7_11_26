import { create } from 'zustand';

const getStoredAuth = () => {
  if (typeof window === 'undefined') return { user: null, accessToken: null, refreshToken: null };
  try {
    const stored = localStorage.getItem('asp-auth');
    return stored ? JSON.parse(stored) : { user: null, accessToken: null, refreshToken: null };
  } catch { return { user: null, accessToken: null, refreshToken: null }; }
};

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  init: () => {
    const { user, accessToken, refreshToken } = getStoredAuth();
    set({ user, accessToken, refreshToken, isAuthenticated: !!accessToken && !!user, isLoading: false });
  },

  setAuth: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem('asp-auth', JSON.stringify({ user, accessToken, refreshToken }));
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('asp-auth');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  // Called when server returns ACCOUNT_REVOKED
  forceLogout: () => {
    localStorage.removeItem('asp-auth');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  updateUser: (updatedUser) => {
    const current = getStoredAuth();
    const merged = { ...current.user, ...updatedUser };
    localStorage.setItem('asp-auth', JSON.stringify({ ...current, user: merged }));
    set({ user: merged });
  },

  // Check if current user has access to a page
  hasPageAccess: (page) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    return (user.allowedPages || []).includes(page);
  },

  isSuperAdmin: () => {
    const { user } = get();
    return user?.role === 'superadmin';
  },
}));
