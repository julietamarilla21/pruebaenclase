import type { ImageMetrics, StrokeMeta, Synthesis, DimensionScore } from "./types";

const clamp = (n: number, a = 4, b = 97) => Math.max(a, Math.min(b, Math.round(n)));

function dimensions(b: ImageMetrics, a: ImageMetrics, sb: StrokeMeta, sa: StrokeMeta): DimensionScore[] {
  const smooth = (m: ImageMetrics, s: StrokeMeta) => {
    if (s && s.smoothTurns + s.sharpTurns > 4) {
      return clamp((s.smoothTurns / (s.smoothTurns + s.sharpTurns)) * 100);
    }
    return clamp(100 - m.edgeDensity * 0.9);
  };
  const serenity = (m: ImageMetrics) => clamp(m.pastel * 0.45 + m.brightness * 0.25 + (100 - m.darkness) * 0.2 + m.naturalPct * 0.35);
  return [
    { label: "Luminosidad", before: clamp(b.brightness), after: clamp(a.brightness), hint: "Cuánta luz entra en la escena" },
    { label: "Calidez cromática", before: clamp(b.warmth), after: clamp(a.warmth), hint: "Del tono frío al abrazo cálido" },
    { label: "Apertura espacial", before: clamp(b.openness), after: clamp(a.openness), hint: "Espacio para respirar dentro del lienzo" },
    { label: "Suavidad del trazo", before: smooth(b, sb), after: smooth(a, sa), hint: "Curvas orgánicas frente a ángulos tensos" },
    { label: "Diversidad de color", before: clamp(b.colorDiversity), after: clamp(a.colorDiversity), hint: "Riqueza de matices con los que miras" },
    { label: "Serenidad cromática", before: serenity(b), after: serenity(a), hint: "Pasteles, naturaleza y equilibrio visual" },
  ];
}

function keywords(m: ImageMetrics, s: StrokeMeta): string[] {
  const k: string[] = [];
  if (m.darkness > 45) k.push("densidad", "contención");
  if (m.warmth > 58) k.push("calidez", "acogida");
  if (m.coolPct > 38) k.push("distancia serena", "reflexión");
  if (m.naturalPct > 25) k.push("naturaleza", "raíz");
  if (m.openness > 55) k.push("respiro", "amplitud");
  if (m.coverage > 55) k.push("intensidad", "presencia plena");
  if (m.pastel > 35) k.push("ternura", "suavidad");
  if (m.vivid > 40) k.push("vitalidad", "expresión");
  if (m.brightness > 62) k.push("claridad", "luz");
  if (s && s.sharpTurns > s.smoothTurns * 1.4 && s.sharpTurns > 8) k.push("tensión", "urgencia");
  if (s && s.smoothTurns > s.sharpTurns * 1.4 && s.smoothTurns > 8) k.push("fluidez", "onda");
  if (k.length < 3) k.push("introspección", "búsqueda", "presencia");
  return Array.from(new Set(k)).slice(0, 4);
}

const fmt = (n: number) => `${Math.round(n)}%`;

