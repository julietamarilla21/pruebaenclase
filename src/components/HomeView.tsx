"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain, HeartHandshake, Lightbulb, PenTool, Wind, Palette, BarChart3, Play, Pause, Users, Clapperboard } from "lucide-react";
import type { CommunityPost } from "@/lib/types";

/** Mini widget de respiración 4-4 en la home */
function BreathWidget() {
  const [on, setOn] = useState(false);
  const [t, setT] = useState(0);
  const [cycles, setCycles] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setT((v) => v + 0.1), 100);
    return () => clearInterval(id);
  }, [on]);
  const c = t % 8;
  const scale = c < 4 ? 1 + (c / 4) * 0.45 : 1.45 - ((c - 4) / 4) * 0.45;
  const phase = c < 4 ? "Inhala · 4" : "Exhala · 4";
  useEffect(() => {
    const n = Math.floor(t / 8);
    if (n !== prev.current) { prev.current = n; setCycles(n); }
  }, [t]);
  return (
    <div className="bg-white rounded-[26px] border border-[#f0e6d2] shadow-sm p-6 flex items-center gap-6 flex-col sm:flex-row">
      <div className="relative w-32 h-32 shrink-0 grid place-items-center">
        <div className="animate-blob absolute w-24 h-24 bg-gradient-to-br from-[#7ca6ea] to-[#8fd0b8]" style={{ transform: `scale(${on ? scale : 1})`, transition: "transform .4s linear" }} />
        <div className="relative text-center pointer-events-none">
          <div className="flex justify-center gap-3.5 mb-1">
            <span className="block w-4 h-2 border-b-[2.5px] border-white rounded-b-full" />
            <span className="block w-4 h-2 border-b-[2.5px] border-white rounded-b-full" />
          </div>
          <span className="block mx-auto w-6 border-b-[2.5px] border-white rounded-b-full" style={{ height: 10 }} />
        </div>
      </div>
      <div className="text-center sm:text-left">
        <h3 className="font-extrabold text-[#22304f] text-lg">Pruébalo ahora: respiro de 30 segundos</h3>
        <p className="text-[#5a6a8a] font-medium text-[14.5px] mt-1 max-w-md">Sigue el círculo con tu respiración. Solo 3 o 4 ciclos así ya le dicen a tu sistema nervioso: <i>«estamos a salvo, podemos bajar el volumen»</i>.</p>
        <div className="flex items-center gap-3 mt-3.5 justify-center sm:justify-start">
          <button onClick={() => { setOn((o) => !o); if (on) { setT(0); setCycles(0); prev.current = 0; } }} className="flex items-center gap-2 bg-[#22304f] text-white px-5 py-2.5 rounded-full font-extrabold text-sm active:scale-95 transition">
            {on ? <Pause size={15} /> : <Play size={15} />} {on ? "Detener" : "Respirar conmigo"}
          </button>
          {on && <span className="text-sm font-extrabold text-[#4f7fd6]">{phase} · ciclo {cycles + 1}</span>}
          {!on && cycles > 0 && <span className="text-sm font-bold text-[#2f9e6e]">Completaste {cycles} respiraciones 🌿</span>}
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { n: "1", color: "bg-[#dbe7ff] text-[#33548f]", icon: <PenTool size={20} />, title: "Dibuja cómo llegas", desc: "Sin técnica, sin juicio. Deja que tu mano diga lo que las palabras aún no saben." },
  { n: "2", color: "bg-[#d7f0e5] text-[#1f6b4a]", icon: <Wind size={20} />, title: "Medita en tu paisaje", desc: "2–3 minutos guiados por voz y sonidos de la naturaleza hacia un bosque, una playa o un prado." },
  { n: "3", color: "bg-[#ffe9ad] text-[#8a6414]", icon: <Palette size={20} />, title: "Dibuja cómo regresas", desc: "El mismo lienzo, otra mirada. Representa lo que sientes e imaginas ahora." },
  { n: "4", color: "bg-[#ffe7dc] text-[#96452a]", icon: <BarChart3 size={20} />, title: "Descubre tu cambio", desc: "Un análisis de color, trazo y espacio convierte tus dos dibujos en un espejo reflexivo." },
];

