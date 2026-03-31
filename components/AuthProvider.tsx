"use client";

import { useEffect } from "react";
import { ensureAnonymousSession } from "@/lib/supabase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureAnonymousSession();
  }, []);

  return <>{children}</>;
}
