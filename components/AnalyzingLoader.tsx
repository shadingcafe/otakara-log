"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ANALYSIS_STEPS = [
  "物体を探知中...",
  "素材を分析中...",
  "星間データベースと照合中...",
  "オタカラ名を決定中...",
  "報告書を作成中...",
];

export function AnalyzingLoader() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="data-panel mx-4 w-full max-w-sm space-y-6 text-center">
        {/* ドット行進 */}
        <div className="flex justify-center gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-[var(--color-lime)]"
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.12,
              }}
            />
          ))}
        </div>

        {/* ステップテキスト */}
        <motion.p
          key={stepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-lg"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-data)" }}
        >
          {ANALYSIS_STEPS[stepIndex]}
        </motion.p>

        {/* プログレスバー */}
        <div className="mx-auto h-1 w-full overflow-hidden rounded-full bg-[var(--color-panel)] ring-1 ring-[var(--color-data)]/20">
          <motion.div
            className="h-full rounded-full bg-[var(--color-lime)]"
            initial={{ width: "5%" }}
            animate={{ width: "90%" }}
            transition={{ duration: 10, ease: "easeOut" }}
          />
        </div>

        <p
          className="text-xs opacity-50"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          HOKOTATE EXPLORATION TEAM
        </p>
      </div>
    </div>
  );
}
