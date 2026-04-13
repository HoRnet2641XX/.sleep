"use client";

import { useState, useEffect } from "react";

/** 現在時刻（時）を1分間隔で更新するフック */
export function useCurrentHour() {
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const interval = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(interval);
  }, []);
  return hour;
}
