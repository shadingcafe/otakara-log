"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CorkBoard } from "@/components/CorkBoard";

interface Treasure {
  id: string;
  name: string;
  image: string;
  rotation: number;
}

export default function HomePage() {
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("treasures")
        .select("id, name, image, rotation")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (data) setTreasures(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-dvh">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg)] px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1
            className="text-xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            🌿 オタカラ記録帳
          </h1>
          <Link
            href="/capture"
            className="rounded-full bg-[var(--color-lime)] px-4 py-2 text-sm font-bold text-[var(--color-text)] shadow transition hover:bg-[var(--color-lime-dark)] hover:text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            + 新たな探査へ
          </Link>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="mx-auto max-w-4xl p-4">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <p
              className="text-sm opacity-50"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              データを読み込み中...
            </p>
          </div>
        ) : (
          <CorkBoard treasures={treasures} />
        )}
      </main>
    </div>
  );
}
