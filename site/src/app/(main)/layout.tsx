import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

/** Обычные страницы сайта: общий хедер и футер. Лаборатория (/lab) живёт без них. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <div className="theme-dark bg-bg text-ink">
        <Footer />
      </div>
    </>
  );
}
