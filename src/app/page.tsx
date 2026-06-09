import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import Dashboard from "@/components/Dashboard";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { fetchPolymarketMarkets } from "@/lib/polymarket";

// Refresh the live Polymarket data shown in the previews every few minutes.
export const revalidate = 180;

export default async function Home() {
  const markets = await fetchPolymarketMarkets(14);

  return (
    <main className="relative">
      <Navbar />
      <Hero markets={markets} />
      <SocialProof markets={markets} />
      <Dashboard markets={markets} />
      <Features />
      <Footer />
    </main>
  );
}
