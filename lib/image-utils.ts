const CONFIG = {
  FISHEYE_STRENGTH: 0.35,
  SATURATION_BOOST: 1.4,
  GRAIN_INTENSITY: 18,
  VIGNETTE_STRENGTH: 0.7,
  SHADOW_TINT_BLUE: 20,
  HIGHLIGHT_TINT_WARM: 15,
};

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

export function applyFisheyeToyCamera(
  sourceCanvas: HTMLCanvasElement
): HTMLCanvasElement {
  const W = sourceCanvas.width;
  const H = sourceCanvas.height;
  const srcCtx = sourceCanvas.getContext("2d")!;
  const srcData = srcCtx.getImageData(0, 0, W, H);

  // --- STEP 1: 魚眼変換 ---
  const fisheyeCanvas = document.createElement("canvas");
  fisheyeCanvas.width = W;
  fisheyeCanvas.height = H;
  const fisheyeCtx = fisheyeCanvas.getContext("2d")!;
  const dstData = fisheyeCtx.createImageData(W, H);
  const dst = dstData.data;
  const src = srcData.data;

  const cx = W / 2,
    cy = H / 2;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = (x - cx) / cx;
      const ny = (y - cy) / cy;
      const r = Math.sqrt(nx * nx + ny * ny);

      if (r > 1.0) {
        const dstIdx = (y * W + x) * 4;
        dst[dstIdx] = dst[dstIdx + 1] = dst[dstIdx + 2] = 0;
        dst[dstIdx + 3] = 255;
        continue;
      }

      const rDistorted =
        r > 0 ? r * (1 + CONFIG.FISHEYE_STRENGTH * r * r) : 0;
      const scale = r > 0 ? rDistorted / r : 1;
      const srcX = Math.round(cx + nx * scale * cx);
      const srcY = Math.round(cy + ny * scale * cy);

      const dstIdx = (y * W + x) * 4;

      if (srcX >= 0 && srcX < W && srcY >= 0 && srcY < H) {
        const srcIdx = (srcY * W + srcX) * 4;
        dst[dstIdx] = src[srcIdx];
        dst[dstIdx + 1] = src[srcIdx + 1];
        dst[dstIdx + 2] = src[srcIdx + 2];
        dst[dstIdx + 3] = src[srcIdx + 3];
      }
    }
  }

  fisheyeCtx.putImageData(dstData, 0, 0);

  // --- STEP 2: カラーグレーディング ---
  const colorData = fisheyeCtx.getImageData(0, 0, W, H);
  const cd = colorData.data;

  for (let i = 0; i < cd.length; i += 4) {
    let r = cd[i],
      g = cd[i + 1],
      b = cd[i + 2];

    // 彩度ブースト
    const avg = (r + g + b) / 3;
    r = clamp(avg + (r - avg) * CONFIG.SATURATION_BOOST);
    g = clamp(avg + (g - avg) * CONFIG.SATURATION_BOOST);
    b = clamp(avg + (b - avg) * CONFIG.SATURATION_BOOST);

    // シャドウに青紫かぶり
    const luminance = (r + g + b) / 3;
    const shadow = Math.max(0, 1 - luminance / 120);
    r = clamp(r - shadow * 8);
    b = clamp(b + shadow * CONFIG.SHADOW_TINT_BLUE);

    // ハイライトに暖色かぶり
    const highlight = Math.max(0, (luminance - 180) / 75);
    r = clamp(r + highlight * CONFIG.HIGHLIGHT_TINT_WARM);
    b = clamp(b - highlight * 10);

    // コントラスト調整
    r = clamp(r * 0.9 + 12);
    g = clamp(g * 0.9 + 12);
    b = clamp(b * 0.9 + 12);

    cd[i] = r;
    cd[i + 1] = g;
    cd[i + 2] = b;
  }

  fisheyeCtx.putImageData(colorData, 0, 0);

  // --- STEP 3: フィルムグレイン ---
  const grainData = fisheyeCtx.getImageData(0, 0, W, H);
  const gd = grainData.data;

  for (let i = 0; i < gd.length; i += 4) {
    const noise = (Math.random() - 0.5) * CONFIG.GRAIN_INTENSITY;
    gd[i] = clamp(gd[i] + noise);
    gd[i + 1] = clamp(gd[i + 1] + noise);
    gd[i + 2] = clamp(gd[i + 2] + noise);
  }

  fisheyeCtx.putImageData(grainData, 0, 0);

  // --- STEP 4: ビネット ---
  const vigRadius = Math.min(W, H) * 0.5;
  const vignette = fisheyeCtx.createRadialGradient(
    cx,
    cy,
    vigRadius * 0.3,
    cx,
    cy,
    vigRadius * 1.1
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.7, "rgba(0,0,0,0.2)");
  vignette.addColorStop(1, `rgba(0,0,0,${CONFIG.VIGNETTE_STRENGTH})`);

  fisheyeCtx.globalCompositeOperation = "multiply";
  fisheyeCtx.fillStyle = vignette;
  fisheyeCtx.fillRect(0, 0, W, H);
  fisheyeCtx.globalCompositeOperation = "source-over";

  return fisheyeCanvas;
}

export async function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const MAX = 800;
      let { width: W, height: H } = img;
      if (W > H && W > MAX) {
        H = Math.round((H * MAX) / W);
        W = MAX;
      } else if (H > MAX) {
        W = Math.round((W * MAX) / H);
        H = MAX;
      }

      const baseCanvas = document.createElement("canvas");
      baseCanvas.width = W;
      baseCanvas.height = H;
      baseCanvas.getContext("2d")!.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);

      const processedCanvas = applyFisheyeToyCamera(baseCanvas);

      let base64 = processedCanvas.toDataURL("image/jpeg", 0.65);

      if (base64.length * 0.75 > 1024 * 1024) {
        base64 = processedCanvas.toDataURL("image/jpeg", 0.4);
      }

      resolve(base64);
    };

    img.onerror = reject;
    img.src = url;
  });
}
