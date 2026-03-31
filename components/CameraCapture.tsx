"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { processImage, applyFisheyeToyCamera } from "@/lib/image-utils";
import { ScanOverlay } from "./ScanOverlay";

export function CameraCapture({
  onCapture,
}: {
  onCapture: (base64: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animFrameRef = useRef<number>(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [processing, setProcessing] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setCameraError(true);
    }
  }, []);

  // リアルタイム魚眼プレビュー
  useEffect(() => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    if (!video || !canvas) return;

    let lastTime = 0;
    const INTERVAL = 1000 / 20; // 20fps

    const renderFrame = (timestamp: number) => {
      animFrameRef.current = requestAnimationFrame(renderFrame);
      if (timestamp - lastTime < INTERVAL) return;
      lastTime = timestamp;

      if (video.readyState < 2 || video.videoWidth === 0) return;

      const size = Math.min(video.videoWidth, video.videoHeight);
      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;

      const PREVIEW_SIZE = 400;
      canvas.width = PREVIEW_SIZE;
      canvas.height = PREVIEW_SIZE;

      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = PREVIEW_SIZE;
      tmpCanvas.height = PREVIEW_SIZE;
      tmpCanvas.getContext("2d")!.drawImage(video, sx, sy, size, size, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

      const processed = applyFisheyeToyCamera(tmpCanvas);
      canvas.getContext("2d")!.drawImage(processed, 0, 0);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureFromVideo = async () => {
    if (!videoRef.current || processing) return;
    setProcessing(true);

    try {
      const video = videoRef.current;
      const size = Math.min(video.videoWidth || 640, video.videoHeight || 480);
      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;

      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = size;
      tmpCanvas.height = size;
      tmpCanvas.getContext("2d")!.drawImage(video, sx, sy, size, size, 0, 0, size, size);

      const blob = await new Promise<Blob>((resolve, reject) => {
        tmpCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("キャプチャに失敗しました"))),
          "image/jpeg",
          0.9
        );
      });

      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      const base64 = await processImage(file);
      stream?.getTracks().forEach((t) => t.stop());
      onCapture(base64);
    } catch (err) {
      console.error("Capture error:", err);
      setProcessing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || processing) return;
    setProcessing(true);

    try {
      const base64 = await processImage(file);
      stream?.getTracks().forEach((t) => t.stop());
      onCapture(base64);
    } catch (err) {
      console.error("File select error:", err);
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* カメラプレビュー */}
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-black">
        {/* 非表示の video 要素（ストリーム取得用） */}
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />

        {!cameraError ? (
          <div className="relative aspect-square overflow-hidden">
            <canvas
              ref={previewCanvasRef}
              className="h-full w-full object-cover"
            />
            <ScanOverlay />
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center bg-gray-900 p-8 text-center text-gray-400">
            <div>
              <p className="mb-2 text-lg">カメラを使用できません</p>
              <p className="text-sm">下の「画像を選ぶ」から写真を選んでください</p>
            </div>
          </div>
        )}
      </div>

      {/* ボタン */}
      <div className="flex gap-4">
        {!cameraError && (
          <button
            onClick={captureFromVideo}
            disabled={processing}
            className="flex items-center gap-2 rounded-full bg-[var(--color-lime)] px-6 py-3 font-bold text-[var(--color-text)] shadow-lg transition hover:bg-[var(--color-lime-dark)] hover:text-white disabled:opacity-50"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            📷 探査する
          </button>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="flex items-center gap-2 rounded-full border-2 border-[var(--color-cork)] bg-white px-6 py-3 font-bold text-[var(--color-text)] shadow transition hover:bg-[var(--color-cork)] hover:text-white disabled:opacity-50"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          🖼 画像を選ぶ
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {processing && (
        <p className="text-sm opacity-60" style={{ fontFamily: "var(--font-serif)" }}>
          画像を加工中...
        </p>
      )}
    </div>
  );
}
