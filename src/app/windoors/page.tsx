import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductShowcase from "@/components/ProductShowcase";
import TechnicalSpecs from "@/components/TechnicalSpecs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Windoors Solutions - Glazia",
  description: "Explore our comprehensive range of windoors profiles, hardware, and glazing solutions. Premium quality products for windows and doors.",
};

export default function WindoorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Complete Windoors Solutions
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Premium profiles, hardware, and glazing systems for energy-efficient 
              and durable windows and doors
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-900 font-semibold py-4 px-8 rounded-lg hover:bg-blue-50 transition-colors">
                Browse Products
              </button>
              <button className="border-2 border-white text-white font-semibold py-4 px-8 rounded-lg hover:bg-white hover:text-blue-900 transition-colors">
                Technical Support
              </button>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-transparent to-blue-800"></div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Windoors Systems?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our windoors solutions combine cutting-edge technology with proven performance 
              to deliver exceptional results for residential and commercial projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Energy Efficiency</h3>
              <p className="text-gray-600">
                Advanced thermal break technology and multi-chamber profiles deliver 
                exceptional energy performance with U-values as low as 1.1 W/m²K.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium Quality</h3>
              <p className="text-gray-600">
                All products meet international standards with CE marking, ISO certifications, 
                and comprehensive testing for durability and performance.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Support</h3>
              <p className="text-gray-600">
                Comprehensive technical support, installation guidance, and training 
                programs to ensure perfect results for every project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Overview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Product Range
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From profiles to hardware, glazing to accessories - everything you need 
              for professional windoors installation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Window Profiles",
                description: "UPVC, aluminum, and composite profiles",
                count: "800+ Products",
                color: "bg-blue-500"
              },
              {
                title: "Door Profiles", 
                description: "High-performance door systems",
                count: "650+ Products",
                color: "bg-green-500"
              },
              {
                title: "Hardware Systems",
                description: "Hinges, handles, and operators",
                count: "2100+ Products", 
                color: "bg-orange-500"
              },
              {
                title: "Glazing Solutions",
                description: "Energy-efficient glass systems",
                count: "450+ Products",
                color: "bg-purple-500"
              }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {category.description}
                </p>
                <div className="text-blue-600 font-medium text-sm">
                  {category.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <ProductShowcase />

      {/* Technical Specifications */}
      <TechnicalSpecs />

      {/* Call to Action */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Get expert consultation and custom quotes for your windoors requirements. 
            Our technical team is ready to help you choose the perfect solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-900 font-semibold py-4 px-8 rounded-lg hover:bg-blue-50 transition-colors">
              Get Free Consultation
            </button>
            <button className="border-2 border-white text-white font-semibold py-4 px-8 rounded-lg hover:bg-white hover:text-blue-900 transition-colors">
              Download Catalog
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
