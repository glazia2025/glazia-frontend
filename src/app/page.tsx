import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedCategories from "@/components/FeaturedCategories";
import TechnicalSpecs from "@/components/TechnicalSpecs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF' }}>
      <Header />
      <div>
        <Hero />
        {/* Quick Stats */}
      <div className="bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-[500]" style={{ color: '#2F3A4F' }}>5,000+</div>
              <div className="text-sm text-gray-600">Aluminium Products</div>
            </div>
            <div>
              <div className="text-2xl font-[500]" style={{ color: '#2F3A4F' }}>150+</div>
              <div className="text-sm text-gray-600">Profile Systems</div>
            </div>
            <div>
              <div className="text-2xl font-[500]" style={{ color: '#2F3A4F' }}>2,500+</div>
              <div className="text-sm text-gray-600">Projects Completed</div>
            </div>
            <div>
              <div className="text-2xl font-[500]" style={{ color: '#2F3A4F' }}>25+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden whitespace-nowrap bg-[#2F3A4F]">
        <div className="inline-block animate-marquee text-white">
          Free Shipping on Aluminum Orders Above ₹10,00,000<sup>*</sup>
          <span className="mx-6">•</span>
          Free Shipping on Aluminum Orders Above ₹10,00,000<sup>*</sup>
          <span className="mx-6">•</span>
          Free Shipping on Aluminum Orders Above ₹10,00,000<sup>*</sup>
          <span className="mx-6">•</span>
          Free Shipping on Aluminum Orders Above ₹10,00,000<sup>*</sup>
        </div>
      </div>

      <FeaturedCategories />
      <TechnicalSpecs />
        <Footer />
      </div>
    </div>
  );
}
