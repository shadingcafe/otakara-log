"use client";

import Link from "next/link";
import { TreasureCard } from "./TreasureCard";

interface Treasure {
  id: string;
  name: string;
  image: string;
  rotation: number;
}

export function CorkBoard({ treasures }: { treasures: Treasure[] }) {
  if (treasures.length === 0) {
    return (
      <div className="cork-board flex min-h-[60vh] flex-col items-center justify-center rounded-2xl p-8">
        <p
          className="mb-2 text-2xl text-[var(--color-text)] opacity-70"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          まだオタカラがありません
        </p>
        <p className="mb-6 text-sm opacity-50" style={{ fontFamily: "var(--font-serif)" }}>
          探査に出かけてオタカラを発見しよう
        </p>
        <Link
          href="/capture"
          className="rounded-full bg-[var(--color-lime)] px-6 py-3 font-bold text-[var(--color-text)] shadow-md transition hover:bg-[var(--color-lime-dark)] hover:text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          探査に出発する
        </Link>
      </div>
    );
  }

  return (
    <div className="cork-board min-h-[60vh] rounded-2xl p-4 sm:p-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {treasures.map((treasure, i) => (
          <TreasureCard key={treasure.id} treasure={treasure} index={i} />
        ))}
      </div>
    </div>
  );
}
