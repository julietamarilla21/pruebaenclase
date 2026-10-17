"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, MoonStar, Sunrise } from "lucide-react";
import DrawingCanvas from "./DrawingCanvas";
import Meditation from "./Meditation";
import AnalysisDashboard from "./AnalysisDashboard";
import type { StrokeMeta } from "@/lib/types";

const LABELS = ["Expresión inicial", "Meditación guiada", "Nueva expresión", "Tu espejo visual"];

export default function Experience({ onFinish, onShared }: { onFinish: () => void; onShared: () => void }) {
  const [step, setStep] = useState(1);
  const [runId, setRunId] = useState(0);
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [metaB, setMetaB] = useState<StrokeMeta>(null);
  const [metaA, setMetaA] = useState<StrokeMeta>(null);
  const [warn, setWarn] = useState("");

  const go = (s: number) => { setStep(s); setWarn(""); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const toMeditation = () => {
    if (!before) { setWarn("🌱 Dibuja algo primero — aunque sean tres líneas — o carga una imagen. Tu primer trazo es el punto de partida del viaje."); return; }
    go(2);
  };
  const toAnalysis = () => {
    if (!after) { setWarn("🌅 Tu segundo dibujo aún está en blanco. Deja que tu paisaje interior encuentre una forma, cualquiera."); return; }
    go(4);
  };
  const restart = () => {
    setBefore(null); setAfter(null); setMetaB(null); setMetaA(null);
    setRunId((r) => r + 1); go(1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
        {LABELS.map((l, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "active" : "todo";
          return (
            <div key={l} className="flex items-center gap-1 sm:gap-2">
              <div className={`flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3.5 py-1.5 rounded-full transition-all ${state === "active" ? "bg-[#22304f] text-white shadow-md" : state === "done" ? "bg-[#d7f0e5] text-[#1f6b4a]" : "bg-white border border-[#f0e6d2] text-[#a3afc7]"}`}>
                <span className={`w-6 h-6 rounded-full grid place-items-center text-[12px] font-black ${state === "active" ? "bg-[#ffc84d] text-[#5c4303]" : state === "done" ? "bg-[#2f9e6e] text-white" : "bg-[#f5ead6] text-[#a3afc7]"}`}>
                  {state === "done" ? <Check size={13} /> : n}
                </span>
                <span className="text-[12px] sm:text-[13px] font-extrabold hidden md:inline">{l}</span>
                <span className="text-[12px] font-extrabold md:hidden">{state === "active" ? l : ""}</span>
              </div>
              {n < 4 && <span className={`w-3 sm:w-7 h-[3px] rounded-full ${n < step ? "bg-[#8fd0b8]" : "bg-[#f0e6d2]"}`} />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.section key={`s1-${runId}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: .35 }}>
            <div className="flex items-start gap-4 mb-5">
              <span className="w-14 h-14 rounded-[20px] bg-[#dbe7ff] grid place-items-center shrink-0 text-[#33548f]"><MoonStar size={26} /></span>
              <div>
                <p className="text-[12px] font-extrabold tracking-widest text-[#4f7fd6]">PASO 1 · EXPRESIÓN INICIAL</p>
                <h1 className="text-2xl sm:text-[32px] font-black text-[#22304f] leading-tight">Así llegas: dibújalo como es</h1>
                <p className="text-[#5a6a8a] font-medium mt-1.5 max-w-2xl text-[15.5px] leading-relaxed">Tómate un momento para conectar con tu estado actual. <b className="text-[#22304f]">Dibuja libremente lo que surge en tu mente</b> —un paisaje, una emoción, garabatos honestos— o carga una imagen existente. Aquí no hay examen de arte: hay escucha.</p>
              </div>
            </div>
            <DrawingCanvas variant="antes" onChange={(img, meta) => { setBefore(img); setMetaB(meta); setWarn(""); }} />
            {warn && <p className="mt-4 bg-[#ffe7dc] text-[#96452a] font-bold text-sm rounded-2xl px-4 py-3">{warn}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button onClick={toMeditation} className="flex items-center gap-2 bg-[#22304f] text-white px-7 py-4 rounded-full font-extrabold text-[15.5px] shadow-[0_14px_30px_rgba(34,48,79,.25)] hover:scale-[1.02] active:scale-95 transition">
                Guardar y Continuar a la Meditación <ArrowRight size={18} />
              </button>
              {before && <span className="text-[13px] font-bold text-[#2f9e6e] flex items-center gap-1.5"><Check size={15} /> Tu primer dibujo está guardado en este viaje</span>}
            </div>
          </motion.section>
        )}

        {step === 2 && (
          <motion.section key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: .35 }}>
            <div className="text-center mb-5">
              <p className="text-[12px] font-extrabold tracking-widest text-[#2f9e6e]">PASO 2 · MEDITACIÓN GUIADA</p>
              <h1 className="text-2xl sm:text-[32px] font-black text-[#22304f] leading-tight mt-1">Respira. Viaja a tu lugar de calma.</h1>
              <p className="text-[#5a6a8a] font-medium mt-1.5 max-w-xl mx-auto text-[15.5px]">Tu primer dibujo queda guardado. Ahora, unos minutos para que tu percepción cambie de luz.</p>
            </div>
            <Meditation onComplete={() => go(3)} />
            <button onClick={() => go(1)} className="flex items-center gap-1.5 mt-5 text-sm font-extrabold text-[#8a97b5] hover:text-[#22304f]"><ArrowLeft size={15} /> Volver a mi primer dibujo</button>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section key={`s3-${runId}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: .35 }}>
            <div className="flex items-start gap-4 mb-5">
              <span className="w-14 h-14 rounded-[20px] bg-[#ffe9ad] grid place-items-center shrink-0 text-[#8a6414]"><Sunrise size={26} /></span>
              <div>
                <p className="text-[12px] font-extrabold tracking-widest text-[#e8a00c]">PASO 3 · EXPRESIÓN POSTERIOR</p>
                <h1 className="text-2xl sm:text-[32px] font-black text-[#22304f] leading-tight">Y así regresas: dibújalo de nuevo</h1>
                <p className="text-[#5a6a8a] font-medium mt-1.5 max-w-2xl text-[15.5px] leading-relaxed">Regresa suavemente. Con este nuevo estado de calma y bienestar, <b className="text-[#22304f]">vuelve a dibujar o carga una nueva imagen</b> que represente lo que sientes e imaginas ahora. ¿Sigue ahí tu paisaje? Tráelo al papel.</p>
              </div>
            </div>
            {before && (
              <div className="flex items-center gap-3 bg-white border border-[#f0e6d2] rounded-2xl p-3 mb-4 w-fit shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={before} alt="Tu primer dibujo" className="w-24 h-16 object-cover rounded-xl ring-2 ring-[#dbe7ff]" />
                <div className="pr-2">
                  <p className="text-[12px] font-extrabold text-[#33548f]">TU PRIMER DIBUJO · guardado ✓</p>
                  <p className="text-[12.5px] text-[#8a97b5] font-semibold">Míralo un instante… y ahora suéltalo. Este lienzo es de <i>ahora</i>.</p>
                </div>
              </div>
            )}
            <DrawingCanvas variant="despues" onChange={(img, meta) => { setAfter(img); setMetaA(meta); setWarn(""); }} />
            {warn && <p className="mt-4 bg-[#ffe7dc] text-[#96452a] font-bold text-sm rounded-2xl px-4 py-3">{warn}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button onClick={toAnalysis} className="flex items-center gap-2 bg-[#ffb703] text-[#5c4303] px-7 py-4 rounded-full font-extrabold text-[15.5px] shadow-[0_14px_30px_rgba(255,183,3,.35)] hover:scale-[1.02] active:scale-95 transition">
                ✨ Analizar y Comparar mi Experiencia <ArrowRight size={18} />
              </button>
              <button onClick={() => go(2)} className="flex items-center gap-1.5 text-sm font-extrabold text-[#8a97b5] hover:text-[#22304f] px-3 py-2"><ArrowLeft size={15} /> Meditar un poco más</button>
            </div>
          </motion.section>
        )}

        {step === 4 && before && after && (
          <motion.section key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: .35 }}>
            <AnalysisDashboard before={before} after={after} metaBefore={metaB} metaAfter={metaA} onRestart={restart} onFinish={onFinish} onShared={onShared} />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
