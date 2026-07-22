import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope, JetBrains_Mono, Golos_Text, IBM_Plex_Mono } from "next/font/google";
import { LeadProvider } from "@/components/lead/lead-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
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

// Баннер-стиль: тяжёлый геометрический гротеск для заголовков + IBM Plex Mono
const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-golos",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
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
    <html
      lang="ru"
      className={`${unbounded.variable} ${manrope.variable} ${jbMono.variable} ${golos.variable} ${plexMono.variable}`}
    >
      <body>
        <SmoothScroll />
        <LeadProvider>{children}</LeadProvider>
      </body>
    </html>
  );
}
