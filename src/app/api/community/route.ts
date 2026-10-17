import { NextResponse } from "next/server";
import { db } from "@/db";
import { communityPosts } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { seedPosts } from "@/lib/seed";

export const dynamic = "force-dynamic";

async function ensureSeed() {
  const [{ value }] = await db.select({ value: count() }).from(communityPosts);
  if (value === 0) {
    await db.insert(communityPosts).values(seedPosts());
  }
}

export async function GET() {
  try {
    await ensureSeed();
    const posts = await db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt)).limit(60);
    return NextResponse.json({ posts });
  } catch (e) {
    console.error("community GET", e);
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pseudonym, beforeImage, afterImage, reflection, synthesis, beforePalette, afterPalette, metrics } = body ?? {};
    if (!beforeImage || !afterImage || typeof beforeImage !== "string" || typeof afterImage !== "string") {
      return NextResponse.json({ error: "Se requieren ambos dibujos" }, { status: 400 });
    }
    if (beforeImage.length > 3_500_000 || afterImage.length > 3_500_000) {
      return NextResponse.json({ error: "Las imágenes son demasiado grandes" }, { status: 413 });
    }
    const [post] = await db.insert(communityPosts).values({
      pseudonym: String(pseudonym || "Alma anónima").slice(0, 40),
      beforeImage, afterImage,
      reflection: String(reflection || "").slice(0, 600),
      synthesis: String(synthesis || "").slice(0, 1600),
      beforePalette: Array.isArray(beforePalette) ? beforePalette.slice(0, 6) : [],
      afterPalette: Array.isArray(afterPalette) ? afterPalette.slice(0, 6) : [],
      metrics: metrics && typeof metrics === "object" ? metrics : {},
    }).returning();
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    console.error("community POST", e);
    return NextResponse.json({ error: "No se pudo compartir tu experiencia" }, { status: 500 });
  }
}
