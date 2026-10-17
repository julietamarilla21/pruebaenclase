"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Clock, BarChart3, Search } from "lucide-react";

export type VideoItem = {
  id: string; yt: string; title: string; desc: string;
  category: string; duration: string; level: string; thumb: string; emoji: string;
};

const CATS = ["Todas", "Introducción a la Meditación", "Respiración para la Creatividad", "Visualización en la Naturaleza", "Mindfulness Cotidiano"];

const VIDEOS: VideoItem[] = [
  { id: "v1", yt: "inpok4MKVLM", emoji: "🌱", title: "Meditar en 5 minutos, donde estés", desc: "La puerta de entrada perfecta: cinco minutos guiados para descubrir que meditar no es dejar la mente en blanco, sino volver amablemente, una y otra vez.", category: "Introducción a la Meditación", duration: "5 min", level: "Principiante", thumb: "https://images.pexels.com/photos/8436678/pexels-photo-8436678.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "v2", yt: "5GSeWdjyr1c", emoji: "🧘", title: "¿Qué es meditar, en realidad?", desc: "El maestro Yongey Mingyur Rinpoche explica con humor y sencillez la esencia de la práctica: conciencia, curiosidad y una mente que aprende a descansar.", category: "Introducción a la Meditación", duration: "10 min", level: "Principiante", thumb: "https://images.pexels.com/photos/6648595/pexels-photo-6648595.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "v3", yt: "QS2yDmWk0vs", emoji: "🌬️", title: "Escaneo corporal y respiración", desc: "Un recorrido suave por el cuerpo siguiendo la respiración. Ideal antes de dibujar: suelta la tensión de manos, hombros y mandíbula… y deja que el trazo cambie.", category: "Respiración para la Creatividad", duration: "8 min", level: "Todos los niveles", thumb: "https://images.pexels.com/photos/8795388/pexels-photo-8795388.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "v4", yt: "MR57rug8NsM", emoji: "💛", title: "Respira y suelta la ansiedad en 5 minutos", desc: "Una práctica breve para los días en que la cabeza no para: respiración guiada ritmo a ritmo para recuperar espacio interior antes de crear o decidir.", category: "Respiración para la Creatividad", duration: "5 min", level: "Principiante", thumb: "https://images.pexels.com/photos/6643230/pexels-photo-6643230.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "v5", yt: "ZToicYcHIOU", emoji: "🏞️", title: "Estar presente: meditación de 10 minutos", desc: "El clásico Daily Calm: una visualización serena para aterrizar en el momento presente, como quien se sienta a la orilla de un lago y deja que el agua se aclare.", category: "Visualización en la Naturaleza", duration: "10 min", level: "Todos los niveles", thumb: "https://images.pexels.com/photos/15359164/pexels-photo-15359164.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "v6", yt: "lVx3mFxML80", emoji: "🌄", title: "Presencia plena entre naturaleza", desc: "Diez minutos para imaginarte en un entorno natural que te sostiene: el mismo ejercicio que acabas de vivir en Serena, en versión extendida.", category: "Visualización en la Naturaleza", duration: "10 min", level: "Intermedio", thumb: "https://images.pexels.com/photos/2691464/pexels-photo-2691464.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "v7", yt: "ukTaodQfYRQ", emoji: "☕", title: "Mindfulness en medio de la vida real", desc: "Cómo llevar la atención plena al café de la mañana, a la fila del supermercado, a una conversación difícil. La meditación que cabe en un martes cualquiera.", category: "Mindfulness Cotidiano", duration: "15 min", level: "Todos los niveles", thumb: "https://images.pexels.com/photos/8391376/pexels-photo-8391376.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "v8", yt: "1vx8iUvfyCY", emoji: "🌙", title: "Cierra el día: relajación profunda guiada", desc: "La voz de Michael Sealey en una relajación para soltar el día entero y preparar un descanso reparador. Perfecto después de tu sesión de dibujo nocturna.", category: "Mindfulness Cotidiano", duration: "20 min", level: "Todos los niveles", thumb: "https://images.pexels.com/photos/5434166/pexels-photo-5434166.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
];

const CAT_COLOR: Record<string, string> = {
  "Introducción a la Meditación": "bg-[#dbe7ff] text-[#33548f]",
  "Respiración para la Creatividad": "bg-[#ffe9ad] text-[#8a6414]",
  "Visualización en la Naturaleza": "bg-[#d7f0e5] text-[#1f6b4a]",
  "Mindfulness Cotidiano": "bg-[#ffe7dc] text-[#96452a]",
};

export default function VideoLibrary() {
  const [cat, setCat] = useState("Todas");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<VideoItem | null>(null);

  const list = useMemo(() => VIDEOS.filter((v) =>
    (cat === "Todas" || v.category === cat) &&
    (v.title + v.desc).toLowerCase().includes(query.toLowerCase())
  ), [cat, query]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <header className="text-center max-w-2xl mx-auto mb-8">
        <p className="text-[13px] font-extrabold tracking-widest text-[#4f7fd6] mb-2">VIDEOTECA DE BIENESTAR 📺</p>
        <h1 className="text-3xl sm:text-[42px] font-black text-[#22304f] leading-tight">Aprende a respirar,<br />a tu ritmo y sin prisa</h1>
        <p className="text-[#5a6a8a] font-medium mt-3 text-[16px]">Videos educativos seleccionados sobre meditación, respiración creativa y atención plena para la vida cotidiana. Pulsa cualquiera para verlo aquí mismo.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-7">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:flex-1">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 px-4 py-2.5 rounded-full text-[13px] font-extrabold transition ${cat === c ? "bg-[#22304f] text-white shadow-md" : "bg-white border border-[#f0e6d2] text-[#5a6a8a] hover:bg-[#fff6e6]"}`}>{c}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 bg-white border border-[#f0e6d2] rounded-full px-4 py-2.5 md:w-64 shrink-0">
          <Search size={16} className="text-[#a3afc7]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar práctica…" className="outline-none text-sm font-semibold w-full bg-transparent text-[#22304f]" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((v, i) => (
          <motion.article key={v.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[26px] border border-[#f0e6d2] shadow-sm overflow-hidden hover:shadow-[0_18px_40px_rgba(34,48,79,.12)] hover:-translate-y-1 transition-all group">
            <button onClick={() => setOpen(v)} className="relative block w-full text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.thumb} alt={v.title} className="w-full aspect-[16/9] object-cover group-hover:scale-[1.03] transition-transform duration-500" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#22304f]/55 via-transparent to-transparent" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 rounded-full grid place-items-center shadow-xl group-hover:scale-110 transition">
                <Play size={22} className="text-[#22304f] translate-x-[2px]" fill="currentColor" />
              </span>
              <span className="absolute bottom-3 right-3 bg-[#22304f]/85 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock size={11} /> {v.duration}</span>
              <span className="absolute top-3 left-3 text-xl bg-white/90 w-9 h-9 rounded-full grid place-items-center shadow">{v.emoji}</span>
            </button>
            <div className="p-5">
              <div className="flex flex-wrap gap-2 mb-2.5">
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${CAT_COLOR[v.category]}`}>{v.category}</span>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-[#f5ead6] text-[#8a6d3b] flex items-center gap-1"><BarChart3 size={11} /> {v.level}</span>
              </div>
              <h3 className="font-extrabold text-[#22304f] text-[17px] leading-snug mb-1.5">{v.title}</h3>
              <p className="text-[13.5px] text-[#5a6a8a] font-medium leading-relaxed line-clamp-3">{v.desc}</p>
              <button onClick={() => setOpen(v)} className="mt-3.5 text-[13.5px] font-extrabold text-[#4f7fd6] hover:text-[#22304f]">Ver ahora →</button>
            </div>
          </motion.article>
        ))}
      </div>
      {list.length === 0 && (
        <div className="text-center py-16 text-[#8a97b5] font-semibold">🌥️ Ninguna práctica coincide con tu búsqueda. Prueba con «respiración» o cambia de categoría.</div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-[#16213c]/80 backdrop-blur-sm grid place-items-center p-4" onClick={() => setOpen(null)}>
            <motion.div initial={{ scale: .92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .95, opacity: 0 }} className="bg-white rounded-[26px] overflow-hidden w-full max-w-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-3">
                <span className="text-2xl">{open.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-[#22304f] leading-snug">{open.title}</h3>
                  <p className="text-[12px] font-bold text-[#8a97b5]">{open.category} · {open.duration} · {open.level}</p>
                </div>
                <button onClick={() => setOpen(null)} className="w-9 h-9 rounded-full bg-[#f5ead6] grid place-items-center hover:bg-[#ffe7dc] shrink-0"><X size={17} /></button>
              </div>
              <div className="aspect-video bg-black">
                <iframe src={`https://www.youtube-nocookie.com/embed/${open.yt}?autoplay=1&rel=0`} title={open.title} className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <p className="px-5 sm:px-6 py-4 text-[14px] text-[#5a6a8a] font-medium leading-relaxed">{open.desc}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
