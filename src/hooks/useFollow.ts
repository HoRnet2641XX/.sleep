"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useFollow(targetUserId: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.id === targetUserId) {
      setLoading(false);
      return;
    }
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle()
      .then(({ data }) => {
        setIsFollowing(!!data);
        setLoading(false);
      });
  }, [user, targetUserId]);

  const toggleFollow = useCallback(async () => {
    if (!user || user.id === targetUserId) return;

    const prev = isFollowing;
    setIsFollowing(!prev);

    if (prev) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);
      if (error) setIsFollowing(prev);
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetUserId });
      if (error) setIsFollowing(prev);
    }
  }, [user, targetUserId, isFollowing]);

  return { isFollowing, loading, toggleFollow };
}

export function useFollowCounts(userId: string) {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId),
    ]).then(([followers, following]) => {
      setFollowersCount(followers.count ?? 0);
      setFollowingCount(following.count ?? 0);
      setLoading(false);
    });
  }, [userId]);

  return { followersCount, followingCount, loading };
}
