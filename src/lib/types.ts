export type PaletteItem = {
  name: string;
  hex: string;
  pct: number; // 0-100 of painted pixels
  family: "calido" | "frio" | "natural" | "oscuro" | "neutro" | "luminoso";
  emotion: string;
};

export type StrokeMeta = {
  strokeCount: number;
  totalLength: number;
  sharpTurns: number;
  smoothTurns: number;
  colorsUsed: string[];
  source: "dibujo" | "carga" | "ejemplo" | "mixto";
} | null;

export type ImageMetrics = {
  palette: PaletteItem[];
  coverage: number; // % canvas painted
  openness: number; // % respiro / espacio libre
  brightness: number; // 0-100
  saturation: number; // 0-100
  warmth: number; // 0-100 (100 = muy cálido)
  darkness: number; // 0-100
  pastel: number; // 0-100
  vivid: number; // 0-100
  colorDiversity: number; // 0-100
  edgeDensity: number; // 0-100
  warmPct: number;
  coolPct: number;
  naturalPct: number;
  dominant: string;
};

export type DimensionScore = { label: string; before: number; after: number; hint: string };

export type Synthesis = {
  headline: string;
  paragraphs: string[];
  colorReading: string;
  strokeReading: string;
  spaceReading: string;
  symbolReading: string;
  dimensions: DimensionScore[];
  keywordsBefore: string[];
  keywordsAfter: string[];
  closing: string;
};

export type CommunityPost = {
  id: number;
  pseudonym: string;
  beforeImage: string;
  afterImage: string;
  reflection: string;
  synthesis: string;
  beforePalette: { name: string; hex: string; pct: number }[];
  afterPalette: { name: string; hex: string; pct: number }[];
  likes: number;
  createdAt: string;
};
