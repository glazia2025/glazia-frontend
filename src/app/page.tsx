import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedCategories from "@/components/FeaturedCategories";
import TechnicalSpecs from "@/components/TechnicalSpecs";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Aluminium Profiles, Hardware & Railings | Glazia India",
  description:
    "Premium aluminium window profiles, door hardware and railing systems by Glazia. Trusted aluminium profiles supplier in Gurgaon, India for modern fenestration solutions.",
};
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
      {/* SEO Intro Section */}
      {/* About Glazia Section */}
<section className="bg-gray-50 py-16">
  <div className="container mx-auto px-6 max-w-6xl">

    {/* Heading */}
    <div className="text-center mb-10">
      <h2 className="text-3xl font-semibold text-[#2F3A4F] mb-4">
        About Glazia Aluminium Systems
      </h2>

      <p className="text-gray-600 max-w-3xl mx-auto">
        Glazia is a trusted supplier of premium
        <Link href="/categories/aluminium-profiles" className="text-[#C5161D]  underline hover:no-underline"> Aluminium Profiles</Link>,
          <Link href="/categories/hardware" className="text-[#C5161D]  underline hover:no-underline">Window Hardware</Link>,
           and
           <Link href="/categories/railings" className="text-[#C5161D]  underline hover:no-underline"> Aluminium Railing systems </Link>
             designed for modern architectural applications. Our products are widely used by architects, fabricators, builders, and homeowners for modern windoors installations and aluminium fenestration projects that require reliable and high-performance aluminium systems.
      </p>
    </div>

    {/* Cards */}
    <div className="grid md:grid-cols-3 gap-6">

      <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
        <h3 className="font-semibold text-lg text-[#2F3A4F] mb-2">
          Premium Aluminium Profiles
        </h3>
        <p className="text-gray-600 text-sm">
          Our aluminium window and door profiles are engineered for strength, durability, and energy efficiency, making them ideal for modern residential and commercial buildings.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
        <h3 className="font-semibold text-lg text-[#2F3A4F] mb-2">
          Professional Hardware Solutions
        </h3>
        <p className="text-gray-600 text-sm">
          Glazia offers a wide range of hardware components including handles, hinges, locking systems, and accessories designed for smooth and secure window and door operations.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
        <h3 className="font-semibold text-lg text-[#2F3A4F] mb-2">
          Elegant Aluminium Railings
        </h3>
        <p className="text-gray-600 text-sm">
          Our aluminium railing systems combine safety, durability, and modern design, making them suitable for balconies, staircases, and contemporary architectural spaces.
        </p>
      </div>

    </div>

    {/* Bottom paragraph */}
    <div className="text-center mt-10 max-w-4xl mx-auto">
      <p className="text-gray-600">
        Based in Gurgaon, India, Glazia provides high-quality aluminium fenestration solutions including sliding window profiles, casement systems, hardware components, and railing systems. 
        Our products are designed to meet modern construction standards while delivering long-lasting performance and elegant aesthetics.
      </p>
    </div>

  </div>
</section>

      <TechnicalSpecs />
        <Footer />
      </div>
    </div>
  );
}
