"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, AuthError, Provider } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import React from "react";

/** 認証状態の型 */
interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

/** 認証コンテキストの型 */
interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: Provider) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** 認証プロバイダー */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    const safeSetState = (updater: (prev: AuthState) => AuthState) => {
      if (mounted) setState(updater);
    };

    // タイムアウト: 2秒以内にセッション取得できなければ未ログインとして扱う
    const timeout = setTimeout(() => {
      safeSetState((prev) => (prev.loading ? { ...prev, loading: false } : prev));
    }, 2000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(timeout);
      safeSetState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        loading: false,
        error: null,
      }));
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout);
        safeSetState((prev) =>
          prev.loading ? { ...prev, user: session?.user ?? null, loading: false } : prev,
        );
      })
      .catch(() => {
        clearTimeout(timeout);
        safeSetState((prev) => (prev.loading ? { ...prev, loading: false } : prev));
      });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState((prev) => ({ ...prev, error }));
    }
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, error: null }));
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setState((prev) => ({ ...prev, error }));
    }
    return { error };
  }, []);

  const signInWithOAuth = useCallback(async (provider: Provider) => {
    setState((prev) => ({ ...prev, error: null }));
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setState((prev) => ({ ...prev, error }));
    }
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState((prev) => ({ ...prev, user: null, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

/** 認証フック */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth は AuthProvider 内で使用してください");
  }
  return context;
}
