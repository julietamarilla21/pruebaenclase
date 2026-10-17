import type { ImageMetrics, Synthesis } from "./types";
import { loadImage } from "./analysis";

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines = 99): number {
  const words = text.split(" ");
  let line = "", lines = 0;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y); y += lh; lines++; line = w;
      if (lines >= maxLines - 1) { line += "…"; break; }
    } else line = test;
  }
  if (line) { ctx.fillText(line, x, y); y += lh; }
  return y;
}

export async function downloadReport(opts: {
  before: string; after: string; mb: ImageMetrics; ma: ImageMetrics;
  synthesis: Synthesis; reflection: string; pseudonym: string;
}) {
  const W = 1240, H = 1754;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;
  // fondo
  ctx.fillStyle = "#fffaf1"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffe9ad"; ctx.beginPath(); ctx.arc(W - 80, 40, 190, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d7f0e5"; ctx.beginPath(); ctx.arc(30, H - 60, 160, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#22304f";
  ctx.font = "800 44px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("🌿 Serena · Mi viaje de percepción", 64, 96);
  ctx.font = "600 21px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#5a6a8a";
  ctx.fillText(`${opts.pseudonym || "Alma anónima"} · ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`, 64, 134);

  // imágenes
  const [ib, ia] = await Promise.all([loadImage(opts.before), loadImage(opts.after)]);
  const iw = 540, ih = 360, y0 = 180;
  const drawBox = (img: HTMLImageElement, x: number, label: string, color: string) => {
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x, y0, iw, ih, 24); ctx.clip();
    ctx.fillStyle = "#fff"; ctx.fillRect(x, y0, iw, ih);
    const s = Math.max(iw / img.naturalWidth, ih / img.naturalHeight);
    ctx.drawImage(img, x + (iw - img.naturalWidth * s) / 2, y0 + (ih - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
    ctx.restore();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x + 16, y0 + 16, 150, 44, 22); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "800 22px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(label, x + 36, y0 + 45);
  };
  drawBox(ib, 64, "ANTES", "#4f7fd6");
  drawBox(ia, 636, "DESPUÉS", "#2f9e6e");

  let y = y0 + ih + 64;
  ctx.fillStyle = "#22304f";
  ctx.font = "800 30px 'Plus Jakarta Sans', sans-serif";
  y = wrap(ctx, opts.synthesis.headline, 64, y, W - 128, 38) + 10;

  // paletas
  const paletteRow = (m: ImageMetrics, x: number, title: string) => {
    ctx.font = "800 18px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = "#5a6a8a";
    ctx.fillText(title, x, y);
    let cx = x;
    const py = y + 14;
    for (const p of m.palette.slice(0, 5)) {
      const w = Math.max(38, (p.pct / 100) * 440);
      ctx.fillStyle = p.hex; ctx.beginPath(); ctx.roundRect(cx, py, w - 5, 40, 10); ctx.fill();
      cx += w;
    }
    cx = x;
    ctx.font = "600 15px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = "#22304f";
    ctx.fillText(m.palette.slice(0, 3).map((p) => `${p.name} ${Math.round(p.pct)}%`).join(" · "), cx, py + 72);
  };
  paletteRow(opts.mb, 64, "PALETA · ANTES");
  paletteRow(opts.ma, 636, "PALETA · DESPUÉS");
  y += 120;

  // dimensiones
  ctx.font = "800 22px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = "#22304f";
  ctx.fillText("Dimensiones de tu percepción", 64, y); y += 16;
  for (const d of opts.synthesis.dimensions) {
    y += 30;
    ctx.font = "700 18px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = "#22304f";
    ctx.fillText(d.label, 64, y);
    const bx = 330, bw = 560;
    ctx.fillStyle = "#f0e6d2"; ctx.beginPath(); ctx.roundRect(bx, y - 17, bw, 14, 7); ctx.fill();
    ctx.fillStyle = "#9db9ec"; ctx.beginPath(); ctx.roundRect(bx, y - 17, (bw * d.before) / 100, 14, 7); ctx.fill();
    ctx.fillStyle = "#f0e6d2"; ctx.beginPath(); ctx.roundRect(bx, y + 2, bw, 14, 7); ctx.fill();
    ctx.fillStyle = "#ffb703"; ctx.beginPath(); ctx.roundRect(bx, y + 2, (bw * d.after) / 100, 14, 7); ctx.fill();
    ctx.font = "800 18px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = d.after >= d.before ? "#2f9e6e" : "#b0722a";
    ctx.fillText(`${d.before} → ${d.after}`, bx + bw + 22, y + 8);
    y += 18;
  }
  y += 26;

  // síntesis
  ctx.font = "800 22px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = "#22304f";
  ctx.fillText("Síntesis de tu cambio perceptivo", 64, y); y += 34;
  ctx.font = "500 19px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = "#3c4a68";
  for (const p of opts.synthesis.paragraphs) { y = wrap(ctx, p, 64, y, W - 128, 28) + 10; }

  if (opts.reflection.trim()) {
    y += 6;
    ctx.fillStyle = "#fff3d6"; ctx.beginPath(); ctx.roundRect(64, y - 28, W - 128, 120, 20); ctx.fill();
    ctx.font = "800 18px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = "#8a6414";
    ctx.fillText("MI REFLEXIÓN", 92, y + 6);
    ctx.font = "italic 600 20px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = "#22304f";
    wrap(ctx, `“${opts.reflection.trim()}”`, 92, y + 38, W - 188, 28, 3);
    y += 140;
  }

  ctx.font = "600 15px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = "#8a97b5";
  ctx.fillText("Serena — Arte, meditación y percepción consciente · Un espejo amable, no un diagnóstico.", 64, H - 48);

  const a = document.createElement("a");
  a.download = "serena-mi-viaje-de-percepcion.png";
  a.href = cv.toDataURL("image/png");
  a.click();
}
