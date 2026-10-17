import { NextResponse } from "next/server";
import { generateSynthesis } from "@/lib/synthesis";
import type { ImageMetrics, StrokeMeta } from "@/lib/types";

/**
 * Motor de interpretación visual (lado servidor).
 * Recibe las métricas extraídas por visión por computadora en el cliente
 * (paleta, luminosidad, cobertura, bordes, metadatos de trazo) y devuelve
 * una síntesis reflexiva con tono empático basada en psicología del color
 * y semiótica visual. Si en el futuro se configura una clave de un modelo
 * de visión (OPENAI_API_KEY / ANTHROPIC_API_KEY), este es el punto único
 * de integración: el prompt de sistema ya está definido abajo.
 */
export const SYSTEM_PROMPT =
  "Eres un analista visual empático y constructivo, experto en psicología del color y semiótica del trazo. " +
  "Comparas dos dibujos de una misma persona (antes y después de una meditación guiada) y describes, sin diagnosticar, " +
  "cómo cambió su manera de imaginar, sentir y representar su entorno. Tono cálido, analítico y esperanzador, en español.";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      before: ImageMetrics; after: ImageMetrics;
      metaBefore: StrokeMeta; metaAfter: StrokeMeta;
    };
    if (!body.before || !body.after) {
      return NextResponse.json({ error: "Faltan métricas de imagen" }, { status: 400 });
    }
    const synthesis = generateSynthesis(body.before, body.after, body.metaBefore ?? null, body.metaAfter ?? null);
    return NextResponse.json({ synthesis, engine: "serena-vision-interpretive-v1" });
  } catch {
    return NextResponse.json({ error: "No se pudo analizar la experiencia" }, { status: 500 });
  }
}
