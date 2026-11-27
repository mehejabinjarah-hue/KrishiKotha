import type { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { useAppContext } from './useAppContext';

const DEMO_GUEST_KEY = 'kk_demo_guest_active_v1';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  authPromptOpen: boolean;
  authPromptReason: string | null;
  openAuthPrompt: (reason?: string, onAfterAuth?: () => void) => void;
  closeAuthPrompt: () => void;
  signInAsGuest: () => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ needsEmailConfirm: boolean }>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  runPendingAction: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readDemoGuestFlag(): boolean {
  try {
    return typeof window !== 'undefined' && window.sessionStorage.getItem(DEMO_GUEST_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDemoGuestFlag(active: boolean): void {
  try {
    if (typeof window !== 'undefined') {
      if (active) window.sessionStorage.setItem(DEMO_GUEST_KEY, '1');
      else window.sessionStorage.removeItem(DEMO_GUEST_KEY);
    }
  } catch {
    // ignore storage restriction
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [demoGuestActive, setDemoGuestActive] = useState<boolean>(() =>
    !isSupabaseConfigured ? readDemoGuestFlag() : false
  );
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);
  const pendingCallbackRef = useRef<(() => void) | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  const user = session?.user ?? null;
  const isAuthenticated = isSupabaseConfigured ? Boolean(user) : demoGuestActive;
  const isGuest = isSupabaseConfigured ? Boolean(user?.is_anonymous) : demoGuestActive;

  const openAuthPrompt = useCallback((reason?: string, onAfterAuth?: () => void) => {
    setAuthPromptReason(reason ?? null);
    pendingCallbackRef.current = onAfterAuth ?? null;
    setAuthPromptOpen(true);
  }, []);

  const closeAuthPrompt = useCallback(() => {
    setAuthPromptOpen(false);
    setAuthPromptReason(null);
    pendingCallbackRef.current = null;
  }, []);

  const runPendingAction = useCallback(() => {
    const fn = pendingCallbackRef.current;
    pendingCallbackRef.current = null;
    if (fn) {
      setTimeout(fn, 60);
    }
  }, []);

  const signInAsGuest = useCallback(async (): Promise<boolean> => {
    if (!supabase) {
      setDemoGuestActive(true);
      writeDemoGuestFlag(true);
      setAuthPromptOpen(false);
      showToast('Continuing as Guest — your preview basket is ready!', 'success');
      runPendingAction();
      return true;
    }
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      showToast(error.message || 'Guest sign-in is disabled in Supabase settings.', 'error');
      return false;
    }
    setSession(data.session ?? null);
    setAuthPromptOpen(false);
    showToast('Continuing as Guest — your basket is ready!', 'success');
    runPendingAction();
    return true;
  }, [runPendingAction, showToast]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      showToast('Demo preview active — use "Continue as Guest" now, or connect Supabase + Google OAuth for live sign-in.', 'info');
      return;
    }
    const redirectTo = `${window.location.origin}/auth/callback`;

    if (user?.is_anonymous) {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo },
      });
      if (!error) return;
      showToast('Signing in to your existing Google account...', 'info');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      showToast(error.message || 'Could not start Google sign-in.', 'error');
    }
  }, [showToast, user?.is_anonymous]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!supabase) throw new Error('Supabase is not configured yet. Click "Continue as Guest" to explore Demo Preview.');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      setSession(data.session ?? null);
      setAuthPromptOpen(false);
      runPendingAction();
    },
    [runPendingAction]
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName?: string) => {
      if (!supabase) throw new Error('Supabase is not configured yet. Click "Continue as Guest" to explore Demo Preview.');

      if (user?.is_anonymous) {
        const { data: updData, error } = await supabase.auth.updateUser({
          email,
          password,
          data: fullName ? { full_name: fullName } : undefined,
        });
        if (!error) {
          if (updData.user) {
            const { data: sessionData } = await supabase.auth.getSession();
            setSession(sessionData.session ?? null);
          }
          setAuthPromptOpen(false);
          runPendingAction();
          return { needsEmailConfirm: false };
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: fullName ? { full_name: fullName } : undefined,
        },
      });
      if (error) throw new Error(error.message);
      const needsEmailConfirm = !data.session;
      if (!needsEmailConfirm) {
        setSession(data.session ?? null);
        setAuthPromptOpen(false);
        runPendingAction();
      }
      return { needsEmailConfirm };
    },
    [runPendingAction, user?.is_anonymous]
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase is not configured yet.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setDemoGuestActive(false);
    writeDemoGuestFlag(false);
    setSession(null);
    queryClient.removeQueries({ queryKey: ['cart'] });
    queryClient.removeQueries({ queryKey: ['wishlist'] });
    queryClient.removeQueries({ queryKey: ['orders'] });
    queryClient.removeQueries({ queryKey: ['me'] });
    showToast('Signed out safely.', 'info');
  }, [queryClient, showToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated,
        isGuest,
        authPromptOpen,
        authPromptReason,
        openAuthPrompt,
        closeAuthPrompt,
        signInAsGuest,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOut,
        runPendingAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
