import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Brands - Glazia",
  description: "Discover our trusted windoors brand partners including Rehau, Schuco, Maco, Roto, and other leading manufacturers.",
};

const brands = [
  {
    name: "Rehau",
    logo: "/brands/rehau.png",
    description: "Leading UPVC profile systems with superior energy efficiency and durability.",
    specialties: ["UPVC Profiles", "Window Systems", "Door Systems"],
    origin: "Germany",
    established: "1948"
  },
  {
    name: "Schuco",
    logo: "/brands/schuco.png", 
    description: "Premium aluminum systems for windows, doors, and facades.",
    specialties: ["Aluminum Profiles", "Curtain Walls", "Security Systems"],
    origin: "Germany",
    established: "1951"
  },
  {
    name: "Maco",
    logo: "/brands/maco.png",
    description: "High-quality hardware solutions for windows and doors.",
    specialties: ["Window Hardware", "Door Hardware", "Locking Systems"],
    origin: "Austria",
    established: "1947"
  },
  {
    name: "Roto",
    logo: "/brands/roto.png",
    description: "Innovative hardware technology for windows and doors.",
    specialties: ["Tilt & Turn Hardware", "Sliding Systems", "Roof Windows"],
    origin: "Germany", 
    established: "1935"
  },
  {
    name: "Guardian Glass",
    logo: "/brands/guardian.png",
    description: "Advanced glazing solutions for energy efficiency and comfort.",
    specialties: ["Double Glazing", "Low-E Glass", "Laminated Glass"],
    origin: "USA",
    established: "1932"
  },
  {
    name: "Pilkington",
    logo: "/brands/pilkington.png",
    description: "World-leading glass manufacturer with innovative glazing solutions.",
    specialties: ["Architectural Glass", "Energy Glass", "Safety Glass"],
    origin: "UK",
    established: "1826"
  },
  {
    name: "Siegenia",
    logo: "/brands/siegenia.png",
    description: "Comprehensive hardware and locking systems for windoors.",
    specialties: ["Multi-Point Locks", "Window Operators", "Door Hardware"],
    origin: "Germany",
    established: "1899"
  },
  {
    name: "Winkhaus",
    logo: "/brands/winkhaus.png",
    description: "Security-focused locking systems and window hardware.",
    specialties: ["Security Hardware", "Locking Systems", "Access Control"],
    origin: "Germany",
    established: "1854"
  }
];

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Trusted Brand Partners
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              We partner with the world's leading windoors manufacturers to bring you 
              the highest quality profiles, hardware, and glazing solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Premium Brand Portfolio
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each brand in our portfolio represents decades of innovation, quality, 
              and reliability in the windoors industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {brands.map((brand, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="p-6">
                  {/* Brand Logo Placeholder */}
                  <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500 font-semibold text-lg">{brand.name}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{brand.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {brand.description}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {brand.specialties.map((specialty, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span><strong>Origin:</strong> {brand.origin}</span>
                    <span><strong>Est:</strong> {brand.established}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3">
                  <button className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                    View Products →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why These Brands */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why We Choose These Partners
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our brand selection criteria ensure you receive only the best windoors solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-gray-600 text-sm">
                All partners meet strict quality standards with international certifications.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">
                Leading-edge technology and continuous product development.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Value</h3>
              <p className="text-gray-600 text-sm">
                Competitive pricing without compromising on quality or performance.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive technical support and training programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Explore Our Brand Portfolio?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Contact our experts to learn more about specific brands and find the perfect 
            windoors solution for your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-900 font-semibold py-4 px-8 rounded-lg hover:bg-blue-50 transition-colors">
              Contact Brand Specialist
            </button>
            <button className="border-2 border-white text-white font-semibold py-4 px-8 rounded-lg hover:bg-white hover:text-blue-900 transition-colors">
              Download Brand Catalog
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
