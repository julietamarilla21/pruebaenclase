import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  pseudonym: text("pseudonym").notNull().default("Alma anónima"),
  beforeImage: text("before_image").notNull(),
  afterImage: text("after_image").notNull(),
  reflection: text("reflection").notNull().default(""),
  synthesis: text("synthesis").notNull().default(""),
  beforePalette: jsonb("before_palette").$type<{ name: string; hex: string; pct: number }[]>().notNull().default([]),
  afterPalette: jsonb("after_palette").$type<{ name: string; hex: string; pct: number }[]>().notNull().default([]),
  metrics: jsonb("metrics").$type<Record<string, unknown>>().notNull().default({}),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
