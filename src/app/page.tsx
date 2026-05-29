import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import Dashboard from "@/components/Dashboard";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <SocialProof />
      <Dashboard />
      <Features />
      <Footer />
    </main>
  );
}
