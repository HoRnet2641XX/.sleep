"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { mapReviewRow } from "@/lib/mapReview";
import type { ReviewWithUser } from "@/types";

/** PostgREST の or フィルタに埋め込めない文字を除去 */
function sanitizeSearchQuery(raw: string): string {
  return raw.replace(/[%,()*\\]/g, " ").replace(/\s+/g, " ").trim();
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReviewWithUser[]>([]);
  const [searching, setSearching] = useState(false);

  const safeQuery = sanitizeSearchQuery(query);
  const isActive = safeQuery.length >= 2;

  useEffect(() => {
    if (!isActive) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles(*)")
        .or(`product_name.ilike.%${safeQuery}%,body.ilike.%${safeQuery}%`)
        .order("likes_count", { ascending: false })
        .limit(30);
      setResults(
        (data ?? []).map((row) =>
          mapReviewRow(row as Record<string, unknown>),
        ),
      );
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [safeQuery, isActive]);

  return { query, setQuery, results, setResults, searching, isActive };
}
