import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", weight: ["400","500","600","700","800"] });

export const metadata: Metadata = {
  title: "Serena — Arte, Meditación y Percepción Consciente",
  description: "Dibuja, medita, vuelve a dibujar y descubre cómo la atención plena transforma tu manera de ver el mundo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${jakarta.variable} antialiased`}>{children}</body>
    </html>
  );
}
