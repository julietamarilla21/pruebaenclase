"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Share2, Check, RotateCcw, Home, Palette, PenLine, Scan, Sparkles, Heart, Loader2, Eye } from "lucide-react";
import { analyzeImage, compressImage } from "@/lib/analysis";
import { generateSynthesis } from "@/lib/synthesis";
import { downloadReport } from "@/lib/report";
import type { ImageMetrics, StrokeMeta, Synthesis } from "@/lib/types";

const STAGES = [
  "Leyendo los píxeles de tu primer dibujo…",
  "Mapeando la psicología de tus colores…",
  "Siguiendo la memoria de tus trazos…",
  "Comparando espacio, luz y apertura…",
  "Tejiendo tu síntesis de cambio perceptivo…",
];

function PaletteBar({ m, title }: { m: ImageMetrics; title: string }) {
  return (
    <div>
      <p className="text-[12px] font-extrabold tracking-wide text-[#8a97b5] mb-2">{title}</p>
      <div className="flex h-9 rounded-full overflow-hidden ring-1 ring-black/5">
        {m.palette.map((p, i) => (
          <motion.div key={i} initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: .8, delay: i * .08 }} style={{ background: p.hex }} title={`${p.name} ${p.pct}%`} />
        ))}
        {m.palette.length === 0 && <div className="flex-1 bg-[#f3ead9]" />}
      </div>
      <div className="mt-2.5 space-y-1.5">
        {m.palette.slice(0, 4).map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-[13px]">
            <span className="w-3.5 h-3.5 rounded-full shrink-0 ring-1 ring-black/10" style={{ background: p.hex }} />
            <b className="text-[#22304f]">{p.name}</b>
            <span className="font-extrabold text-[#4f7fd6]">{p.pct}%</span>
            <span className="text-[#8a97b5] font-medium truncate hidden sm:inline">· {p.emotion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalysisDashboard({
  before, after, metaBefore, metaAfter, onRestart, onFinish, onShared,
}: {
  before: string; after: string; metaBefore: StrokeMeta; metaAfter: StrokeMeta;
  onRestart: () => void; onFinish: () => void; onShared: () => void;
}) {
  const [stage, setStage] = useState(0);
  const [mb, setMb] = useState<ImageMetrics | null>(null);
  const [ma, setMa] = useState<ImageMetrics | null>(null);
  const [syn, setSyn] = useState<Synthesis | null>(null);
  const [compare, setCompare] = useState(50);
  const [mode, setMode] = useState<"lado" | "deslizador">("lado");
  const [reflection, setReflection] = useState("");
  const [pseudonym, setPseudonym] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let alive = true;
    const t0 = Date.now();
    const stageTimer = setInterval(() => setStage((s) => Math.min(STAGES.length - 1, s + 1)), 650);
    (async () => {
      const [b, a] = await Promise.all([analyzeImage(before), analyzeImage(after)]);
      let synthesis: Synthesis;
      try {
        const res = await fetch("/api/analyze", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ before: b, after: a, metaBefore, metaAfter }),
        });
        synthesis = res.ok ? (await res.json()).synthesis : generateSynthesis(b, a, metaBefore, metaAfter);
      } catch { synthesis = generateSynthesis(b, a, metaBefore, metaAfter); }
      const wait = Math.max(0, 2900 - (Date.now() - t0));
      setTimeout(() => { if (alive) { clearInterval(stageTimer); setMb(b); setMa(a); setSyn(synthesis); } }, wait);
    })();
    return () => { alive = false; clearInterval(stageTimer); };
  }, [before, after, metaBefore, metaAfter]);

  const ready = mb && ma && syn;

  const doDownload = async () => {
    if (!ready) return;
    setDownloading(true);
    try { await downloadReport({ before, after, mb, ma, synthesis: syn, reflection, pseudonym }); }
    finally { setDownloading(false); }
  };

  const doShare = async () => {
    if (!ready || shared) return;
    setSharing(true);
    try {
      const [cb, ca] = await Promise.all([compressImage(before), compressImage(after)]);
      const res = await fetch("/api/community", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pseudonym: pseudonym.trim() || "Alma anónima",
          beforeImage: cb, afterImage: ca,
          reflection: reflection.trim() || "Respiré… y el mundo se vio un poco más amable.",
          synthesis: syn.headline + " — " + syn.paragraphs[1],
          beforePalette: mb.palette.map(({ name, hex, pct }) => ({ name, hex, pct })),
          afterPalette: ma.palette.map(({ name, hex, pct }) => ({ name, hex, pct })),
          metrics: { dimensions: syn.dimensions, keywordsBefore: syn.keywordsBefore, keywordsAfter: syn.keywordsAfter },
        }),
      });
      if (res.ok) { setShared(true); onShared(); }
    } finally { setSharing(false); }
  };

  const delta = useMemo(() => {
    if (!mb || !ma) return null;
    return [
      { label: "Calidez", v: ma.warmth - mb.warmth, suffix: "%" },
      { label: "Luminosidad", v: ma.brightness - mb.brightness, suffix: "%" },
      { label: "Espacio de respiro", v: ma.openness - mb.openness, suffix: "%" },
      { label: "Oscuridad", v: ma.darkness - mb.darkness, suffix: "%", invert: true },
    ];
  }, [mb, ma]);

  if (!ready) {
    return (
      <div className="bg-white rounded-[30px] border border-[#f0e6d2] shadow-sm px-6 py-16 text-center">
        <div className="relative mx-auto w-28 h-28 mb-6">
          <div className="animate-blob absolute inset-0 bg-gradient-to-br from-[#7ca6ea] via-[#8fd0b8] to-[#ffc84d]" />
          <Scan className="absolute inset-0 m-auto text-white" size={36} />
        </div>
        <h3 className="text-2xl font-extrabold text-[#22304f] mb-2">Tu espejo visual está trabajando</h3>
        <p className="text-[#5a6a8a] font-medium mb-6">Analizamos color, trazo y espacio de ambos dibujos con visión por computadora.</p>
        <div className="max-w-md mx-auto space-y-2 text-left">
          {STAGES.map((s, i) => (
            <motion.div key={s} animate={{ opacity: i <= stage ? 1 : 0.3 }} className="flex items-center gap-2.5 text-sm font-bold text-[#22304f]">
              {i < stage ? <span className="w-5 h-5 rounded-full bg-[#d7f0e5] grid place-items-center"><Check size={12} className="text-[#2f9e6e]" /></span>
                : i === stage ? <Loader2 size={17} className="animate-spin text-[#4f7fd6]" />
                : <span className="w-5 h-5 rounded-full bg-[#f5ead6]" />}
              {s}
            </motion.div>
          ))}
        </div>
        <div className="flex gap-3 justify-center mt-8 opacity-70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={before} alt="Tu primer dibujo" className="w-36 h-24 object-cover rounded-2xl ring-2 ring-[#dbe7ff]" />
          <ArrowRight className="self-center text-[#ffb703]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={after} alt="Tu segundo dibujo" className="w-36 h-24 object-cover rounded-2xl ring-2 ring-[#ffe9ad]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Headline */}
      <section className="bg-gradient-to-br from-[#22304f] to-[#33548f] text-white rounded-[30px] px-6 sm:px-10 py-9 relative overflow-hidden">
        <div className="absolute -right-10 -top-14 w-52 h-52 bg-[#ffc84d]/85 rounded-full" />
        <div className="absolute right-24 bottom-4 w-10 h-10 bg-[#8fd0b8] rounded-full hidden sm:block" />
        <p className="relative text-[#ffe9ad] font-extrabold text-[13px] tracking-widest mb-2 flex items-center gap-2"><Sparkles size={15} /> ANÁLISIS DE TU CAMBIO PERCEPTIVO</p>
        <h2 className="relative text-[26px] sm:text-4xl font-extrabold leading-tight max-w-2xl">{syn.headline}</h2>
        <div className="relative flex flex-wrap items-center gap-2 mt-5 text-[13px] font-bold">
          <span className="text-white/70">Llegaste hablando de</span>
          {syn.keywordsBefore.map((k) => <span key={k} className="bg-white/15 px-3 py-1 rounded-full">{k}</span>)}
          <ArrowRight size={15} className="text-[#ffc84d]" />
          <span className="text-white/70">y saliste hablando de</span>
          {syn.keywordsAfter.map((k) => <span key={k} className="bg-[#ffc84d] text-[#5c4303] px-3 py-1 rounded-full">{k}</span>)}
        </div>
      </section>

      {/* Comparativa */}
      <section className="bg-white rounded-[30px] border border-[#f0e6d2] shadow-sm p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="font-extrabold text-lg text-[#22304f] flex items-center gap-2"><Eye size={19} className="text-[#4f7fd6]" /> Antes y después, frente a frente</h3>
          <div className="ml-auto flex bg-[#fff6e6] rounded-full p-1">
            {(["lado", "deslizador"] as const).map((mo) => (
              <button key={mo} onClick={() => setMode(mo)} className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-extrabold ${mode === mo ? "bg-white shadow text-[#22304f]" : "text-[#8a97b5]"}`}>
                {mo === "lado" ? "Lado a lado" : "Deslizador"}
              </button>
            ))}
          </div>
        </div>

        {mode === "lado" ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[{ img: before, t: "ANTES · Así llegué", c: "bg-[#4f7fd6]", ring: "ring-[#dbe7ff]" }, { img: after, t: "DESPUÉS · Así me siento ahora", c: "bg-[#2f9e6e]", ring: "ring-[#d7f0e5]" }].map((x) => (
              <div key={x.t} className={`relative rounded-[22px] overflow-hidden ring-4 ${x.ring}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={x.img} alt={x.t} className="w-full aspect-[3/2] object-cover" />
                <span className={`absolute top-3 left-3 ${x.c} text-white text-[11.5px] font-extrabold px-3 py-1.5 rounded-full shadow`}>{x.t}</span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="relative rounded-[22px] overflow-hidden ring-4 ring-[#f5ead6] select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={after} alt="Después" className="w-full aspect-[3/2] object-cover" draggable={false} />
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${compare}%` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={before} alt="Antes" className="absolute inset-0 h-full object-cover max-w-none" style={{ width: `${(100 / Math.max(compare, 1)) * 100}%` }} draggable={false} />
              </div>
              <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,.4)]" style={{ left: `${compare}%` }}>
                <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white w-9 h-9 rounded-full grid place-items-center shadow font-black text-[#22304f] text-sm">◂▸</span>
              </div>
              <span className="absolute top-3 left-3 bg-[#4f7fd6] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full">ANTES</span>
              <span className="absolute top-3 right-3 bg-[#2f9e6e] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full">DESPUÉS</span>
            </div>
            <input type="range" min={2} max={98} value={compare} onChange={(e) => setCompare(+e.target.value)} className="w-full mt-3" aria-label="Comparar antes y después" />
          </div>
        )}

        {/* deltas rápidos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {delta!.map((d) => {
            const good = d.invert ? d.v <= 0 : d.v >= 0;
            return (
              <div key={d.label} className="bg-[#fffaf1] border border-[#f0e6d2] rounded-2xl px-4 py-3.5">
                <p className="text-[12px] font-extrabold text-[#8a97b5]">{d.label.toUpperCase()}</p>
                <p className={`text-[22px] font-black ${good ? "text-[#2f9e6e]" : "text-[#c07f2e]"}`}>{d.v > 0 ? "+" : ""}{Math.round(d.v)}{d.suffix} <span className="text-sm">{d.v === 0 ? "·" : d.v > 0 ? "↑" : "↓"}</span></p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Psicología del color */}
      <section className="bg-white rounded-[30px] border border-[#f0e6d2] shadow-sm p-5 sm:p-7">
        <h3 className="font-extrabold text-lg text-[#22304f] flex items-center gap-2 mb-4"><Palette size={19} className="text-[#e8a00c]" /> 1 · Psicología del color</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-5">
          <PaletteBar m={mb} title="ANTES" />
          <PaletteBar m={ma} title="DESPUÉS" />
        </div>
        <p className="text-[15px] leading-relaxed text-[#3c4a68] font-medium bg-[#fff6e6] border border-[#ffe9ad] rounded-2xl p-4">{syn.colorReading}</p>
      </section>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Dimensiones */}
        <section className="lg:col-span-3 bg-white rounded-[30px] border border-[#f0e6d2] shadow-sm p-5 sm:p-7">
          <h3 className="font-extrabold text-lg text-[#22304f] mb-1">Dimensiones de tu percepción</h3>
          <p className="text-[13px] text-[#8a97b5] font-semibold mb-5"><span className="text-[#7ca6ea]">■ Antes</span> · <span className="text-[#e8a00c]">■ Después</span> — medido desde tus píxeles y tus trazos</p>
          <div className="space-y-4">
            {syn.dimensions.map((d, i) => (
              <div key={d.label}>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <b className="text-[14px] text-[#22304f]">{d.label}</b>
                  <span className="text-[12px] text-[#a3afc7] font-semibold hidden sm:inline">{d.hint}</span>
                  <span className={`ml-auto text-[13px] font-black ${d.after >= d.before ? "text-[#2f9e6e]" : "text-[#c07f2e]"}`}>{d.before} → {d.after}</span>
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 bg-[#f5ead6] rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${d.before}%` }} transition={{ delay: i * .1, duration: .7 }} className="h-full bg-[#9db9ec] rounded-full" /></div>
                  <div className="h-2.5 bg-[#f5ead6] rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${d.after}%` }} transition={{ delay: .15 + i * .1, duration: .7 }} className="h-full bg-gradient-to-r from-[#ffb703] to-[#ff8fa3] rounded-full" /></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Semiótica */}
        <section className="lg:col-span-2 bg-[#eef7f2] rounded-[30px] border border-[#d7f0e5] p-5 sm:p-7">
          <h3 className="font-extrabold text-lg text-[#22304f] flex items-center gap-2 mb-4"><PenLine size={19} className="text-[#2f9e6e]" /> 2 · Trazo, espacio y símbolo</h3>
          <div className="space-y-4 text-[14.5px] leading-relaxed text-[#3c4a68] font-medium">
            <div className="bg-white/80 rounded-2xl p-4"><b className="text-[#22304f]">🖋️ El gesto. </b>{syn.strokeReading}</div>
            <div className="bg-white/80 rounded-2xl p-4"><b className="text-[#22304f]">🌤️ El espacio. </b>{syn.spaceReading}</div>
            <div className="bg-white/80 rounded-2xl p-4"><b className="text-[#22304f]">🔮 El símbolo. </b>{syn.symbolReading}</div>
          </div>
        </section>
      </div>

      {/* Síntesis */}
      <section className="bg-gradient-to-br from-[#fff3d6] to-[#ffe7dc] rounded-[30px] border border-[#ffe9ad] p-6 sm:p-9">
        <h3 className="font-extrabold text-lg text-[#22304f] mb-4">3 · Síntesis de tu cambio perceptivo</h3>
        <div className="space-y-3.5 text-[15.5px] leading-relaxed text-[#3c4a68] font-medium max-w-3xl">
          {syn.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <p className="text-[12.5px] text-[#a08c6a] font-semibold mt-5">✦ {syn.closing}</p>
      </section>

      {/* Reflexión */}
      <section className="bg-white rounded-[30px] border border-[#f0e6d2] shadow-sm p-6 sm:p-8">
        <p className="text-[13px] font-extrabold tracking-widest text-[#e8a00c] mb-2">TU REFLEXIÓN GUIADA</p>
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#22304f] leading-snug mb-4">¿Cómo puedes llevar esta sensación de bienestar y perspectiva a tus actividades y decisiones cotidianas?</h3>
        <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} maxLength={420}
          placeholder="Escribe sin filtro… Por ejemplo: «Antes de responder un correo difícil, voy a respirar como en mi prado y buscar el color amarillo de mi segundo dibujo.»"
          className="w-full rounded-2xl border-2 border-[#f0e6d2] focus:border-[#ffb703] outline-none p-4 text-[15px] font-medium text-[#22304f] bg-[#fffdf8] resize-none" />
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <input value={pseudonym} onChange={(e) => setPseudonym(e.target.value)} maxLength={30} placeholder="Tu seudónimo (opcional) · ej. Luna Serena"
            className="flex-1 min-w-[220px] rounded-full border-2 border-[#f0e6d2] focus:border-[#4f7fd6] outline-none px-5 py-3 text-sm font-bold text-[#22304f] bg-[#fffdf8]" />
          <span className="text-[12px] text-[#a3afc7] font-semibold">{reflection.length}/420 · Al compartir, tu experiencia aparece con seudónimo, nunca con datos personales.</span>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={doShare} disabled={sharing || shared}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-extrabold text-[15px] shadow-lg transition active:scale-95 disabled:opacity-80 ${shared ? "bg-[#2f9e6e] text-white" : "bg-[#22304f] text-white hover:bg-[#2c3e63]"}`}>
            {shared ? <><Check size={18} /> ¡Ya está en el Muro Comunitario!</> : sharing ? <><Loader2 size={18} className="animate-spin" /> Compartiendo…</> : <><Share2 size={18} /> Compartir en el Muro Comunitario</>}
          </button>
          <button onClick={doDownload} disabled={downloading} className="flex items-center gap-2 px-6 py-3.5 rounded-full font-extrabold text-[15px] bg-[#ffb703] text-[#5c4303] shadow-lg hover:brightness-105 active:scale-95 transition disabled:opacity-70">
            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Descargar Reporte Visual
          </button>
          <button onClick={onRestart} className="flex items-center gap-2 px-5 py-3.5 rounded-full font-extrabold text-[15px] bg-[#eef3ff] text-[#33548f] active:scale-95 transition"><RotateCcw size={17} /> Repetir experiencia</button>
          <button onClick={onFinish} className="flex items-center gap-2 px-5 py-3.5 rounded-full font-extrabold text-[15px] bg-white border-2 border-[#f0e6d2] text-[#22304f] active:scale-95 transition"><Home size={17} /> Finalizar</button>
        </div>
        <p className="flex items-center gap-1.5 text-[12.5px] text-[#a3afc7] font-semibold mt-4"><Heart size={13} className="text-[#ff8fa3]" /> Gracias por darte este momento. Lo que cambia la percepción, cambia el día.</p>
      </section>
    </motion.div>
  );
}
