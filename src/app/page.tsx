import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import Dashboard from "@/components/Dashboard";
import LandingLeaderboard from "@/components/LandingLeaderboard";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { fetchTopOperatives } from "@/lib/leaderboard";
import { fetchPolymarketMarkets, pickInteresting } from "@/lib/polymarket";

// Refresh the live Polymarket data shown in the previews every few minutes.
export const revalidate = 180;

export default async function Home() {
  const [marketsRaw, operatives] = await Promise.all([
    fetchPolymarketMarkets(120),
    fetchTopOperatives(10),
  ]);
  const markets = pickInteresting(marketsRaw, 14);

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <SocialProof markets={markets} />
      <Dashboard markets={markets} />
      <LandingLeaderboard operatives={operatives} />
      <Features />
      <Footer />
    </main>
  );
}
