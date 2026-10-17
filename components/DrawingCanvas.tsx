"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Brush, Droplets, Eraser, Undo2, Trash2, Upload, Sparkles, Circle, Minus } from "lucide-react";
import type { StrokeMeta } from "@/lib/types";

const PALETTE = [
  { hex: "#22304f", name: "Tinta serena" },
  { hex: "#4f7fd6", name: "Azul sereno" },
  { hex: "#7fd1c0", name: "Menta" },
  { hex: "#5da271", name: "Verde bosque" },
  { hex: "#ffb703", name: "Sol suave" },
  { hex: "#ff8fa3", name: "Rosa ternura" },
  { hex: "#ff7b54", name: "Coral cálido" },
  { hex: "#9b7ede", name: "Violeta calma" },
  { hex: "#8a5a44", name: "Tierra" },
  { hex: "#e63946", name: "Rojo vital" },
  { hex: "#6c757d", name: "Gris niebla" },
  { hex: "#111111", name: "Negro" },
];

type Tool = "pincel" | "acuarela" | "borrador" | "linea" | "circulo";

export default function DrawingCanvas({
  variant,
  onChange,
}: {
  variant: "antes" | "despues";
  onChange: (dataUrl: string | null, meta: StrokeMeta) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tool, setTool] = useState<Tool>("pincel");
  const [color, setColor] = useState(variant === "antes" ? "#22304f" : "#ff8fa3");
  const [size, setSize] = useState(9);
  const [hasContent, setHasContent] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const snapshot = useRef<string | null>(null);
  const undoStack = useRef<string[]>([]);
  const meta = useRef({ strokeCount: 0, totalLength: 0, sharpTurns: 0, smoothTurns: 0, colors: new Set<string>() });
  const prevAngle = useRef<number | null>(null);
  const sourceRef = useRef<"dibujo" | "carga" | "ejemplo" | "mixto">("dibujo");

  const W = 960, H = 620;

  const emit = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const m = meta.current;
    onChange(cv.toDataURL("image/png"), {
      strokeCount: m.strokeCount,
      totalLength: Math.round(m.totalLength),
      sharpTurns: m.sharpTurns,
      smoothTurns: m.smoothTurns,
      colorsUsed: Array.from(m.colors),
      source: sourceRef.current,
    });
  }, [onChange]);

  // init white canvas
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    // faint warm paper tint corners
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(6, 6, W - 12, H - 12);
    undoStack.current = [cv.toDataURL()];
  }, []);

  const pos = (e: React.PointerEvent) => {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const pushUndo = () => {
    const cv = canvasRef.current!;
    undoStack.current.push(cv.toDataURL());
    if (undoStack.current.length > 30) undoStack.current.shift();
  };

  const applyStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "borrador") { ctx.strokeStyle = "#ffffff"; ctx.globalAlpha = 1; ctx.lineWidth = size * 2.4; }
    else if (tool === "acuarela") { ctx.strokeStyle = color; ctx.globalAlpha = 0.32; ctx.lineWidth = size * 2.1; }
    else { ctx.strokeStyle = color; ctx.globalAlpha = 0.95; ctx.lineWidth = size; }
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const cv = canvasRef.current!;
    snapshot.current = cv.toDataURL();
    drawing.current = true;
    const p = pos(e);
    last.current = p;
    startPoint.current = p;
    prevAngle.current = null;
    meta.current.strokeCount++;
    if (tool !== "borrador") meta.current.colors.add(color);
    if (tool === "pincel" || tool === "acuarela" || tool === "borrador") {
      const ctx = cv.getContext("2d")!;
      applyStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 0.1, p.y + 0.1);
      ctx.stroke();
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const p = pos(e);
    const dx = p.x - last.current.x, dy = p.y - last.current.y;
    const dist = Math.hypot(dx, dy);
    if (tool === "linea" || tool === "circulo") {
      // restore snapshot then preview shape
      if (snapshot.current) {
        const img = new Image();
        img.src = snapshot.current;
        img.onload = () => {
          ctx.globalAlpha = 1;
          ctx.drawImage(img, 0, 0);
          applyStyle(ctx);
          ctx.beginPath();
          if (tool === "linea") { ctx.moveTo(startPoint.current!.x, startPoint.current!.y); ctx.lineTo(p.x, p.y); }
          else {
            const r = Math.hypot(p.x - startPoint.current!.x, p.y - startPoint.current!.y);
            ctx.arc(startPoint.current!.x, startPoint.current!.y, r, 0, Math.PI * 2);
          }
          ctx.stroke();
        };
      }
      last.current = p;
      return;
    }
    if (dist < 1.5) return;
    meta.current.totalLength += dist;
    const angle = Math.atan2(dy, dx);
    if (prevAngle.current !== null) {
      let diff = Math.abs(angle - prevAngle.current);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff > 1.05) meta.current.sharpTurns++;
      else if (diff > 0.14) meta.current.smoothTurns++;
    }
    prevAngle.current = angle;
    applyStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    // quadratic smoothing via midpoint feel
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const cv = canvasRef.current!;
    cv.getContext("2d")!.globalAlpha = 1;
    pushUndo();
    setHasContent(true);
    emit();
  };

  const undo = () => {
    if (undoStack.current.length <= 1) return;
    undoStack.current.pop();
    const prev = undoStack.current[undoStack.current.length - 1];
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const img = new Image();
    img.src = prev;
    img.onload = () => { ctx.drawImage(img, 0, 0); emit(); };
    meta.current.strokeCount = Math.max(0, meta.current.strokeCount - 1);
  };

  const clear = () => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    meta.current = { strokeCount: 0, totalLength: 0, sharpTurns: 0, smoothTurns: 0, colors: new Set() };
    sourceRef.current = "dibujo";
    setUploaded(false);
    setHasContent(false);
    undoStack.current = [cv.toDataURL()];
    onChange(null, null);
  };

  const onUpload = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const cv = canvasRef.current!;
        const ctx = cv.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        sourceRef.current = hasContent ? "mixto" : "carga";
        setUploaded(true);
        setHasContent(true);
        pushUndo();
        emit();
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(f);
  };

  /** Dibujo expresivo de ejemplo para probar el flujo en segundos */
  const example = () => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    meta.current = { strokeCount: 0, totalLength: 0, sharpTurns: 0, smoothTurns: 0, colors: new Set() };
    let seed = variant === "antes" ? 42 : 137;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

    if (variant === "antes") {
      // cielo gris-azulado denso
      ctx.fillStyle = "#dfe6f2"; ctx.fillRect(0, 0, W, H * 0.62);
      ctx.fillStyle = "#c9cfd9"; ctx.fillRect(0, H * 0.62, W, H * 0.38);
      const cols = ["#22304f", "#111827", "#4b5563", "#3b4a6b", "#6b7280"];
      // trazos angulares, "montañas / ciudad" tensas
      for (let s = 0; s < 26; s++) {
        ctx.strokeStyle = cols[s % cols.length];
        ctx.lineWidth = 5 + rnd() * 10;
        ctx.lineJoin = "miter";
        ctx.beginPath();
        let x = rnd() * W * 0.8, y = H * 0.25 + rnd() * H * 0.5;
        ctx.moveTo(x, y);
        for (let i = 0; i < 5; i++) { x += (rnd() - 0.25) * 170; y += (rnd() - 0.5) * 150; ctx.lineTo(x, y); meta.current.sharpTurns += 3; }
        ctx.stroke();
        meta.current.strokeCount++;
        meta.current.colors.add(ctx.strokeStyle as string);
      }
      // lluvia diagonal
      ctx.strokeStyle = "#5b7bb8"; ctx.lineWidth = 3;
      for (let i = 0; i < 60; i++) { const x = rnd() * W, y = rnd() * H * 0.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 16, y + 42); ctx.stroke(); }
      meta.current.smoothTurns = 6;
      meta.current.sharpTurns = 58;
    } else {
      // prado al amanecer: cielo pastel, sol, colinas curvas, flores
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#ffe9c9"); sky.addColorStop(0.45, "#fff3d6"); sky.addColorStop(1, "#eaf6ec");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      // sol
      ctx.fillStyle = "#ffc84d"; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.24, 62, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffe29a"; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.24, 86, 0, Math.PI * 2); ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
      // colinas orgánicas
      const hills: [string, number][] = [["#bfe6c8", 0.58], ["#8fd0b8", 0.68], ["#6fbf97", 0.8]];
      hills.forEach(([c, base], hi) => {
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, H);
        ctx.lineTo(0, H * base);
        for (let x = 0; x <= W; x += 40) ctx.lineTo(x, H * base + Math.sin(x / 140 + hi * 2) * 34);
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
        meta.current.colors.add(c);
      });
      // río curvo
      ctx.strokeStyle = "#8ecae6"; ctx.lineWidth = 26; ctx.lineCap = "round"; ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.moveTo(W * 0.1, H);
      ctx.bezierCurveTo(W * 0.3, H * 0.72, W * 0.45, H * 0.92, W * 0.62, H * 0.66);
      ctx.stroke(); ctx.globalAlpha = 1;
      // flores y pájaros suaves
      const fcols = ["#ff8fa3", "#ffb703", "#ff7b54", "#c77dff", "#ffffff"];
      for (let i = 0; i < 42; i++) {
        ctx.fillStyle = fcols[i % fcols.length];
        const x = rnd() * W, y = H * 0.66 + rnd() * H * 0.3;
        ctx.beginPath(); ctx.arc(x, y, 6 + rnd() * 7, 0, Math.PI * 2); ctx.fill();
        meta.current.colors.add(ctx.fillStyle as string);
      }
      ctx.strokeStyle = "#5a6a8a"; ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) {
        const x = W * 0.16 + i * 62, y = H * 0.16 + (i % 2) * 22;
        ctx.beginPath(); ctx.arc(x - 13, y, 13, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 13, y, 13, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      }
      meta.current.strokeCount = 18;
      meta.current.smoothTurns = 64;
      meta.current.sharpTurns = 7;
      meta.current.colors.add("#ffc84d"); meta.current.colors.add("#8ecae6");
    }
    sourceRef.current = "ejemplo";
    setHasContent(true);
    setUploaded(false);
    pushUndo();
    emit();
  };

  const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
    { id: "pincel", label: "Pincel", icon: <Brush size={17} /> },
    { id: "acuarela", label: "Acuarela", icon: <Droplets size={17} /> },
    { id: "linea", label: "Línea", icon: <Minus size={17} /> },
    { id: "circulo", label: "Círculo", icon: <Circle size={17} /> },
    { id: "borrador", label: "Borrador", icon: <Eraser size={17} /> },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#f0e6d2]">
          {tools.map((t) => (
            <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-bold transition ${tool === t.id ? "bg-[#22304f] text-white" : "text-[#5a6a8a] hover:bg-[#fff6e6]"}`}>
              {t.icon}<span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-[#f0e6d2]">
          <span className="text-[12px] font-bold text-[#5a6a8a]">Grosor</span>
          <input type="range" min={2} max={34} value={size} onChange={(e) => setSize(+e.target.value)} className="w-24 sm:w-32" />
          <span className="inline-block rounded-full bg-[#22304f] shrink-0" style={{ width: Math.min(22, 4 + size / 2), height: Math.min(22, 4 + size / 2), background: tool === "borrador" ? "#e5e7eb" : color }} />
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={undo} className="flex items-center gap-1.5 bg-white border border-[#f0e6d2] shadow-sm px-3.5 py-2 rounded-full text-[13px] font-bold text-[#22304f] hover:bg-[#fff6e6]"><Undo2 size={15} /> Deshacer</button>
          <button onClick={clear} className="flex items-center gap-1.5 bg-white border border-[#f0e6d2] shadow-sm px-3.5 py-2 rounded-full text-[13px] font-bold text-[#22304f] hover:bg-[#ffe7dc]"><Trash2 size={15} /> Limpiar</button>
        </div>
      </div>

      {/* Palette */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {PALETTE.map((c) => (
          <button key={c.hex} title={c.name} onClick={() => { setColor(c.hex); if (tool === "borrador") setTool("pincel"); }}
            className={`w-9 h-9 rounded-full transition-transform hover:scale-110 ${color === c.hex && tool !== "borrador" ? "ring-[3px] ring-offset-2 ring-[#22304f] scale-110" : "ring-1 ring-black/10"}`}
            style={{ background: c.hex }} />
        ))}
        <label className="flex items-center gap-2 bg-white border border-[#f0e6d2] rounded-full pl-1.5 pr-3 py-1.5 cursor-pointer shadow-sm" title="Color personalizado">
          <input type="color" value={color} onChange={(e) => { setColor(e.target.value); if (tool === "borrador") setTool("pincel"); }} className="w-7 h-7 rounded-full overflow-hidden cursor-pointer border-0 p-0 bg-transparent" />
          <span className="text-[12px] font-bold text-[#5a6a8a]">Tu color</span>
        </label>
        <span className="text-[12.5px] text-[#8a97b5] font-semibold hidden md:inline">{PALETTE.find((p) => p.hex === color)?.name ?? "Color personalizado"}</span>
      </div>

      {/* Canvas */}
      <div ref={wrapRef} className="relative rounded-[26px] overflow-hidden border-[6px] border-white shadow-[0_18px_45px_rgba(34,48,79,.14)] bg-white">
        <canvas ref={canvasRef} width={W} height={H} className="drawing w-full block cursor-crosshair"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} />
        {!hasContent && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none px-6 text-center">
            <div>
              <div className="text-4xl mb-2">🎨</div>
              <p className="text-[#8a97b5] font-semibold text-[15px]">Tu lienzo en blanco te espera.<br />No hay dibujo correcto o incorrecto — solo el tuyo, ahora.</p>
            </div>
          </div>
        )}
        {uploaded && <span className="absolute top-3 left-3 bg-[#22304f]/85 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">Imagen cargada ✓ puedes dibujar sobre ella</span>}
      </div>

      {/* Secondary actions */}
      <div className="flex flex-wrap gap-2.5 mt-4">
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-[#eef3ff] text-[#33548f] px-4 py-2.5 rounded-full text-[13.5px] font-extrabold hover:bg-[#dfe9ff] transition">
          <Upload size={16} /> O cargar imagen / dibujo desde tu dispositivo
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onUpload(e.target.files?.[0])} />
        <button onClick={example} className="flex items-center gap-2 bg-[#fff3d6] text-[#8a6414] px-4 py-2.5 rounded-full text-[13.5px] font-extrabold hover:bg-[#ffe9ad] transition">
          <Sparkles size={16} /> {variant === "antes" ? "¿Sin inspiración? Genera un trazo de ejemplo" : "Genera un paisaje de ejemplo"}
        </button>
        <span className="text-[12px] text-[#a3afc7] font-semibold self-center ml-auto hidden sm:inline">Funciona con mouse, dedo o lápiz digital ✎</span>
      </div>
    </div>
  );
}
