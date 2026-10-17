import { NextResponse } from "next/server";
import { db } from "@/db";
import { communityPosts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isFinite(numId)) return NextResponse.json({ error: "id inválido" }, { status: 400 });
    const [post] = await db.update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} + 1` })
      .where(eq(communityPosts.id, numId))
      .returning({ id: communityPosts.id, likes: communityPosts.likes });
    if (!post) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "No se pudo registrar tu abrazo" }, { status: 500 });
  }
}
