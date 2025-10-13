import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedCategories from "@/components/FeaturedCategories";
import FeaturedProducts from "@/components/FeaturedProducts";
import TechnicalSpecs from "@/components/TechnicalSpecs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D2D7DA' }}>
      <Header />
      <div className="pt-[120px]">
        <Navigation />
        <Hero />
      <FeaturedCategories />

      <TechnicalSpecs />
        <Footer />
      </div>
    </div>
  );
}
