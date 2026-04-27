"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type NotificationType = "like" | "comment" | "follow" | "match" | "system";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  actorId: string | null;
  actorNickname?: string | null;
  actorAvatarUrl?: string | null;
  targetType: string | null;
  targetId: string | null;
  body: string | null;
  readAt: string | null;
  createdAt: string;
};

export function useNotifications(userId: string | undefined) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data } = await supabase
      .from("notifications")
      .select(
        "id, type, actor_id, target_type, target_id, body, read_at, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    const rows = data ?? [];
    /* actor のニックネーム/アバターを join */
    const actorIds = Array.from(
      new Set(rows.map((r) => r.actor_id as string | null).filter(Boolean) as string[]),
    );
    let actorMap: Record<string, { nickname: string | null; avatarUrl: string | null }> = {};
    if (actorIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url")
        .in("id", actorIds);
      actorMap = Object.fromEntries(
        (profs ?? []).map((p) => [
          p.id as string,
          { nickname: p.nickname as string | null, avatarUrl: p.avatar_url as string | null },
        ]),
      );
    }

    const mapped: NotificationItem[] = rows.map((r) => {
      const aid = r.actor_id as string | null;
      const actor = aid ? actorMap[aid] : null;
      return {
        id: r.id as string,
        type: r.type as NotificationType,
        actorId: aid,
        actorNickname: actor?.nickname ?? null,
        actorAvatarUrl: actor?.avatarUrl ?? null,
        targetType: r.target_type as string | null,
        targetId: r.target_id as string | null,
        body: r.body as string | null,
        readAt: r.read_at as string | null,
        createdAt: r.created_at as string,
      };
    });

    setItems(mapped);
    setUnreadCount(mapped.filter((m) => !m.readAt).length);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    setItems((prev) => prev.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);
  }, [userId]);

  return { items, unreadCount, loading, refresh: fetchNotifications, markAllRead };
}