export function generateSynthesis(b: ImageMetrics, a: ImageMetrics, sb: StrokeMeta, sa: StrokeMeta): Synthesis {
  const dims = dimensions(b, a, sb, sa);
  const dWarm = a.warmth - b.warmth;
  const dBright = a.brightness - b.brightness;
  const dOpen = a.openness - b.openness;
  const dDark = a.darkness - b.darkness;
  const dCover = a.coverage - b.coverage;
  const dDiv = a.colorDiversity - b.colorDiversity;

  const improved = (dWarm > 4 ? 1 : 0) + (dBright > 4 ? 1 : 0) + (dOpen > 4 ? 1 : 0) + (dDark < -4 ? 1 : 0);
  const headline =
    improved >= 3
      ? "Tu mirada se abrió: hay más luz, más calma y más espacio"
      : improved >= 1
        ? "Algo se movió por dentro — y tu segundo trazo lo cuenta"
        : dCover > 8
          ? "La calma llegó como presencia: ocupaste tu lienzo con más confianza"
          : "Un cambio sutil, como los que primero se sienten y luego se ven";

  const bTop = b.palette[0];
  const aTop = a.palette[0];

  const colorReading = `En tu primer dibujo domina ${bTop ? `el ${bTop.name.toLowerCase()} (${fmt(bTop.pct)} de lo pintado)` : "una gama contenida"}, con ${fmt(b.coolPct)} de tonos fríos y ${fmt(b.warmPct)} de cálidos. ${
    b.darkness > 40
      ? "La presencia de tonos oscuros suele hablar de peso, de pensamientos que ocupan espacio y piden ser escuchados."
      : b.coolPct > b.warmPct
        ? "Esa frialdad cromática sugiere distancia reflexiva: mirar lo que sientes desde un paso atrás."
        : "Ya había una base cálida en tu mirada, un fondo de vitalidad esperando ordenarse."
  } En el segundo, ${aTop ? `el ${aTop.name.toLowerCase()}` : "la nueva gama"} toma el protagonismo (${aTop ? fmt(aTop.pct) : ""}) y la calidez ${
    dWarm > 6 ? `crece ${fmt(dWarm)}: desde la psicología del color, los cálidos se asocian a cercanía, seguridad y disposición al encuentro.`
    : dWarm < -6 ? `cede paso a tonos más frescos: a veces la calma no es calor, sino agua clara — serenidad, limpieza mental, orden.`
    : "se mantiene en equilibrio, lo que habla de estabilidad: no necesitaste cambiar de mundo, sino habitarlo de otro modo."
  } ${a.pastel > b.pastel + 8 ? "Aparecen además más tonos pastel, señal de ternura y de una relación más amable contigo." : ""} ${a.naturalPct > 22 ? "Los verdes y tonos naturales conectan tu imagen con el entorno que visualizaste: raíz, crecimiento, vida que sigue." : ""}`.replace(/\s+/g, " ").trim();

  const smoothTxt = (s: StrokeMeta, m: ImageMetrics) =>
    s && s.smoothTurns + s.sharpTurns > 4
      ? s.sharpTurns > s.smoothTurns
        ? `trazos con ${s.sharpTurns} giros bruscos frente a ${s.smoothTurns} suaves — la mano cambia de dirección como una mente que busca salida`
        : `trazos predominantemente curvos (${s.smoothTurns} giros suaves frente a ${s.sharpTurns} bruscos) — la mano fluye como sigue una respiración`
      : m.edgeDensity > 42
        ? "contornos muy marcados y cambios frecuentes de dirección, un gesto más angular y defensivo"
        : "contornos más continuos y orgánicos, un gesto que no necesita protegerse tanto";

  const strokeReading = `El primer dibujo muestra ${smoothTxt(sb, b)}. El segundo, en cambio, presenta ${smoothTxt(sa, a)}. ${
    sa && sb
      ? sa.strokeCount < sb.strokeCount
        ? `También usaste menos trazos (${sb.strokeCount} → ${sa.strokeCount}): cuando la mente se aquieta, necesita decir menos para decir lo importante.`
        : sa.strokeCount > sb.strokeCount
          ? `Y te permitiste más trazos (${sb.strokeCount} → ${sa.strokeCount}): la calma, en ti, se expresó como expansión creativa, no como silencio.`
          : "La cantidad de trazos se mantiene, pero su cualidad cambia — como quien dice lo mismo, por fin, en voz baja."
      : "Ese tránsito — de lo que corta a lo que curva — es uno de los signos visuales más claros de regulación emocional."
  }`;

  const spaceReading = `Tu primer lienzo estaba ocupado en un ${fmt(b.coverage)}; el segundo, en un ${fmt(a.coverage)}. ${
    dOpen > 8
      ? "Dejaste más espacio en blanco, y en semiótica visual el vacío no es ausencia: es respiro, horizonte, la sensación de que cabe algo más que lo urgente."
      : dOpen < -8
        ? "Llenaste más el espacio, pero llenarlo tras meditar no es saturar: suele ser apropiación serena — «este lugar también es mío», sin necesidad de defenderse."
        : "La ocupación apenas cambia, lo que sugiere que tu transformación fue más de tono que de territorio: el mismo mundo, otra luz."
  } La luminosidad ${dBright > 5 ? `sube ${fmt(dBright)}` : dBright < -5 ? `baja ${fmt(-dBright)} hacia una penumbra más íntima y contemplativa` : "se mantiene estable, en un punto de equilibrio visual"}.`;

  const symbolReading = `Si leemos tus dos imágenes como dos frases del mismo diario, la primera parece decir «así llegué» y la segunda «así me quedo un rato más». ${
    dDiv > 8
      ? `La diversidad cromática crece (${fmt(b.colorDiversity)} → ${fmt(a.colorDiversity)}): percibir más matices es, literalmente, percibir más mundo. La atención plena amplía el repertorio con el que interpretamos lo que nos pasa.`
      : dDiv < -8
        ? `La paleta se simplifica (${fmt(b.colorDiversity)} → ${fmt(a.colorDiversity)}): menos colores, mejor elegidos. Hay una calma que consiste en quedarse con lo esencial.`
        : "Tu repertorio de color se conserva, pero se reordena: no sumaste elementos, cambiaste su relación. Eso es exactamente lo que entrena la meditación."
  } ${a.dominant ? `El tono que ahora te representa —${a.dominant.toLowerCase()}— puede convertirse en un ancla: búscalo esta semana en tu entorno y deja que te devuelva a este estado.` : ""}`;

  const paragraphs = [
    `Antes de meditar, tu imagen hablaba en clave de ${keywords(b, sb).join(", ")}. No es un juicio: es el retrato honesto de un momento, y atreverse a dibujarlo ya es una forma de escucha.`,
    `Después de respirar y habitar tu paisaje interior, el lenguaje cambia a ${keywords(a, sa).join(", ")}. ${improved >= 2 ? "El paso de una imagen a otra muestra lo que la investigación en atención plena describe una y otra vez: cuando el sistema nervioso se regula, la percepción se ensancha — vemos más matices, dejamos más aire, elegimos tonos que acogen." : "Aunque el cambio sea sutil, está: en la relación entre colores, en cómo la mano decidió moverse. La percepción no siempre grita; a veces susurra primero."}`,
    `Queda una pregunta hermosa para llevarte: si en pocos minutos tu manera de imaginar un paisaje pudo cambiar así, ¿qué más podría suavizarse en tu día si te regalas ese mismo respiro antes de decidir, de responder, de crear?`,
  ];

  return {
    headline,
    paragraphs,
    colorReading,
    strokeReading,
    spaceReading,
    symbolReading,
    dimensions: dims,
    keywordsBefore: keywords(b, sb),
    keywordsAfter: keywords(a, sa),
    closing: "Este análisis es una lectura reflexiva a partir del color, el trazo y el espacio de tus dibujos — un espejo amable, no un diagnóstico. Lo más valioso ya ocurrió: te detuviste, respiraste y miraste dos veces.",
  };
}
