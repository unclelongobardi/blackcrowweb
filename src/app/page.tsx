import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import Dashboard from "@/components/Dashboard";
import LandingLeaderboard from "@/components/LandingLeaderboard";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { fetchPolymarketMarkets, pickInteresting } from "@/lib/polymarket";

// Refresh the live Polymarket data shown in the previews every few minutes.
export const revalidate = 180;

export default async function Home() {
  const markets = pickInteresting(await fetchPolymarketMarkets(120), 14);

  return (
    <main className="relative">
      <Navbar />
      <Hero markets={markets} />
      <SocialProof markets={markets} />
      <Dashboard markets={markets} />
      <LandingLeaderboard />
      <Features />
      <Footer />
    </main>
  );
}
