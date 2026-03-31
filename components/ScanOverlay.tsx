"use client";

export function ScanOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* 四隅のブラケット */}
      <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-[var(--color-lime)]" />
      <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-[var(--color-lime)]" />
      <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-[var(--color-lime)]" />
      <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-[var(--color-lime)]" />

      {/* スキャンライン */}
      <div className="absolute left-4 right-4 h-[2px] bg-[var(--color-lime)] opacity-60 scan-line" />

      {/* 中央のターゲット円 */}
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-lime)] opacity-40" />
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-lime)] opacity-60" />
    </div>
  );
}
