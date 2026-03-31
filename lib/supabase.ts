import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function ensureAnonymousSession() {
  const {
    data: { session: existing },
  } = await supabase.auth.getSession();
  if (existing) return existing;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw new Error(`匿名ログイン失敗: ${error.message}`);
  if (!data.session) throw new Error("匿名ログイン後もセッションが取得できませんでした");
  return data.session;
}

export async function getUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}
