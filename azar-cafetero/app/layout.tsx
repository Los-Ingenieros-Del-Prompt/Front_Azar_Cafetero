// app/layout.tsx
import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

// Configuración de la fuente Josefin Sans
const josefin = Josefin_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "AzarCafetero",
  description: "-Azar - Login",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={josefin.className}>
      <body>{children}</body>
    </html>
  );
}