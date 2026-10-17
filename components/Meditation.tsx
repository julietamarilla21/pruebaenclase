"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Mic, MicOff, SkipForward, TreePine, Waves, Sun, Wind } from "lucide-react";

type Scene = "bosque" | "playa" | "prado";

const SCENES: Record<Scene, { label: string; icon: React.ReactNode; place: string; detail: string; sound: string }> = {
  bosque: { label: "Un bosque en calma", icon: <TreePine size={18} />, place: "un bosque suave, donde la luz se filtra entre las hojas", detail: "el aroma a tierra húmeda y el rumor lejano de las hojas", sound: "viento entre árboles" },
  playa: { label: "Una playa serena", icon: <Waves size={18} />, place: "una playa serena al amanecer, con la arena tibia bajo tus pies", detail: "el ir y venir de las olas marcando el ritmo de tu respiración", sound: "olas suaves" },
  prado: { label: "Un prado al sol", icon: <Sun size={18} />, place: "un prado amplio bajo un sol amable, con hierba que se mece despacio", detail: "una brisa cálida que acaricia tu piel y mueve las flores", sound: "brisa y pájaros" },
};

function scriptFor(scene: Scene) {
  const s = SCENES[scene];
  return [
    { at: 0, title: "Llega a este momento", text: "Encuentra una postura cómoda. Deja que tus hombros caigan un poco… y permite que el primer dibujo se quede atrás, como una página ya leída." },
    { at: 0.12, title: "Respira", text: "Inhala despacio por la nariz… sostén un instante… y exhala como quien suelta algo pesado y querido a la vez. Nada que arreglar. Solo respirar." },
    { at: 0.26, title: "Imagina tu lugar", text: `Ahora imagina que llegas a ${s.place}. No necesitas verlo con detalle perfecto: basta la sensación de estar ahí.` },
    { at: 0.4, title: "Habita los sentidos", text: `Percibe ${s.detail}. La temperatura del aire… la luz sobre lo que te rodea… el espacio, abierto, sin prisa.` },
    { at: 0.54, title: "Expansión", text: "Con cada inhalación, ese lugar se hace un poco más amplio. Con cada exhalación, tú también: más espacio en el pecho, más espacio en la mente." },
    { at: 0.68, title: "Los colores cambian", text: "Nota cómo los colores de tu paisaje se vuelven más cálidos, más amables. Como si el mundo, mirado con calma, cambiara ligeramente de luz." },
    { at: 0.8, title: "Quédate un momento", text: "Quédate aquí unos respiros más. Este bienestar no hay que ganárselo: ya está ocurriendo, en este cuerpo, en este instante." },
    { at: 0.92, title: "Regresa suavemente", text: "Poco a poco, trae tu atención de vuelta. Mueve los dedos… nota el lugar donde estás… y conserva los colores de tu paisaje para tu próximo dibujo." },
  ];
}

// lerp between two hex colors
function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
}

