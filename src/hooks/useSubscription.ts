"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { PLANS } from "@/types";
import type { PlanType } from "@/types";

type SubscriptionState = {
  plan: PlanType;
  isPremium: boolean;
  loading: boolean;
  /** 現在の期間終了日（premium の場合のみ） */
  periodEnd: string | null;
  /** 期間末でキャンセル予定か */
  cancelAtPeriodEnd: boolean;
};

/**
 * 現在ログインユーザーのサブスクリプション状態を返すフック。
 *
 * subscriptions テーブルが存在しない場合（マイグレーション未実行）は
 * フリープランとして graceful にフォールバックする。
 */
export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType>("free");
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setPlan("free");
      setLoading(false);
      return;
    }

    try {
      // profiles.is_premium が唯一の真実の源（subscriptions は任意の詳細情報）
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.is_premium) {
        setPlan("premium");

        // 詳細があれば上書き（なくても premium 扱いは維持）
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("plan, status, current_period_end, cancel_at_period_end")
          .eq("user_id", user.id)
          .in("status", ["active", "past_due"])
          .maybeSingle();

        if (sub) {
          setPeriodEnd(sub.current_period_end);
          setCancelAtPeriodEnd(sub.cancel_at_period_end ?? false);
        }
      } else {
        setPlan("free");
      }
    } catch {
      // テーブル未作成等のエラーは無視してフリーにフォールバック
      setPlan("free");
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isPremium = plan === "premium";

  return { plan, isPremium, loading, periodEnd, cancelAtPeriodEnd };
}

/**
 * プランの制限値を返すフック
 */
export function usePlanLimits() {
  const { plan } = useSubscription();
  return useMemo(() => PLANS[plan].limits, [plan]);
}
