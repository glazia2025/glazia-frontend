import { Metadata } from "next";
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Product Categories | Aluminium Profiles & Hardware by Glazia",
  description:
    "Browse Glazia’s complete range of aluminium profiles and hardware products. Explore premium window and door systems designed for modern fenestration solutions.",
};

export default function CategoriesPage() {
  const categories = [
    {
      id: 'aluminium-profiles',
      name: 'Aluminium Profiles',
      description: 'UPVC, Aluminum, and Composite window & door profile systems manufactured by Glazia',
      productCount: 1500,
      image: '/api/placeholder/300/200',
      subcategories: ['UPVC Profiles', 'Aluminum Profiles', 'Composite Profiles', 'Thermal Break Systems', 'Window Profiles', 'Door Profiles']
    },
    {
      id: 'hardware',
      name: 'Hardware',
      description: 'Complete hardware solutions for windows and doors manufactured by Glazia',
      productCount: 2100,
      image: '/api/placeholder/300/200',
      subcategories: ['Window Hardware', 'Door Hardware', 'Handles & Locks', 'Hinges & Stays', 'Operators & Mechanisms', 'Security Systems']
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-[#124657] transition-colors">
                Back to Home
              </Link>
            </nav>
          </div>
        </div>
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-[#124657}">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Categories</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Product Categories</h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Explore our comprehensive range of aluminium profiles and hardware solutions manufactured by Glazia
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link
                  href="/contact"
                  className="border border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-[#124657} transition-colors"
                >
                  Get Quote
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from our two main product categories to find exactly what you need for your windoors project
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                >
                  <div className="aspect-w-16 aspect-h-10 bg-gray-200">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-[#124657} font-semibold text-xl">{category.name}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#124657} transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {category.description}
                    </p>

                    <div className="mb-4">
                      <span className="text-[#124657} font-semibold text-lg">
                        {category.productCount}+ Products
                      </span>
                    </div>

                    <div className="space-y-1">
                      {category.subcategories.slice(0, 4).map((sub, index) => (
                        <div key={index} className="text-xs text-gray-500">
                          • {sub}
                        </div>
                      ))}
                      {category.subcategories.length > 4 && (
                        <div className="text-xs text-gray-500">
                          + {category.subcategories.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 group-hover:bg-blue-50 transition-colors">
                    <span className="text-[#124657} font-medium group-hover:text-blue-700">
                      View Products →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Glazia Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Glazia</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Experience the difference with our premium aluminium solutions manufactured to the highest standards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#124657} font-bold text-xl">Q</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600">
                  All our products are manufactured using the finest materials and latest technology to ensure superior quality and durability.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Certified Products</h3>
                <p className="text-gray-600">
                  Our aluminium profiles and hardware meet international standards and are certified for performance and safety.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-xl">24/7</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h3>
                <p className="text-gray-600">
                  Get professional technical support and guidance from our experienced team for all your windoors projects.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/about"
                className="inline-block bg-[#124657} hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Learn More About Glazia
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