export default function Meditation({ onComplete }: { onComplete: () => void }) {
  const [scene, setScene] = useState<Scene>("bosque");
  const [duration, setDuration] = useState(120); // seconds
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(false);
  const [voice, setVoice] = useState(true);
  const [volume, setVolume] = useState(0.6);

  const audioRef = useRef<{ ctx: AudioContext; master: GainNode; nodes: OscillatorNode[]; noise?: AudioBufferSourceNode } | null>(null);
  const spokenRef = useRef(-1);
  const script = useMemo(() => scriptFor(scene), [scene]);
  const progress = Math.min(1, elapsed / duration);
  const activeIdx = script.reduce((acc, s, i) => (progress >= s.at ? i : acc), 0);
  const active = script[activeIdx];

  // breathing cycle 4 - 2 - 6
  const cycleT = elapsed % 12;
  const breathPhase = cycleT < 4 ? "Inhala…" : cycleT < 6 ? "Sostén…" : "Exhala…";
  const breathScale = cycleT < 4 ? 1 + (cycleT / 4) * 0.42 : cycleT < 6 ? 1.42 : 1.42 - ((cycleT - 6) / 6) * 0.42;

  // ---------- Ambient audio (WebAudio generative) ----------
  const startAudio = () => {
    if (audioRef.current) { audioRef.current.ctx.resume(); return; }
    try {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = muted ? 0 : volume * 0.16;
      master.connect(ctx.destination);
      const nodes: OscillatorNode[] = [];
      // gentle pad chord (C major add9)
      [130.81, 196, 261.63, 329.63].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0.16 / (i + 1);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.06 + i * 0.03;
        const lfoG = ctx.createGain(); lfoG.gain.value = 0.05;
        lfo.connect(lfoG); lfoG.connect(g.gain);
        o.connect(g); g.connect(master);
        o.start(); lfo.start();
        nodes.push(o);
      });
      // filtered noise (waves / wind)
      const len = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buffer.getChannelData(0);
      let lastV = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; lastV = (lastV + 0.02 * w) / 1.02; ch[i] = lastV * 3.2; }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer; noise.loop = true;
      const nf = ctx.createBiquadFilter(); nf.type = "lowpass"; nf.frequency.value = scene === "playa" ? 520 : 380;
      const ng = ctx.createGain(); ng.gain.value = 0.5;
      const nlfo = ctx.createOscillator(); nlfo.frequency.value = scene === "playa" ? 0.09 : 0.06;
      const nlfoG = ctx.createGain(); nlfoG.gain.value = 0.3;
      nlfo.connect(nlfoG); nlfoG.connect(ng.gain);
      noise.connect(nf); nf.connect(ng); ng.connect(master);
      noise.start(); nlfo.start();
      audioRef.current = { ctx, master, nodes, noise };
    } catch { /* audio no disponible */ }
  };
  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.ctx.close().catch(() => {}); audioRef.current = null; }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  };
  useEffect(() => {
    if (audioRef.current) audioRef.current.master.gain.value = muted ? 0 : volume * 0.16;
  }, [muted, volume]);

  // ---------- Voice ----------
  const speak = (text: string) => {
    if (!voice || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES"; u.rate = 0.82; u.pitch = 0.95; u.volume = muted ? 0 : 0.95;
    const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith("es"));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  };
  useEffect(() => {
    if (playing && spokenRef.current !== activeIdx) { spokenRef.current = activeIdx; speak(active.text); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, playing]);

  // ---------- Timer ----------
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setElapsed((e) => Math.min(duration, e + 0.1)), 100);
    return () => clearInterval(id);
  }, [playing, duration]);
  useEffect(() => {
    if (elapsed >= duration && started && !finished) {
      setFinished(true); setPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    }
  }, [elapsed, duration, started, finished]);
  useEffect(() => () => stopAudio(), []);

  const togglePlay = () => {
    if (!started) { setStarted(true); startAudio(); spokenRef.current = -1; setPlaying(true); return; }
    if (playing) {
      setPlaying(false);
      audioRef.current?.ctx.suspend();
      if ("speechSynthesis" in window) window.speechSynthesis.pause();
    } else {
      setPlaying(true);
      startAudio();
      if ("speechSynthesis" in window) window.speechSynthesis.resume();
    }
  };
  const restart = () => {
    setElapsed(0); setFinished(false); spokenRef.current = -1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };
  const skip = () => { stopAudio(); onComplete(); };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const bgTop = mix("#33477d", scene === "playa" ? "#ffd9a0" : scene === "prado" ? "#ffe6ad" : "#cdebd2", progress);
  const bgBottom = mix("#5b7bb8", scene === "playa" ? "#ffb59e" : scene === "prado" ? "#a8d8a8" : "#8fd0b8", progress);
  const orbColor = mix("#7ca6ea", "#ffc84d", progress);

  return (
    <div className="rounded-[30px] overflow-hidden shadow-[0_24px_60px_rgba(34,48,79,.2)] relative" style={{ background: `linear-gradient(180deg, ${bgTop} 0%, ${bgBottom} 100%)`, transition: "background 1.2s linear" }}>
      {/* floating light particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="animate-rise absolute rounded-full bg-white/60" style={{ left: `${(i * 71) % 100}%`, bottom: "-4%", width: 5 + (i % 4) * 3, height: 5 + (i % 4) * 3, animationDuration: `${9 + (i % 6) * 3}s`, animationDelay: `${i * 1.3}s` }} />
        ))}
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-white/20 blur-2xl" />
      </div>

      <div className="relative px-5 sm:px-10 py-8 text-white">
        {/* Scene + duration selectors */}
        {!started && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <p className="text-center text-white/85 font-semibold text-sm mb-3">Elige el paisaje al que quieres viajar</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(Object.keys(SCENES) as Scene[]).map((k) => (
                <button key={k} onClick={() => setScene(k)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-extrabold text-sm backdrop-blur transition ${scene === k ? "bg-white text-[#22304f]" : "bg-white/20 text-white hover:bg-white/30"}`}>
                  {SCENES[k].icon} {SCENES[k].label}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-3">
              {[60, 120, 180].map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`px-4 py-1.5 rounded-full text-[13px] font-extrabold backdrop-blur transition ${duration === d ? "bg-[#ffc84d] text-[#5c4303]" : "bg-white/20 text-white hover:bg-white/30"}`}>
                  {d / 60} min{d === 60 ? " · exprés" : ""}
                </button>
              ))}
            </div>
            <p className="text-center text-white/70 text-xs font-semibold mt-3 flex items-center justify-center gap-1.5"><Wind size={13} /> Sonido ambiental: {SCENES[scene].sound} + voz guiada en español 🎧 usa audífonos si puedes</p>
          </motion.div>
        )}

        {/* Breathing orb */}
        <div className="relative mx-auto w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] grid place-items-center my-2">
          <div className="absolute inset-0 rounded-full border-2 border-white/25" />
          <div className="absolute inset-6 rounded-full border border-white/20 animate-spinslow" style={{ borderStyle: "dashed" }} />
          <div className="animate-blob absolute w-[62%] h-[62%] shadow-[0_0_70px_rgba(255,255,255,.45)]"
            style={{ background: `radial-gradient(circle at 35% 32%, #ffffff 0%, ${orbColor} 62%, ${mix("#4f7fd6", "#ff9e6e", progress)} 100%)`, transform: `scale(${playing || finished ? breathScale : 1})`, transition: "transform .9s ease-in-out, background 1.2s linear" }} />
          {/* calm face */}
          <div className="relative z-10 text-center pointer-events-none" style={{ transform: `scale(${playing ? 0.9 + (breathScale - 1) * 0.35 : 1})`, transition: "transform .9s ease-in-out" }}>
            <div className="flex justify-center gap-6 mb-1.5">
              <span className="block w-6 h-3 border-b-[3px] border-[#22304f]/70 rounded-b-full" />
              <span className="block w-6 h-3 border-b-[3px] border-[#22304f]/70 rounded-b-full" />
            </div>
            <span className="block mx-auto w-9 h-4.5 border-b-[3px] border-[#22304f]/70 rounded-b-full" style={{ height: 16 }} />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/90 text-[#22304f] px-4 py-1.5 rounded-full text-[13px] font-extrabold shadow whitespace-nowrap">
            {finished ? "🌿 Has regresado" : playing ? breathPhase : started ? "En pausa" : "Respira con el círculo"}
          </div>
        </div>

        {/* Script */}
        <div className="min-h-[118px] max-w-2xl mx-auto text-center mt-7">
          <AnimatePresence mode="wait">
            <motion.div key={started ? activeIdx : "intro"} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.7 }}>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2 drop-shadow-sm">{finished ? "Bienvenido de vuelta" : started ? active.title : "Un viaje breve hacia adentro"}</h3>
              <p className="text-white/92 text-[15.5px] leading-relaxed font-medium">
                {finished
                  ? "Respira una vez más, abre los ojos despacio… y lleva los colores de tu paisaje al papel. Tu segundo dibujo te espera."
                  : started ? active.text : "Durante los próximos minutos, una voz suave y los sonidos de la naturaleza te guiarán a un lugar de bienestar. Solo sigue el círculo: crece al inhalar, se aquieta al exhalar."}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mt-3">
          <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${progress * 100}%`, transition: "width .3s linear" }} />
          </div>
          <div className="flex justify-between text-[12px] font-bold text-white/85 mt-1.5">
            <span>{fmt(elapsed)}</span><span>{script[activeIdx].title} · {activeIdx + 1} de {script.length}</span><span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          <button onClick={togglePlay} className="flex items-center gap-2 bg-white text-[#22304f] pl-5 pr-6 py-3.5 rounded-full font-extrabold text-[15px] shadow-lg hover:scale-[1.03] active:scale-95 transition">
            {playing ? <Pause size={19} /> : <Play size={19} />} {playing ? "Pausar" : started ? "Continuar" : "Comenzar la meditación"}
          </button>
          {started && !finished && (
            <button onClick={restart} className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-4 py-3 rounded-full font-bold text-sm hover:bg-white/30 transition"><RotateCcw size={16} /> Reiniciar</button>
          )}
          <button onClick={() => { setMuted((m) => !m); if (!muted && "speechSynthesis" in window) window.speechSynthesis.cancel(); }}
            className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-4 py-3 rounded-full font-bold text-sm hover:bg-white/30 transition">
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />} {muted ? "Silencio" : "Sonido"}
          </button>
          <button onClick={() => { setVoice((v) => !v); if (voice && "speechSynthesis" in window) window.speechSynthesis.cancel(); }}
            className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-4 py-3 rounded-full font-bold text-sm hover:bg-white/30 transition">
            {voice ? <Mic size={16} /> : <MicOff size={16} />} Voz {voice ? "activada" : "desactivada"}
          </button>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2.5 rounded-full">
            <Volume2 size={14} />
            <input type="range" min={0} max={100} value={volume * 100} onChange={(e) => setVolume(+e.target.value / 100)} className="w-20 accent-white" />
          </div>
        </div>

        <div className="text-center mt-5 pb-1">
          {finished ? (
            <motion.button initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={() => { stopAudio(); onComplete(); }}
              className="bg-[#ffc84d] text-[#5c4303] px-7 py-3.5 rounded-full font-extrabold shadow-lg hover:scale-105 active:scale-95 transition">
              Estoy listo · Dibujar mi nuevo estado →
            </motion.button>
          ) : (
            <button onClick={skip} className="inline-flex items-center gap-1.5 text-white/85 hover:text-white font-bold text-sm underline underline-offset-4 decoration-white/40">
              <SkipForward size={15} /> Omitir la meditación por ahora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
