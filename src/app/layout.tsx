import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"

const openDyslexicRegular = localFont({
  src: "../../public/OpenDyslexic-Regular.woff2",
  variable: "--font-opendyslexic-regular",
});

const openDyslexicBold = localFont({
  src: "../../public/OpenDyslexic-Bold.woff2",
  variable: "--font-opendyslexic-bold",
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
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${openDyslexicRegular.variable} ${openDyslexicBold.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="Dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
