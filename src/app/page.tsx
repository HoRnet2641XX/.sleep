"use client";

import { useAuth } from "@/hooks/useAuth";
import { HomeFeed } from "@/components/features/HomeFeed";
import { LandingPage } from "@/components/features/LandingPage";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <HomeFeed />;
}
