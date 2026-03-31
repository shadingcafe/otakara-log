"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TreasureReport } from "@/components/TreasureReport";

interface Treasure {
  id: string;
  name: string;
  scientific_name: string;
  weight: number;
  energy: number;
  description: string;
  image: string;
  created_at: string;
}

export default function TreasureDetailPage() {
  const params = useParams();
  const [treasure, setTreasure] = useState<Treasure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from("treasures")
          .select("*")
          .eq("id", params.id)
          .single();
        if (error || !data) {
          setError("オタカラが見つかりませんでした");
        } else {
          setTreasure(data);
        }
      } catch {
        setError("データの取得に失敗しました");
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)]">
        <p className="text-sm opacity-50" style={{ fontFamily: "var(--font-mono)" }}>
          レポートを読み込み中...
        </p>
      </div>
    );
  }

  if (error || !treasure) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--color-bg)]">
        <p className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>
          {error || "オタカラが見つかりませんでした"}
        </p>
        <a
          href="/"
          className="text-sm underline opacity-60"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          図鑑に戻る
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] py-4">
      <TreasureReport treasure={treasure} />
    </div>
  );
}
