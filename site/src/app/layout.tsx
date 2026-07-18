import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LeadProvider } from "@/components/lead/lead-provider";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  variable: "--font-unbounded",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Тимченко.про - инженерные системы дома под ключ в Краснодарском крае",
  description:
    "Проектируем, производим и монтируем инженерные системы частных домов: водоснабжение, канализация, отопление, котельные, электрика, вентиляция, кондиционирование. Своё производство готовых узлов. Краснодар, Сочи, Геленджик.",
};

export const viewport: Viewport = {
  themeColor: "#0e1113",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${manrope.variable} ${jbMono.variable}`}>
      <body>
        <LeadProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </LeadProvider>
      </body>
    </html>
  );
}
