"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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

export function TreasureReport({ treasure }: { treasure: Treasure }) {
  const date = new Date(treasure.created_at);
  const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const reportNumber = treasure.id.slice(0, 4).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg space-y-6 p-4"
    >
      {/* ヘッダー */}
      <div className="data-panel text-center">
        <p
          className="text-xs tracking-widest opacity-60"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          HOKOTATE EXPLORATION TEAM
        </p>
        <h1
          className="mt-1 text-lg"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-data)" }}
        >
          公式調査レポート
        </h1>
        <p
          className="text-xs opacity-40"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          REPORT #{reportNumber}
        </p>
      </div>

      {/* 画像 + 名前 */}
      <div className="flex gap-4">
        <div className="w-2/5 flex-shrink-0">
          <div className="treasure-card rounded-sm p-2 pb-6">
            <img
              src={treasure.image}
              alt={treasure.name}
              className="aspect-square w-full rounded-sm object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h2
            className="text-2xl leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {treasure.name}
          </h2>
          <p
            className="mt-1 text-sm italic opacity-60"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {treasure.scientific_name}
          </p>
        </div>
      </div>

      {/* ステータス */}
      <div className="grid grid-cols-2 gap-3">
        <div className="data-panel text-center">
          <p className="text-xs opacity-50" style={{ fontFamily: "var(--font-mono)" }}>
            WEIGHT
          </p>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-data)" }}
          >
            {treasure.weight}
            <span className="ml-1 text-xs opacity-60">kg</span>
          </p>
        </div>
        <div className="data-panel text-center">
          <p className="text-xs opacity-50" style={{ fontFamily: "var(--font-mono)" }}>
            ENERGY
          </p>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-data)" }}
          >
            {treasure.energy}
            <span className="ml-1 text-xs opacity-60">pokos</span>
          </p>
        </div>
      </div>

      {/* 鑑定士メモ */}
      <div className="rounded-xl border-2 border-[var(--color-cork)] bg-[var(--color-bg)] p-4">
        <h3
          className="mb-2 text-sm font-bold opacity-60"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          鑑定士メモ
        </h3>
        <p
          className="text-base leading-relaxed"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {treasure.description}
        </p>
      </div>

      {/* 発見日時 */}
      <p
        className="text-center text-xs opacity-40"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        発見日時: {formattedDate}
      </p>

      {/* 戻るボタン */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-block rounded-full border-2 border-[var(--color-cork)] px-6 py-2 text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--color-cork)] hover:text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          図鑑に戻る
        </Link>
      </div>
    </motion.div>
  );
}
