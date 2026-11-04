import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Portfolio } from "@/components/marketing/Portfolio";
import { Pricing } from "@/components/marketing/Pricing";
import { Contact } from "@/components/marketing/Contact";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Portfolio />
        <Features />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
