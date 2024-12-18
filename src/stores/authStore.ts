import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserProfile } from '../types';
import { authManager } from '../utils/auth';

// Initial admin user
const ADMIN_USER: User = {
  id: 'admin',
  loginId: 'admin',
  name: '管理者',
  email: 'admin@example.com',
  role: 'admin',
  points: 0,
  status: 'active',
  joinedAt: new Date().toISOString(),
  totalEarned: 0,
};

interface AuthState {
  user: User | null;
  users: Record<string, User>;
  isAuthenticated: boolean;
  customIcon?: string;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User & { profile: UserProfile }>) => void;
  updateIcon: (base64: string) => void;
  updateAvatar: (avatarUrl: string) => void;
  updatePoints: (points: number) => void;
  updateUserPoints: (userId: string, points: number) => void;
  getUser: (userId: string) => User | null;
  registerUser: (userData: { loginId: string; password: string; name: string; email: string }) => User;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: { [ADMIN_USER.id]: ADMIN_USER },
      isAuthenticated: false,
      customIcon: undefined,

      login: (userData) => {
        const updatedUser = {
          ...userData,
          lastLogin: new Date().toISOString(),
        };
        
        set(state => ({
          user: updatedUser,
          users: {
            ...state.users,
            [updatedUser.id]: updatedUser,
          },
          isAuthenticated: true,
        }));
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        set(state => ({
          user: updatedUser,
          users: {
            ...state.users,
            [user.id]: updatedUser,
          },
        }));
      },

      updateIcon: (base64) => {
        set({ customIcon: base64 });
      },

      updateAvatar: (avatarUrl) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = { ...user, avatarUrl };
        set(state => ({
          user: updatedUser,
          users: {
            ...state.users,
            [user.id]: updatedUser,
          },
        }));
      },

      updatePoints: (points) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = {
          ...user,
          points,
          totalEarned: user.totalEarned + Math.max(0, points - user.points),
        };

        set(state => ({
          user: updatedUser,
          users: {
            ...state.users,
            [user.id]: updatedUser,
          },
        }));
      },

      updateUserPoints: (userId, points) => {
        const { users } = get();
        const user = users[userId];
        if (!user) return;

        const updatedUser = {
          ...user,
          points: Math.max(0, points),
          totalEarned: user.totalEarned + Math.max(0, points - user.points),
        };

        set(state => ({
          users: {
            ...state.users,
            [userId]: updatedUser,
          },
          user: state.user?.id === userId ? updatedUser : state.user,
        }));
      },

      getUser: (userId) => get().users[userId] || null,

      registerUser: (userData) => {
        // Add credentials to auth manager
        authManager.addCredential(userData.loginId, userData.password);

        // Create new user
        const newUser = {
          id: userData.loginId,
          loginId: userData.loginId,
          name: userData.name,
          email: userData.email,
          points: 0,
          status: 'active' as const,
          joinedAt: new Date().toISOString(),
          totalEarned: 0,
          role: 'worker' as const,
        };

        set(state => ({
          users: {
            ...state.users,
            [newUser.id]: newUser,
          },
        }));

        return newUser;
      },

      reset: () => {
        authManager.reset();
        set({
          user: null,
          users: { [ADMIN_USER.id]: ADMIN_USER },
          isAuthenticated: false,
          customIcon: undefined,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);