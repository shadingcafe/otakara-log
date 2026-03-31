"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, ensureAnonymousSession } from "@/lib/supabase";
import { CameraCapture } from "@/components/CameraCapture";
import { AnalyzingLoader } from "@/components/AnalyzingLoader";

interface AnalysisResult {
  name: string;
  scientificName: string;
  weight: number;
  energy: number;
  description: string;
  rotation: number;
}

type Step = "capture" | "analyzing" | "confirm" | "saving";

export default function CapturePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("capture");
  const [base64, setBase64] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleCapture = async (imageBase64: string) => {
    setBase64(imageBase64);
    setStep("analyzing");
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: imageBase64,
          mediaType: "image/jpeg",
        }),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "解析に失敗しました");
      }

      setResult(json.data);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析中にエラーが発生しました");
      setStep("capture");
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setStep("saving");

    try {
      const session = await ensureAnonymousSession();

      const { data, error } = await supabase
        .from("treasures")
        .insert({
          user_id: session.user.id,
          name: result.name,
          scientific_name: result.scientificName,
          weight: result.weight,
          energy: result.energy,
          description: result.description,
          image: base64,
          rotation: result.rotation,
          raw_response: result,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      router.push(`/treasure/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
      setStep("confirm");
    }
  };

  const handleRetry = () => {
    setBase64("");
    setResult(null);
    setError("");
    setStep("capture");
  };

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      {/* ヘッダー */}
      <header className="px-4 py-4">
        <div className="mx-auto max-w-lg">
          <Link
            href="/"
            className="text-sm opacity-60 transition hover:opacity-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ← 帰還する
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* 撮影ステップ */}
          {step === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error && (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-center text-sm text-red-700">
                  {error}
                </div>
              )}
              <CameraCapture onCapture={handleCapture} />
            </motion.div>
          )}

          {/* 解析中 */}
          {step === "analyzing" && <AnalyzingLoader />}

          {/* 確認ステップ */}
          {step === "confirm" && result && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.p
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-2 text-3xl"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--color-lime-dark)" }}
                >
                  発見!
                </motion.p>
              </div>

              {/* プレビューカード */}
              <div className="treasure-card push-pin mx-auto max-w-xs rounded-sm">
                <img
                  src={base64}
                  alt={result.name}
                  className="aspect-square w-full rounded-sm object-cover"
                />
                <p
                  className="mt-2 text-center text-lg"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {result.name}
                </p>
              </div>

              {/* ステータス */}
              <div className="data-panel space-y-2 text-sm">
                <p style={{ fontFamily: "var(--font-mono)" }}>
                  <span className="opacity-50">科学名: </span>
                  <span className="italic">{result.scientificName}</span>
                </p>
                <p style={{ fontFamily: "var(--font-mono)" }}>
                  <span className="opacity-50">重量: </span>
                  {result.weight} kg
                </p>
                <p style={{ fontFamily: "var(--font-mono)" }}>
                  <span className="opacity-50">エネルギー: </span>
                  {result.energy} pokos
                </p>
              </div>

              {/* メモ */}
              <div className="rounded-xl border-2 border-[var(--color-cork)] bg-white p-4">
                <p style={{ fontFamily: "var(--font-serif)" }}>
                  {result.description}
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-100 p-3 text-center text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleSave}
                  className="rounded-full bg-[var(--color-lime)] px-6 py-3 font-bold text-[var(--color-text)] shadow-lg transition hover:bg-[var(--color-lime-dark)] hover:text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  記録する
                </button>
                <button
                  onClick={handleRetry}
                  className="rounded-full border-2 border-[var(--color-cork)] px-6 py-3 font-bold text-[var(--color-text)] transition hover:bg-[var(--color-cork)] hover:text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  やり直す
                </button>
              </div>
            </motion.div>
          )}

          {/* 保存中 */}
          {step === "saving" && (
            <motion.div
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex min-h-[60vh] items-center justify-center"
            >
              <p
                className="text-lg opacity-60"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                記録中...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