export default function HomeView({ onStart, goWall, goVideos, refreshKey }: { onStart: () => void; goWall: () => void; goVideos: () => void; refreshKey: number }) {
  const [preview, setPreview] = useState<CommunityPost[]>([]);
  useEffect(() => {
    fetch("/api/community").then((r) => r.json()).then((d) => setPreview((d.posts ?? []).slice(0, 3))).catch(() => {});
  }, [refreshKey]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-[#ffe9ad] rounded-full opacity-70" />
        <div className="animate-blob absolute top-44 -left-28 w-80 h-80 bg-[#d7f0e5]" />
        <div className="absolute bottom-8 right-[38%] w-14 h-14 bg-[#ffb59e] rounded-full hidden lg:block" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-14 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
            <span className="inline-flex items-center gap-2 bg-white border border-[#f0e6d2] shadow-sm px-4 py-2 rounded-full text-[13px] font-extrabold text-[#33548f]">🌿 Arte expresivo + meditación guiada</span>
            <h1 className="text-[38px] sm:text-[56px] leading-[1.05] font-black text-[#22304f] mt-5">
              Descubre cómo la meditación <span className="relative inline-block">transforma<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none"><path d="M2 9 Q 100 -2 198 8" stroke="#ffb703" strokeWidth="5" fill="none" strokeLinecap="round" /></svg></span> tu percepción
            </h1>
            <p className="text-[#5a6a8a] text-[17px] font-medium leading-relaxed mt-5 max-w-lg">
              Dibuja cómo te sientes ahora. Respira unos minutos en un paisaje que imaginas. Vuelve a dibujar. Y mírate en el espejo de tus propios colores: <b className="text-[#22304f]">lo que cambia por dentro, se nota por fuera.</b>
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <button onClick={onStart} className="flex items-center gap-2 bg-[#22304f] text-white px-7 py-4 rounded-full font-extrabold text-[16px] shadow-[0_14px_30px_rgba(34,48,79,.28)] hover:scale-[1.03] active:scale-95 transition">
                Iniciar la Experiencia <ArrowRight size={19} />
              </button>
              <button onClick={goWall} className="flex items-center gap-2 bg-white border-2 border-[#f0e6d2] text-[#22304f] px-6 py-4 rounded-full font-extrabold text-[15px] hover:bg-[#fff6e6] active:scale-95 transition">
                <Users size={18} className="text-[#2f9e6e]" /> Ver el Muro Comunitario
              </button>
            </div>
            <div className="flex gap-6 mt-8 text-center">
              {[["4", "pasos guiados"], ["±8 min", "de experiencia"], ["2", "dibujos, un espejo"], ["0", "talento requerido"]].map(([a, b]) => (
                <div key={b}><p className="text-xl sm:text-2xl font-black text-[#22304f]">{a}</p><p className="text-[11.5px] font-bold text-[#8a97b5]">{b}</p></div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7, delay: .15 }} className="relative mx-auto w-full max-w-[480px]">
            <div className="animate-blob overflow-hidden shadow-[0_30px_60px_rgba(34,48,79,.2)] aspect-[4/4.4] bg-[#dbe7ff]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.pexels.com/photos/13865939/pexels-photo-13865939.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1000" alt="Persona meditando en la naturaleza" className="w-full h-full object-cover" />
            </div>
            <div className="animate-floaty absolute -left-4 sm:-left-10 top-10 bg-white rounded-3xl shadow-xl px-4 py-3 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#d7f0e5] grid place-items-center text-lg">🎨</span>
              <div className="leading-tight"><p className="text-[13px] font-extrabold text-[#22304f]">Antes → Después</p><p className="text-[11px] font-bold text-[#8a97b5]">tu paleta cuenta la historia</p></div>
            </div>
            <div className="animate-floaty2 absolute -right-3 sm:-right-8 bottom-16 bg-white rounded-3xl shadow-xl px-4 py-3">
              <p className="text-[12px] font-extrabold text-[#22304f] mb-1.5">Luminosidad interior</p>
              <div className="flex items-center gap-2"><span className="text-[11px] font-black text-[#7ca6ea]">34</span><div className="w-24 h-2 bg-[#f5ead6] rounded-full overflow-hidden"><div className="h-full w-[34%] bg-[#9db9ec] rounded-full" /></div></div>
              <div className="flex items-center gap-2 mt-1"><span className="text-[11px] font-black text-[#e8a00c]">78</span><div className="w-24 h-2 bg-[#f5ead6] rounded-full overflow-hidden"><div className="h-full w-[78%] bg-gradient-to-r from-[#ffb703] to-[#ff8fa3] rounded-full" /></div></div>
              <p className="text-[10.5px] font-bold text-[#a3afc7] mt-1.5">tras 3 minutos de respiro ✦</p>
            </div>
            <div className="animate-floaty absolute left-6 -bottom-5 bg-[#22304f] text-white rounded-full shadow-xl px-5 py-3 text-[13px] font-extrabold" style={{ animationDelay: "1.2s" }}>🧘 Respira · Imagina · Crea</div>
          </motion.div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <p className="text-[13px] font-extrabold tracking-widest text-[#e8a00c] mb-2">EL VIAJE EN 4 PASOS</p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#22304f]">Un pequeño ritual de percepción</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }}
              className="bg-white rounded-[26px] border border-[#f0e6d2] shadow-sm p-6 relative hover:-translate-y-1 hover:shadow-lg transition-all">
              <span className="absolute top-5 right-6 text-[44px] font-black text-[#f7efdd] leading-none">{s.n}</span>
              <span className={`relative w-12 h-12 rounded-2xl grid place-items-center ${s.color}`}>{s.icon}</span>
              <h3 className="relative font-extrabold text-[#22304f] mt-4 mb-1.5">{s.title}</h3>
              <p className="relative text-[14px] text-[#5a6a8a] font-medium leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CIENCIA AMABLE */}
      <section className="texture-dots bg-[#fff6e6]/70 border-y border-[#f0e6d2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-[13px] font-extrabold tracking-widest text-[#4f7fd6] mb-2">INICIO CONSCIENTE 🧠</p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#22304f] leading-tight">¿Por qué dibujar antes y después cambia lo que ves?</h2>
              <p className="text-[#5a6a8a] font-medium leading-relaxed mt-4 text-[15.5px]">
                Tu percepción no es una cámara: es una interpretación. El estrés estrecha el foco, oscurece los matices y acelera la mano. La atención plena hace lo contrario — y se puede <b className="text-[#22304f]">ver</b>, trazo a trazo, en un papel.
              </p>
              <div className="mt-6"><BreathWidget /></div>
            </div>
            <div className="space-y-4">
              {[
                { icon: <Brain size={22} />, bg: "bg-[#dbe7ff] text-[#33548f]", title: "El cerebro que se aquieta, percibe más", desc: "Al meditar disminuye la actividad de la red de «rumiación» y se afina la atención sensorial. Traducción: más matices de color, más detalles del entorno, menos piloto automático.", stat: ["Atención plena", 82] },
                { icon: <HeartHandshake size={22} />, bg: "bg-[#ffe7dc] text-[#96452a]", title: "Menos estrés, mano más suave", desc: "La respiración lenta activa el sistema parasimpático: baja el cortisol y la tensión muscular. Por eso, tras respirar, los trazos tienden a curvarse y el espacio en el lienzo se abre.", stat: ["Calma corporal", 74] },
                { icon: <Lightbulb size={22} />, bg: "bg-[#ffe9ad] text-[#8a6414]", title: "La creatividad ama el espacio en blanco", desc: "Una mente que descansa conecta ideas lejanas. El segundo dibujo suele incorporar símbolos nuevos —soles, ríos, caminos— que el primero ni insinuaba: es tu imaginación con las ventanas abiertas.", stat: ["Expansión creativa", 88] },
              ].map((c, i) => (
                <motion.article key={c.title} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }}
                  className="bg-white rounded-[26px] border border-[#f0e6d2] shadow-sm p-6 flex gap-4">
                  <span className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 ${c.bg}`}>{c.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-[#22304f]">{c.title}</h3>
                    <p className="text-[14px] text-[#5a6a8a] font-medium leading-relaxed mt-1">{c.desc}</p>
                    <div className="flex items-center gap-2.5 mt-3">
                      <span className="text-[11px] font-extrabold text-[#8a97b5] w-28">{c.stat[0] as string}</span>
                      <div className="flex-1 h-2 bg-[#f5ead6] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#8fd0b8] to-[#4f7fd6] rounded-full" style={{ width: `${c.stat[1]}%` }} /></div>
                      <span className="text-[11px] font-black text-[#4f7fd6]">+{c.stat[1] as number}%</span>
                    </div>
                  </div>
                </motion.article>
              ))}
              <p className="text-[12px] text-[#a3afc7] font-semibold px-2">✦ Indicadores ilustrativos basados en la evidencia general sobre mindfulness: tu propio antes/después será tu mejor dato.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PREVIEW MURO */}
      {preview.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-wrap items-end gap-3 mb-7">
            <div>
              <p className="text-[13px] font-extrabold tracking-widest text-[#2f9e6e] mb-1.5">MURO COMUNITARIO</p>
              <h2 className="text-3xl font-black text-[#22304f]">Miradas que ya hicieron el viaje</h2>
            </div>
            <button onClick={goWall} className="ml-auto flex items-center gap-2 font-extrabold text-[#4f7fd6] hover:text-[#22304f] text-sm">Ver todas las experiencias <ArrowRight size={16} /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {preview.map((p) => (
              <div key={p.id} className="bg-white rounded-[26px] border border-[#f0e6d2] shadow-sm overflow-hidden">
                <div className="grid grid-cols-2 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.beforeImage} alt="Antes" className="w-full aspect-[4/3] object-cover" loading="lazy" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.afterImage} alt="Después" className="w-full aspect-[4/3] object-cover" loading="lazy" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-7 h-7 rounded-full grid place-items-center shadow"><ArrowRight size={13} /></span>
                </div>
                <div className="p-4">
                  <p className="text-[13.5px] font-semibold text-[#3c4a68] leading-relaxed line-clamp-2">“{p.reflection}”</p>
                  <p className="text-[12px] font-extrabold text-[#8a97b5] mt-2">— {p.pseudonym} · ❤️ {p.likes} abrazos</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden bg-[#22304f] rounded-[34px] px-6 sm:px-12 py-12 text-center text-white">
          <div className="absolute -top-16 -left-10 w-56 h-56 bg-[#ffc84d] rounded-full" />
          <div className="animate-blob absolute -bottom-20 -right-8 w-64 h-64 bg-[#4f7fd6]/60" />
          <div className="relative">
            <div className="text-4xl mb-3">🌅</div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">Tu segundo dibujo ya existe.<br />Solo falta respirar para verlo.</h2>
            <p className="text-white/75 font-medium mt-3 max-w-xl mx-auto">Ocho minutos, dos dibujos y un espejo amable. Sin registro, sin juicios, con todos los colores que traigas hoy.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-7">
              <button onClick={onStart} className="flex items-center gap-2 bg-[#ffb703] text-[#5c4303] px-7 py-3.5 rounded-full font-extrabold shadow-xl hover:scale-105 active:scale-95 transition">Iniciar la Experiencia <ArrowRight size={18} /></button>
              <button onClick={goVideos} className="flex items-center gap-2 bg-white/15 backdrop-blur text-white px-6 py-3.5 rounded-full font-extrabold hover:bg-white/25 active:scale-95 transition"><Clapperboard size={18} /> Primero, ver un video</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
