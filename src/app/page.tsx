import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedCategories from "@/components/FeaturedCategories";
import FeaturedProducts from "@/components/FeaturedProducts";
import TechnicalSpecs from "@/components/TechnicalSpecs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />

      {/* Call to Action for Complete Windoors Solutions */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Explore Our Complete Windoors Range
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Discover our comprehensive collection of windoor profiles and hardware solutions
            designed for modern construction needs.
          </p>
          <Link
            href="/windoors"
            className="inline-block bg-white text-blue-600 font-semibold py-4 px-8 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View Complete Windoors Solutions
          </Link>
        </div>
      </section>

      <TechnicalSpecs />
      <Footer />
    </div>
  );
}
