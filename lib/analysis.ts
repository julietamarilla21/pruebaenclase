import type { ImageMetrics, PaletteItem } from "./types";

type Family = PaletteItem["family"];

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function nameColor(r: number, g: number, b: number): { name: string; family: Family; emotion: string } {
  const { h, s, l } = rgbToHsl(r, g, b);
  if (l < 16) return { name: "Negro profundo", family: "oscuro", emotion: "contención, peso, lo no dicho" };
  if (s < 12 && l > 82) return { name: "Blanco cálido", family: "luminoso", emotion: "espacio, pausa, posibilidad" };
  if (s < 14) return { name: "Gris sereno", family: "neutro", emotion: "neutralidad, espera, distancia" };
  if (h < 14 || h >= 345) return l > 68 ? { name: "Rosa suave", family: "calido", emotion: "ternura, cuidado, apertura afectiva" } : { name: "Rojo vital", family: "calido", emotion: "intensidad, urgencia, energía vital" };
  if (h < 42) return { name: "Naranja cálido", family: "calido", emotion: "calidez, impulso creativo, encuentro" };
  if (h < 68) return { name: "Amarillo luminoso", family: "luminoso", emotion: "optimismo, claridad, sol interior" };
  if (h < 95) return { name: "Verde lima", family: "natural", emotion: "renovación, brote, comienzo" };
  if (h < 160) return { name: "Verde natural", family: "natural", emotion: "equilibrio, raíz, crecimiento" };
  if (h < 195) return { name: "Verde menta", family: "natural", emotion: "frescura, alivio, respiro" };
  if (h < 232) return { name: "Azul sereno", family: "frio", emotion: "calma, confianza, profundidad" };
  if (h < 268) return { name: "Azul índigo", family: "frio", emotion: "introspección, noche interior" };
  if (h < 310) return { name: "Violeta contemplativo", family: "frio", emotion: "imaginación, espiritualidad, tránsito" };
  return { name: "Magenta expresivo", family: "calido", emotion: "expresión, juego, emoción visible" };
}

const hex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export async function analyzeImage(src: string): Promise<ImageMetrics> {
  const img = await loadImage(src);
  const W = 180, H = 120;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H).data;

  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  let painted = 0, total = W * H;
  let sumB = 0, sumS = 0, sumWarm = 0, dark = 0, pastel = 0, vivid = 0;
  let warm = 0, cool = 0, natural = 0;
  let edges = 0, edgeSamples = 0;
  const lum = new Float32Array(total);

  for (let i = 0; i < total; i++) {
    const p = i * 4;
    const r = data[p], g = data[p + 1], b = data[p + 2], a = data[p + 3];
    lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    if ((i % W) < W - 1) { edgeSamples++; }
    const isWhite = a < 20 || (r >= 246 && g >= 246 && b >= 243);
    if (isWhite) continue;
    painted++;
    const { h, s, l } = rgbToHsl(r, g, b);
    sumB += l; sumS += s;
    // warmness: red/orange/yellow hues
    const warmness = (h <= 70 || h >= 330) ? 1 : h <= 170 ? 0.45 : 0.12;
    sumWarm += warmness;
    if (l < 32) dark++;
    if (s < 55 && l > 55) pastel++;
    if (s > 62) vivid++;
    if (h <= 75 || h >= 330) warm++;
    else if (h >= 170 && h <= 315) cool++;
    if (h > 70 && h < 195) natural++;

    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const ex = buckets.get(key);
    if (ex) { ex.r += r; ex.g += g; ex.b += b; ex.count++; }
    else buckets.set(key, { r, g, b, count: 1 });
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W - 1; x++) {
      const i = y * W + x;
      if (Math.abs(lum[i] - lum[i + 1]) > 28) edges++;
    }
  }

  const denom = Math.max(1, painted);
  const palette: PaletteItem[] = Array.from(buckets.values())
    .sort((x, y) => y.count - x.count)
    .slice(0, 6)
    .map((bk) => {
      const r = bk.r / bk.count, g = bk.g / bk.count, b = bk.b / bk.count;
      const info = nameColor(r, g, b);
      return { name: info.name, hex: hex(r, g, b), pct: Math.round((bk.count / denom) * 1000) / 10, family: info.family, emotion: info.emotion };
    })
    .filter((p) => p.pct >= 1);

  const coverage = (painted / total) * 100;
  return {
    palette,
    coverage: Math.round(coverage * 10) / 10,
    openness: Math.round((100 - coverage) * 10) / 10,
    brightness: Math.round(sumB / denom),
    saturation: Math.round(sumS / denom),
    warmth: Math.round((sumWarm / denom) * 100),
    darkness: Math.round((dark / denom) * 100),
    pastel: Math.round((pastel / denom) * 100),
    vivid: Math.round((vivid / denom) * 100),
    colorDiversity: Math.min(100, Math.round(buckets.size * 4.2)),
    edgeDensity: Math.min(100, Math.round((edges / Math.max(1, edgeSamples)) * 100 * 2.6)),
    warmPct: Math.round((warm / denom) * 100),
    coolPct: Math.round((cool / denom) * 100),
    naturalPct: Math.round((natural / denom) * 100),
    dominant: palette[0]?.name ?? "Blanco cálido",
  };
}

export async function compressImage(src: string, maxW = 720): Promise<string> {
  try {
    const img = await loadImage(src);
    const scale = Math.min(1, maxW / img.naturalWidth);
    if (scale === 1 && src.length < 400_000) return src;
    const cv = document.createElement("canvas");
    cv.width = Math.round(img.naturalWidth * scale);
    cv.height = Math.round(img.naturalHeight * scale);
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL("image/jpeg", 0.82);
  } catch {
    return src;
  }
}
