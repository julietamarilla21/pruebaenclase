"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Search, Sparkles, Quote, X, Loader2 } from "lucide-react";
import type { CommunityPost } from "@/lib/types";

const AVATARS = ["🦊", "🌙", "🌻", "🦋", "🐚", "🌿", "⭐", "🕊️", "🍃", "🌊"];

export default function CommunityWall({ onStart, refreshKey }: { onStart: () => void; refreshKey: number }) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"nuevos" | "abrazados">("nuevos");
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("serena-likes") || "[]"); } catch { return []; }
  });
  const [open, setOpen] = useState<CommunityPost | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/community").then((r) => r.json()).then((d) => setPosts(d.posts ?? [])).catch(() => setPosts([])).finally(() => setLoading(false));
  }, [refreshKey]);

  const list = useMemo(() => {
    const f = posts.filter((p) => (p.reflection + p.pseudonym).toLowerCase().includes(query.toLowerCase()));
    return [...f].sort((a, b) => sort === "abrazados" ? b.likes - a.likes : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, sort, query]);

  const toggleLike = async (p: CommunityPost) => {
    if (liked.includes(p.id)) return;
    setLiked((s) => { const n = [...s, p.id]; localStorage.setItem("serena-likes", JSON.stringify(n)); return n; });
    setPosts((s) => s.map((x) => x.id === p.id ? { ...x, likes: x.likes + 1 } : x));
    if (open?.id === p.id) setOpen({ ...open, likes: open.likes + 1 });
    fetch(`/api/community/${p.id}/like`, { method: "POST" }).catch(() => {});
  };

  const dateFmt = (d: string) => new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <header className="text-center max-w-2xl mx-auto mb-8">
        <p className="text-[13px] font-extrabold tracking-widest text-[#2f9e6e] mb-2">MURO COMUNITARIO 🖼️</p>
        <h1 className="text-3xl sm:text-[42px] font-black text-[#22304f] leading-tight">Otras miradas que<br />también respiraron</h1>
        <p className="text-[#5a6a8a] font-medium mt-3 text-[16px]">Comparativas «antes y después» compartidas con seudónimo por personas como tú, junto a la frase que se llevaron a su vida cotidiana.</p>
        <button onClick={onStart} className="mt-5 inline-flex items-center gap-2 bg-[#ffb703] text-[#5c4303] px-6 py-3 rounded-full font-extrabold shadow-[0_10px_24px_rgba(255,183,3,.35)] hover:scale-[1.03] active:scale-95 transition">
          <Sparkles size={17} /> Crear mi propia experiencia
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-7">
        <div className="flex bg-white border border-[#f0e6d2] rounded-full p-1 self-start">
          {([["nuevos", "Más recientes"], ["abrazados", "Más abrazados 🤗"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setSort(k)} className={`px-4 py-2 rounded-full text-[13px] font-extrabold ${sort === k ? "bg-[#22304f] text-white" : "text-[#5a6a8a]"}`}>{label}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 bg-white border border-[#f0e6d2] rounded-full px-4 py-2.5 sm:ml-auto sm:w-72">
          <Search size={16} className="text-[#a3afc7]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar una reflexión…" className="outline-none text-sm font-semibold w-full bg-transparent text-[#22304f]" />
        </label>
        <span className="text-[13px] font-bold text-[#8a97b5]">{posts.length} experiencias compartidas</span>
      </div>

      {loading ? (
        <div className="py-20 grid place-items-center text-[#8a97b5] font-bold"><Loader2 className="animate-spin mb-3 text-[#4f7fd6]" size={30} /> Cargando el muro…</div>
      ) : list.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#e8dcc2] rounded-[28px] py-16 text-center px-6">
          <div className="text-4xl mb-3">🌱</div>
          <p className="font-extrabold text-[#22304f] text-lg">El muro está esperando su primera historia</p>
          <p className="text-[#5a6a8a] font-medium mt-1">Vive la experiencia y comparte tu antes y después para inspirar a alguien más.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:balance]">
          {list.map((p, i) => (
            <motion.article key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.4) }}
              className="break-inside-avoid mb-5 bg-white rounded-[26px] border border-[#f0e6d2] shadow-sm overflow-hidden hover:shadow-[0_16px_36px_rgba(34,48,79,.1)] transition-shadow">
              <button onClick={() => setOpen(p)} className="grid grid-cols-2 w-full relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.beforeImage} alt="Antes" className="w-full aspect-[4/3] object-cover" loading="lazy" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.afterImage} alt="Después" className="w-full aspect-[4/3] object-cover" loading="lazy" />
                <span className="absolute top-2.5 left-2.5 bg-[#4f7fd6]/90 text-white text-[10px] font-extrabold px-2 py-1 rounded-full">ANTES</span>
                <span className="absolute top-2.5 right-2.5 bg-[#2f9e6e]/90 text-white text-[10px] font-extrabold px-2 py-1 rounded-full">DESPUÉS</span>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-8 h-8 rounded-full grid place-items-center shadow group-hover:scale-110 transition"><ArrowRight size={15} className="text-[#22304f]" /></span>
              </button>
              <div className="p-5">
                <Quote size={16} className="text-[#ffb703] mb-1.5" fill="currentColor" />
                <p className="text-[14.5px] font-semibold text-[#3c4a68] leading-relaxed">“{p.reflection}”</p>
                <div className="flex items-center gap-1.5 mt-3.5">
                  {p.afterPalette.slice(0, 5).map((c, j) => <span key={j} className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} title={c.name} />)}
                  <span className="text-[11px] font-bold text-[#a3afc7] ml-1">su paleta después</span>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-[#faf3e3]">
                  <span className="w-8 h-8 rounded-full bg-[#fff3d6] grid place-items-center text-[15px]">{AVATARS[p.id % AVATARS.length]}</span>
                  <div className="leading-tight">
                    <p className="text-[13px] font-extrabold text-[#22304f]">{p.pseudonym}</p>
                    <p className="text-[11px] font-bold text-[#a3afc7]">{dateFmt(p.createdAt)}</p>
                  </div>
                  <button onClick={() => toggleLike(p)} className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-extrabold transition active:scale-90 ${liked.includes(p.id) ? "bg-[#ffe4ea] text-[#d94f70]" : "bg-[#fff6e6] text-[#8a6414] hover:bg-[#ffe9ad]"}`}>
                    <Heart size={14} fill={liked.includes(p.id) ? "currentColor" : "none"} /> {p.likes} abrazos
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-[#16213c]/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto" onClick={() => setOpen(null)}>
            <motion.div initial={{ scale: .94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .96, opacity: 0 }} className="bg-white rounded-[28px] w-full max-w-3xl shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 px-6 pt-5 pb-4">
                <span className="w-11 h-11 rounded-full bg-[#fff3d6] grid place-items-center text-xl">{AVATARS[open.id % AVATARS.length]}</span>
                <div className="flex-1">
                  <p className="font-extrabold text-[#22304f]">{open.pseudonym}</p>
                  <p className="text-[12px] font-bold text-[#a3afc7]">{new Date(open.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <button onClick={() => setOpen(null)} className="w-9 h-9 rounded-full bg-[#f5ead6] grid place-items-center hover:bg-[#ffe7dc]"><X size={17} /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 px-6">
                {[{ img: open.beforeImage, t: "ANTES", pal: open.beforePalette }, { img: open.afterImage, t: "DESPUÉS", pal: open.afterPalette }].map((x) => (
                  <div key={x.t}>
                    <div className="relative rounded-2xl overflow-hidden ring-2 ring-[#f5ead6]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={x.img} alt={x.t} className="w-full aspect-[3/2] object-cover" />
                      <span className="absolute top-2.5 left-2.5 bg-[#22304f]/85 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">{x.t}</span>
                    </div>
                    <div className="flex h-4 rounded-full overflow-hidden mt-2 ring-1 ring-black/5">
                      {x.pal.map((c, j) => <div key={j} style={{ background: c.hex, width: `${c.pct}%` }} title={`${c.name} ${c.pct}%`} />)}
                    </div>
                    <p className="text-[11px] font-bold text-[#8a97b5] mt-1">{x.pal.slice(0, 3).map((c) => `${c.name} ${Math.round(c.pct)}%`).join(" · ")}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 py-5">
                <p className="text-[16px] font-bold text-[#22304f] leading-relaxed bg-[#fff6e6] rounded-2xl p-4">“{open.reflection}”</p>
                {open.synthesis && <p className="text-[13.5px] text-[#5a6a8a] font-medium leading-relaxed mt-4"><b className="text-[#22304f]">✦ Síntesis de su viaje: </b>{open.synthesis}</p>}
                <button onClick={() => toggleLike(open)} className={`mt-5 flex items-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-sm transition active:scale-95 ${liked.includes(open.id) ? "bg-[#ffe4ea] text-[#d94f70]" : "bg-[#22304f] text-white"}`}>
                  <Heart size={16} fill={liked.includes(open.id) ? "currentColor" : "none"} /> Enviar un abrazo · {open.likes}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
