"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, AuthError } from "@supabase/supabase-js";
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
    // 初回ロード時にセッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, user: session?.user ?? null, loading: false }));
    });

    // セッション変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, user: session?.user ?? null, error: null }));
    });

    return () => subscription.unsubscribe();
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
    const { error } = await supabase.auth.signUp({ email, password });
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
