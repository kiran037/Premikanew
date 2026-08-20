/**
 * Centralized Authentication Store using Zustand & Supabase Auth
 * Source of truth for customer identity, session persistence, OAuth & Phone OTP handling
 */

import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { customerApi } from '@/api/customer';
import { CustomerProfile } from '@/api/types';

export interface AuthState {
  session: Session | null;
  user: User | null;
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  signInWithApple: () => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  customer: null,
  isAuthenticated: false,
  isGuest: true,
  isLoading: true,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      // 1. Fetch current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (session && session.access_token) {
        // 2. Sync with Premika Customer API Backend
        try {
          const syncRes = await customerApi.syncAuth(session.access_token);
          set({
            session,
            user: session.user,
            customer: syncRes.customer,
            isAuthenticated: true,
            isGuest: false,
            isLoading: false,
          });
        } catch (err: any) {
          console.warn('Customer backend sync failed, attempting getMe:', err);
          try {
            const customer = await customerApi.getMe(session.access_token);
            set({
              session,
              user: session.user,
              customer,
              isAuthenticated: true,
              isGuest: false,
              isLoading: false,
            });
          } catch {
            set({ session: null, user: null, customer: null, isAuthenticated: false, isGuest: true, isLoading: false });
          }
        }
      } else {
        set({ session: null, user: null, customer: null, isAuthenticated: false, isGuest: true, isLoading: false });
      }

      // 3. Set up Auth Listener for state updates
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (newSession && newSession.access_token) {
            try {
              const syncRes = await customerApi.syncAuth(newSession.access_token);
              set({
                session: newSession,
                user: newSession.user,
                customer: syncRes.customer,
                isAuthenticated: true,
                isGuest: false,
              });
            } catch {
              // Fallback
            }
          }
        } else if (event === 'SIGNED_OUT') {
          set({
            session: null,
            user: null,
            customer: null,
            isAuthenticated: false,
            isGuest: true,
          });
        }
      });
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, isGuest: true });
    }
  },

  signInWithPhone: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, message: error.message };
      }

      set({ isLoading: false });
      return { success: true, message: 'OTP sent successfully to your mobile number' };
    } catch (err: any) {
      const msg = err.message || 'Failed to send OTP';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  verifyOtp: async (phone: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      if (error || !data.session) {
        const msg = error?.message || 'Invalid or expired verification code';
        set({ isLoading: false, error: msg });
        return { success: false, message: msg };
      }

      // Sync customer identity with Premika Backend
      const syncRes = await customerApi.syncAuth(data.session.access_token, {
        phone: formattedPhone,
      });

      set({
        session: data.session,
        user: data.session.user,
        customer: syncRes.customer,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
      });

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'OTP verification failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'premika://auth/callback',
        },
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, message: error.message };
      }

      set({ isLoading: false });
      return { success: true, message: 'Redirecting to Google Sign-In...' };
    } catch (err: any) {
      const msg = err.message || 'Google OAuth failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'premika://auth/callback',
        },
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, message: error.message };
      }

      set({ isLoading: false });
      return { success: true, message: 'Redirecting to Apple Sign-In...' };
    } catch (err: any) {
      const msg = err.message || 'Apple Sign-In failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      set({
        session: null,
        user: null,
        customer: null,
        isAuthenticated: false,
        isGuest: true,
        isLoading: false,
      });
    }
  },

  refreshCustomer: async () => {
    const { session } = get();
    if (!session || !session.access_token) return;
    try {
      const customer = await customerApi.getProfile(session.access_token);
      set({ customer });
    } catch (err) {
      console.warn('Refresh customer profile failed:', err);
    }
  },

  clearError: () => set({ error: null }),
}));
