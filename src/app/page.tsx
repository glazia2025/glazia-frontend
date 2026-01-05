import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedCategories from "@/components/FeaturedCategories";
import TechnicalSpecs from "@/components/TechnicalSpecs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D2D7DA' }}>
      <Header />
      <div className="pt-[120px]">
        <Navigation />
        <Hero />
        {/* Quick Stats */}
      <div className="bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: '#124657' }}>5,000+</div>
              <div className="text-sm text-gray-600">Aluminium Products</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#124657' }}>150+</div>
              <div className="text-sm text-gray-600">Profile Systems</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#124657' }}>2,500+</div>
              <div className="text-sm text-gray-600">Projects Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#124657' }}>25+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
      <FeaturedCategories />
      <TechnicalSpecs />
        <Footer />
      </div>
    </div>
  );
}
