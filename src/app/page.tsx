"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Sparkles, Users, Clapperboard, Menu, X, Check } from "lucide-react";
import HomeView from "@/components/HomeView";
import Experience from "@/components/Experience";
import CommunityWall from "@/components/CommunityWall";
import VideoLibrary from "@/components/VideoLibrary";

type View = "inicio" | "experiencia" | "muro" | "videoteca";

const NAV: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "inicio", label: "Inicio Consciente", icon: <Home size={16} /> },
  { id: "experiencia", label: "Experiencia y Dibujo", icon: <Sparkles size={16} /> },
  { id: "muro", label: "Muro Comunitario", icon: <Users size={16} /> },
  { id: "videoteca", label: "Videoteca", icon: <Clapperboard size={16} /> },
];

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative w-10 h-10 rounded-full bg-[#ffb703] grid place-items-center shadow-[0_6px_16px_rgba(255,183,3,.45)] shrink-0">
        <span className="relative">
          <span className="flex gap-[7px] mb-[2px]">
            <span className="block w-[9px] h-[5px] border-b-[2.5px] border-[#22304f] rounded-b-full" />
            <span className="block w-[9px] h-[5px] border-b-[2.5px] border-[#22304f] rounded-b-full" />
          </span>
          <span className="block mx-auto w-[13px] border-b-[2.5px] border-[#22304f] rounded-b-full" style={{ height: 6 }} />
        </span>
      </span>
      <span className="leading-none">
        <span className="block font-black text-[#22304f] text-[19px] tracking-tight">serena</span>
        <span className="block text-[9.5px] font-extrabold tracking-[0.14em] text-[#8a97b5]">ARTE · MEDITACIÓN · PERCEPCIÓN</span>
      </span>
    </span>
  );
}

export default function Page() {
  const [view, setView] = useState<View>("inicio");
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [wallKey, setWallKey] = useState(0);
  const [expKey, setExpKey] = useState(0);

  const go = (v: View) => { setView(v); setMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const startExperience = () => { setExpKey((k) => k + 1); go("experiencia"); };
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4200); };

  // deep-link con hash: #experiencia, #muro, #videoteca
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (["inicio", "experiencia", "muro", "videoteca"].includes(h)) setView(h as View);
  }, []);
  useEffect(() => { history.replaceState(null, "", `#${view}`); }, [view]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fffaf1]">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-[#fffaf1]/90 backdrop-blur-md border-b border-[#f3ead9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[68px] flex items-center gap-3">
          <button onClick={() => go("inicio")} aria-label="Serena - inicio"><Logo /></button>
          <nav className="hidden lg:flex items-center gap-1.5 ml-8">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => (n.id === "experiencia" ? startExperience() : go(n.id))}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13.5px] font-extrabold transition ${view === n.id ? "bg-[#22304f] text-white shadow-md" : "text-[#5a6a8a] hover:bg-[#fff1d6] hover:text-[#22304f]"}`}>
                {n.icon} {n.label}
              </button>
            ))}
          </nav>
          <button onClick={startExperience} className="ml-auto hidden sm:flex items-center gap-2 bg-[#ffb703] text-[#5c4303] px-5 py-2.5 rounded-full font-extrabold text-[13.5px] shadow-[0_8px_20px_rgba(255,183,3,.35)] hover:scale-[1.03] active:scale-95 transition">
            <Sparkles size={15} /> Iniciar la Experiencia
          </button>
          <button onClick={() => setMenu((m) => !m)} className="lg:hidden ml-auto sm:ml-3 w-10 h-10 grid place-items-center rounded-full bg-white border border-[#f0e6d2] text-[#22304f]" aria-label="Menú">
            {menu ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        <AnimatePresence>
          {menu && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden overflow-hidden border-t border-[#f3ead9]">
              <div className="px-4 py-3 flex flex-col gap-1.5">
                {NAV.map((n) => (
                  <button key={n.id} onClick={() => (n.id === "experiencia" ? startExperience() : go(n.id))}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[14.5px] font-extrabold text-left ${view === n.id ? "bg-[#22304f] text-white" : "text-[#3c4a68] hover:bg-[#fff1d6]"}`}>
                    {n.icon} {n.label}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* VIEWS */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={view + (view === "experiencia" ? `-${expKey}` : "")} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
            {view === "inicio" && <HomeView onStart={startExperience} goWall={() => go("muro")} goVideos={() => go("videoteca")} refreshKey={wallKey} />}
            {view === "experiencia" && (
              <Experience
                onFinish={() => { go("inicio"); showToast("🌿 Experiencia completada. Que tu día conserve los colores de tu segundo dibujo."); }}
                onShared={() => { setWallKey((k) => k + 1); showToast("🎨 ¡Tu experiencia ya vive en el Muro Comunitario! Gracias por inspirar."); }}
              />
            )}
            {view === "muro" && <CommunityWall onStart={startExperience} refreshKey={wallKey} />}
            {view === "videoteca" && <VideoLibrary />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#f3ead9] bg-[#fff6e6]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-8">
          <div>
            <Logo />
            <p className="text-[13.5px] text-[#5a6a8a] font-medium mt-3 max-w-xs leading-relaxed">Un espacio para dibujar, respirar y mirar dos veces. Porque la percepción también se entrena.</p>
          </div>
          <div>
            <p className="font-extrabold text-[#22304f] text-sm mb-3">Explora</p>
            <div className="flex flex-col gap-2 text-[13.5px] font-bold text-[#5a6a8a]">
              {NAV.map((n) => <button key={n.id} className="text-left hover:text-[#22304f] w-fit" onClick={() => (n.id === "experiencia" ? startExperience() : go(n.id))}>{n.label}</button>)}
            </div>
          </div>
          <div>
            <p className="font-extrabold text-[#22304f] text-sm mb-3">Una nota amable</p>
            <p className="text-[13.5px] text-[#5a6a8a] font-medium leading-relaxed">Serena es una experiencia de bienestar y autoconocimiento. El análisis de tus dibujos es una lectura reflexiva —un espejo amable, no un diagnóstico— y no reemplaza el acompañamiento profesional.</p>
          </div>
        </div>
        <div className="border-t border-[#f3ead9] py-4 text-center text-[12px] font-bold text-[#a3afc7]">Hecho con respiraciones profundas 🌿 Serena · Arte, Meditación y Percepción Consciente</div>
      </footer>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 24, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[80] bg-[#22304f] text-white pl-4 pr-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 max-w-[92vw]">
            <span className="w-8 h-8 rounded-full bg-[#2f9e6e] grid place-items-center shrink-0"><Check size={16} /></span>
            <p className="text-[13.5px] font-bold leading-snug">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
