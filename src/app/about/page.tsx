import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import Link from "next/link";
import TechnicalSpecs from "@/components/TechnicalSpecs";

export const metadata: Metadata = {
  title: "About Glazia - Aluminium Specialists",
  description: "Learn about Glazia's 15+ years of expertise in windoors profiles, hardware, and glazing solutions. Your trusted partner for quality windoors systems.",
};

export default function AboutPage() {
  return (
    <div className="">
      <Header />
      
      <section className="text-white">
        <div className="relative h-64 overflow-hidden">
          <img src="/new-ui/hero.png" alt="Contact Us" className="w-full h-auto" />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute left-4 md:left-24 top-[50%] transform -translate-y-1/2 mx-auto px-4">
            <div className="max-w-4xl mx-auto text-left">
              <h1 className="text-3xl md:text-5xl font-[500] mb-6">
                About Us
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Your trusted partner for premium façade and fenestration profiles and hardware
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                In 2023, two paths from different worlds crossed, one driven by entrepreneurial energy, the other by decades of industry wisdom.<br />
                Navdeep Kamboj, a serial entrepreneur with a background in technology, business, and building scalable ventures, had experienced firsthand the inefficiencies of India’s fragmented façade and fenestration supply chain. He saw an industry that was ready for transformation where innovation, design, and customer experience could replace delays, compromises, and chaos.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                On the other hand, Jaswant Singh, a seasoned industry veteran with 20+ years of experience in aluminium systems, brought deep product knowledge, trusted relationships, and a legacy of excellence in execution.
Their shared belief: India&apos;s building material industry deserves better quality, better service, and better systems.
What began as conversations over projects and possibilities quickly evolved into a shared mission. In 2023, they came together to build Glazia Windoors - a next-generation, tech-enabled platform designed to reimagine the way aluminium, glass, and hardware are sourced, experienced, and delivered.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Glazia stands for precision, innovation, and trust. By blending Navdeep&apos;s strategic vision with Jaswant&apos;s deep industry expertise, the company is setting new benchmarks in the aluminium doors and windows ecosystem from superior finishes and proprietary designs to seamless supply chain orchestration.
Together, they&apos;re not just building a company, they&apos;re building the future of India&apos;s fenestration industry.

              </p>
            </div>
            <div className="rounded-lg h-96 md:h-132 flex items-center overflow-hidden justify-center">
              <img src="/new-ui/about.jpeg" alt="About Us" className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="">
        <div className="">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-[500] mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl max-w-2xl mx-auto">
              Over 15 years of excellence in the windoors industry
            </p>
          </div>

          <div className="bg-[#D9D9D9] backdrop-blur-sm">
            <div className="container mx-auto p-12">
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
        </div>
      </section>

      <TechnicalSpecs />


      <Footer />
    </div>
  );
}
