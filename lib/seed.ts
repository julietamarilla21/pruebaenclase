/** Dibujos semilla generados como SVG para poblar el muro la primera vez. */
function svg(body: string, bg: string) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="440" viewBox="0 0 640 440"><rect width="640" height="440" fill="${bg}"/>${body}</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
}

const P = (pts: string, c: string, w = 7) => `<polyline points="${pts}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const C = (cx: number, cy: number, r: number, c: string, o = 1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="${o}"/>`;
const hill = (d: string, c: string) => `<path d="${d}" fill="${c}"/>`;

export function seedPosts() {
  return [
    {
      pseudonym: "Nube Serena 🌥️",
      reflection: "Llegué dibujando una tormenta y me fui con un amanecer. Ahora, antes de responder correos difíciles, respiro tres veces y busco mi amarillo.",
      synthesis: "Tu mirada se abrió: hay más luz, más calma y más espacio — De una imagen densa y angular pasaste a un paisaje con horizonte y sol; tu percepción ganó aire y matiz.",
      beforeImage: svg(
        P("30,330 120,180 180,290 260,140 340,300 430,170 520,310 610,190", "#22304f", 10) +
        P("50,120 170,220 90,330 240,240 180,380", "#3b4a6b", 7) +
        P("380,80 460,200 400,320 560,240 620,350", "#111827", 8) +
        Array.from({ length: 22 }).map((_, i) => `<line x1="${30 + i * 28}" y1="${20 + (i % 4) * 26}" x2="${16 + i * 28}" y2="${62 + (i % 4) * 26}" stroke="#5b7bb8" stroke-width="3.5"/>`).join(""),
        "#dfe6f2"),
      afterImage: svg(
        C(510, 95, 46, "#ffc84d") + C(510, 95, 66, "#ffe29a", 0.5) +
        hill("M0,290 Q160,225 330,285 T640,270 V440 H0 Z", "#bfe6c8") +
        hill("M0,340 Q200,285 380,340 T640,330 V440 H0 Z", "#7fc8a9") +
        P("120,440 C180,360 250,400 300,320", "#8ecae6", 16) +
        [[90, 380], [190, 355], [300, 395], [420, 365], [540, 390], [600, 350], [250, 330]].map(([x, y], i) => C(x, y, 8, ["#ff8fa3", "#ffb703", "#ff7b54", "#c77dff"][i % 4])).join("") +
        P("80,80 q14,-16 28,0 q14,-16 28,0", "#5a6a8a", 4) + P("160,110 q12,-14 24,0 q12,-14 24,0", "#5a6a8a", 4),
        "#fff3d6"),
      beforePalette: [{ name: "Azul sereno", hex: "#5b7bb8", pct: 38 }, { name: "Negro profundo", hex: "#111827", pct: 27 }, { name: "Gris sereno", hex: "#8a97b5", pct: 21 }, { name: "Azul índigo", hex: "#22304f", pct: 14 }],
      afterPalette: [{ name: "Verde natural", hex: "#7fc8a9", pct: 34 }, { name: "Amarillo luminoso", hex: "#ffc84d", pct: 24 }, { name: "Rosa suave", hex: "#ff8fa3", pct: 16 }, { name: "Azul sereno", hex: "#8ecae6", pct: 14 }],
      metrics: {}, likes: 24,
    },
    {
      pseudonym: "El Faro Quieto",
      reflection: "No sabía que dibujaba siempre cajas. Después de meditar dibujé un mar sin bordes. Esta semana empecé a caminar sin audífonos, solo mirando.",
      synthesis: "Algo se movió por dentro — y tu segundo trazo lo cuenta: de lo cerrado y geométrico a lo ondulante y abierto, con un respiro espacial que antes no existía.",
      beforeImage: svg(
        Array.from({ length: 6 }).map((_, i) => `<rect x="${40 + (i % 3) * 180}" y="${50 + Math.floor(i / 3) * 160}" width="150" height="120" fill="none" stroke="${["#22304f", "#4b5563", "#111827"][i % 3]}" stroke-width="8"/>`).join("") +
        P("40,400 600,400", "#6b7280", 6), "#eef1f6"),
      afterImage: svg(
        hill("M0,150 Q160,105 320,150 T640,140 V440 H0 Z", "#8ecae6") +
        hill("M0,230 Q180,185 340,230 T640,220 V440 H0 Z", "#5b9bd5") +
        hill("M0,320 Q200,275 380,320 T640,315 V440 H0 Z", "#3e7cb1") +
        C(110, 72, 34, "#ffc84d") +
        P("300,80 q14,-16 28,0 q14,-16 28,0", "#5a6a8a", 4) + P("380,105 q12,-14 24,0 q12,-14 24,0", "#5a6a8a", 4), "#fff7e0"),
      beforePalette: [{ name: "Gris sereno", hex: "#6b7280", pct: 36 }, { name: "Azul índigo", hex: "#22304f", pct: 31 }, { name: "Negro profundo", hex: "#111827", pct: 20 }],
      afterPalette: [{ name: "Azul sereno", hex: "#5b9bd5", pct: 44 }, { name: "Amarillo luminoso", hex: "#ffc84d", pct: 18 }, { name: "Verde menta", hex: "#8ecae6", pct: 26 }],
      metrics: {}, likes: 31,
    },
    {
      pseudonym: "Marea Baja 🐚",
      reflection: "Mi primer dibujo era yo, chiquita, en una esquina. En el segundo estoy en el centro, con un jardín. Entendí que también merezco espacio en mis días.",
      synthesis: "La calma llegó como presencia: ocupaste tu lienzo con más confianza. La figura crece, el entorno florece y los cálidos toman el lugar que tenía la distancia.",
      beforeImage: svg(
        C(88, 330, 16, "#22304f") + P("88,346 88,392 M88,360 62,378 M88,360 114,378 M88,392 66,420 M88,392 110,420", "#22304f", 6) +
        P("0,422 640,422", "#9aa7c2", 5) + P("450,60 470,150 430,150 465,255", "#7c8db0", 6), "#e9eef7"),
      afterImage: svg(
        C(320, 150, 30, "#ffcf99") + P("320,180 320,275 M320,205 258,235 M320,205 382,235 M320,275 280,345 M320,275 360,345", "#96452a", 9) +
        hill("M0,350 Q320,300 640,350 V440 H0 Z", "#8fd0b8") +
        [[130, 360], [210, 385], [430, 385], [510, 360], [320, 395]].map(([x, y], i) => C(x, y, 11, ["#ff8fa3", "#ffb703", "#c77dff", "#ff7b54", "#ffffff"][i])).join("") +
        C(540, 80, 40, "#ffc84d"), "#fff3d6"),
      beforePalette: [{ name: "Azul índigo", hex: "#22304f", pct: 34 }, { name: "Azul sereno", hex: "#7c8db0", pct: 33 }, { name: "Gris sereno", hex: "#9aa7c2", pct: 22 }],
      afterPalette: [{ name: "Verde natural", hex: "#8fd0b8", pct: 30 }, { name: "Naranja cálido", hex: "#96452a", pct: 18 }, { name: "Rosa suave", hex: "#ff8fa3", pct: 17 }, { name: "Amarillo luminoso", hex: "#ffc84d", pct: 20 }],
      metrics: {}, likes: 47,
    },
    {
      pseudonym: "Pino Alto 🌲",
      reflection: "Pensé en mi bosque y aparecieron caminos. Antes todo era niebla. Me llevo esto: cuando no vea la salida, primero respiro; el camino aparece después.",
      synthesis: "Tu mirada se abrió: la niebla cromática se ordena en un sendero. Hay dirección sin rigidez: el trazo curvo reemplaza al garabato que buscaba salida.",
      beforeImage: svg(
        P("60,220 C160,120 220,330 320,210 C400,120 460,320 580,200", "#5a6a8a", 9) +
        P("80,300 C200,200 260,390 380,290 C470,215 520,360 600,290", "#3b4a6b", 7) +
        P("120,120 C240,60 320,190 430,110 C500,60 560,150 610,110", "#8a97b5", 6), "#eef1f6"),
      afterImage: svg(
        hill("M0,300 Q320,240 640,300 V440 H0 Z", "#7fc8a9") +
        P("320,440 C300,380 345,340 322,285", "#e8d5ae", 34) +
        [[110, 210], [200, 255], [450, 240], [545, 200]].map(([x, y]) => `<polygon points="${x},${y - 78} ${x - 30},${y} ${x + 30},${y}" fill="#2f7a52"/><rect x="${x - 6}" y="${y}" width="12" height="26" fill="#8a5a44"/>`).join("") +
        C(322, 105, 42, "#ffc84d"), "#eaf6ec"),
      beforePalette: [{ name: "Gris sereno", hex: "#8a97b5", pct: 40 }, { name: "Azul índigo", hex: "#3b4a6b", pct: 35 }, { name: "Azul sereno", hex: "#5a6a8a", pct: 25 }],
      afterPalette: [{ name: "Verde natural", hex: "#2f7a52", pct: 38 }, { name: "Verde menta", hex: "#7fc8a9", pct: 27 }, { name: "Amarillo luminoso", hex: "#ffc84d", pct: 18 }, { name: "Naranja cálido", hex: "#e8d5ae", pct: 12 }],
      metrics: {}, likes: 19,
    },
    {
      pseudonym: "Sol de Mediodía",
      reflection: "Dibujé mi cabeza como un nudo. Después, el nudo era una flor abierta. Creo que así funciona también con mis decisiones: primero desenredar respirando.",
      synthesis: "De la densidad a la apertura radial: el mismo centro, otra geometría. Tu segundo dibujo convierte la tensión en pétalos — la energía no desaparece, se organiza.",
      beforeImage: svg(
        Array.from({ length: 9 }).map((_, i) => `<circle cx="${290 + (i % 3) * 36}" cy="${175 + Math.floor(i / 3) * 36}" r="${52 - i * 3}" fill="none" stroke="${["#22304f", "#4b2e39", "#6d28d9"][i % 3]}" stroke-width="6" opacity="0.85"/>`).join(""), "#e9e6f4"),
      afterImage: svg(
        Array.from({ length: 8 }).map((_, i) => { const a = (i * Math.PI) / 4; const x = 320 + Math.cos(a) * 95, y = 215 + Math.sin(a) * 95; return `<ellipse cx="${x}" cy="${y}" rx="42" ry="26" fill="#ff8fa3" opacity="0.9" transform="rotate(${i * 45} ${x} ${y})"/>`; }).join("") +
        C(320, 215, 44, "#ffc84d") + hill("M0,400 Q320,365 640,400 V440 H0 Z", "#8fd0b8"), "#fff7e8"),
      beforePalette: [{ name: "Violeta contemplativo", hex: "#6d28d9", pct: 33 }, { name: "Azul índigo", hex: "#22304f", pct: 34 }, { name: "Magenta expresivo", hex: "#4b2e39", pct: 22 }],
      afterPalette: [{ name: "Rosa suave", hex: "#ff8fa3", pct: 38 }, { name: "Amarillo luminoso", hex: "#ffc84d", pct: 24 }, { name: "Verde natural", hex: "#8fd0b8", pct: 18 }],
      metrics: {}, likes: 38,
    },
    {
      pseudonym: "Río Lento",
      reflection: "Llegué con prisa hasta en el dibujo. La meditación me enseñó que también se puede llegar fluyendo. Lo estoy probando con mi agenda: menos empujar, más fluir.",
      synthesis: "La velocidad se hizo corriente: las líneas cortadas del inicio se unen en un río continuo. Suavidad del trazo en su punto más alto de la jornada.",
      beforeImage: svg(
        Array.from({ length: 12 }).map((_, i) => `<line x1="${40 + (i % 4) * 150}" y1="${60 + Math.floor(i / 4) * 120}" x2="${150 + (i % 4) * 150}" y2="${110 + Math.floor(i / 4) * 120}" stroke="${["#e63946", "#22304f", "#f77f00"][i % 3]}" stroke-width="8" stroke-linecap="round"/>`).join(""), "#f6efe6"),
      afterImage: svg(
        P("20,120 C150,60 240,190 360,120 C470,55 540,160 625,105", "#8ecae6", 22) +
        P("20,240 C160,180 260,310 380,240 C480,180 545,280 625,230", "#5b9bd5", 22) +
        P("20,355 C170,300 270,410 390,350 C490,300 555,390 625,345", "#3e7cb1", 22) +
        C(90, 52, 26, "#ffc84d"), "#fffaf1"),
      beforePalette: [{ name: "Rojo vital", hex: "#e63946", pct: 33 }, { name: "Azul índigo", hex: "#22304f", pct: 33 }, { name: "Naranja cálido", hex: "#f77f00", pct: 34 }],
      afterPalette: [{ name: "Azul sereno", hex: "#5b9bd5", pct: 40 }, { name: "Verde menta", hex: "#8ecae6", pct: 30 }, { name: "Amarillo luminoso", hex: "#ffc84d", pct: 12 }],
      metrics: {}, likes: 27,
    },
  ];
}
