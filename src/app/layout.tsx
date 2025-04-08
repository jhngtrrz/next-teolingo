import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teolingo Interlineal | Biblia Hebrea con Traducción Interlineal",
  description: "Explora el Antiguo Testamento en su idioma original hebreo con traducciones interlineales palabra por palabra. Una herramienta de estudio bíblico para estudiantes, teólogos e interesados en textos bíblicos originales.",
  keywords: ["biblia interlineal", "antiguo testamento", "hebreo bíblico", "estudio bíblico", "traducción interlineal", "teología", "textos originales"],
  authors: [
    { name: "Teolingo" }
  ],
  category: "Educación",
  openGraph: {
    title: "Teolingo Interlineal | Biblia Hebrea con Traducción Interlineal",
    description: "Explora el Antiguo Testamento en su idioma original hebreo con traducciones interlineales palabra por palabra.",
    type: "website",
    locale: "es_ES",
    siteName: "Teolingo Interlineal"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
