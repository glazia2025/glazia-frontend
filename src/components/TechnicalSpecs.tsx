"use client";

import { useState } from "react";
import { CheckCircle, Award, Shield, Thermometer, Volume2, Lock, Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AppContext";
import PhoneTrackModal from "./PhoneTrackModal";
import Image from "next/image";

const specifications = [
  {
    category: "Thermal Performance",
    icon: Thermometer,
    color: "bg-red-500",
    specs: [
      { label: "U-Value", value: "1.1 W/m²K", description: "Excellent thermal insulation" },
      { label: "Thermal Break", value: "24mm", description: "Prevents thermal bridging" },
      { label: "Energy Rating", value: "A++", description: "Maximum energy efficiency" }
    ]
  },
  {
    category: "Acoustic Performance",
    icon: Volume2,
    color: "bg-purple-500",
    specs: [
      { label: "Sound Reduction", value: "42 dB", description: "Superior noise insulation" },
      { label: "Frequency Range", value: "100-4000 Hz", description: "Wide spectrum coverage" },
      { label: "Acoustic Rating", value: "Class 4", description: "Highest acoustic class" }
    ]
  },
  {
    category: "Security Features",
    icon: Lock,
    color: "bg-green-500",
    specs: [
      { label: "Security Class", value: "RC2", description: "Burglar resistance certified" },
      { label: "Locking Points", value: "5-Point", description: "Multi-point locking system" },
      { label: "Hardware Grade", value: "Grade 1", description: "Premium security hardware" }
    ]
  },
  {
    category: "Quality Standards",
    icon: Award,
    color: "bg-blue-500",
    specs: [
      { label: "CE Marking", value: "Certified", description: "European conformity" },
      { label: "ISO Standards", value: "9001:2015", description: "Quality management" },
      { label: "Warranty", value: "10 Years", description: "Extended warranty coverage" }
    ]
  }
];

const certifications = [
  {
    name: "CE Marking",
    description: "European Conformity certification for safety and performance",
    logo: "/cert-ce.png"
  },
  {
    name: "ISO 9001:2015",
    description: "Quality Management System certification",
    logo: "/cert-iso.png"
  },
  {
    name: "Energy Star",
    description: "Energy efficiency certification program",
    logo: "/cert-energy-star.png"
  },
  {
    name: "Green Building",
    description: "Sustainable building materials certification",
    logo: "/cert-green.png"
  }
];

const performanceFeatures = [
  {
    title: "Weather Resistance",
    description: "Tested for extreme weather conditions including wind, rain, and temperature variations",
    icon: Shield
  },
  {
    title: "Durability",
    description: "Long-lasting materials with UV resistance and color stability for 25+ years",
    icon: CheckCircle
  },
  {
    title: "Low Maintenance",
    description: "Easy to clean and maintain with minimal upkeep requirements",
    icon: CheckCircle
  },
  {
    title: "Customizable",
    description: "Available in multiple colors, finishes, and configurations to match any design",
    icon: CheckCircle
  }
];

export default function TechnicalSpecs() {
  const { isAuthenticated } = useAuth();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const downloadCatalogue = () => {
    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = '/Glazia Aluminium Catalogue.pdf'; // Path to the PDF file in public folder
    link.download = 'Glazia Aluminium Catalogue.pdf'; // Name for the downloaded file
    link.target = '_blank'; // Open in new tab as fallback

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCatalogue = () => {
    if (isAuthenticated) {
      downloadCatalogue();
      return;
    }

    setIsPhoneModalOpen(true);
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
       

        {/* Performance Features */}
        <div className="mb-16">
          <h3 className="text-3xl font-[500] text-gray-900 text-center mb-8">
            Why Glazia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <ul className="list-disc pl-5 flex flex-col gap-4 justify-between">
              <li>Trusted by architects, fabricators, and homeowners across diverse projects</li>
              <li>Known for consistent performance and refined finishes across installations</li>
              <li>Valued for smooth operation and clean detailing across everyday usage</li>
              <li>Relied on for long-term reliability in residential and large-scale projects</li>
            </ul>
            <img src="/new-ui/why.svg" alt="Why Glazia" />
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-[500] text-gray-900 text-center mb-8">
            What Our Fabricators Have To Say
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="mx-auto w-full rounded-2xl bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-red-500 text-red-500"
                  />
                ))}
              </div>
              <p className="mt-6 font-light tracking-tight text-slate-900">
                Website design did exactly what you said it does. Just what I was looking for.
                Nice work on your website design.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Image
                  src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&q=80"
                  alt="Armando McClure"
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />

                <div className="leading-tight">
                  <div className="text-lg font-extrabold text-slate-900">
                    Armando McClure
                  </div>
                  <div className="text-sm text-slate-500">
                    Senior Markets Architect
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full rounded-2xl bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-red-500 text-red-500"
                  />
                ))}
              </div>
              <p className="mt-6 font-light tracking-tight text-slate-900">
                Website design did exactly what you said it does. Just what I was looking for.
                Nice work on your website design.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Image
                  src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&q=80"
                  alt="Armando McClure"
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />

                <div className="leading-tight">
                  <div className="text-lg font-extrabold text-slate-900">
                    Armando McClure
                  </div>
                  <div className="text-sm text-slate-500">
                    Senior Markets Architect
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full rounded-2xl bg-white p-10 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-red-500 text-red-500"
                  />
                ))}
              </div>
              <p className="mt-6 font-light tracking-tight text-slate-900">
                Website design did exactly what you said it does. Just what I was looking for.
                Nice work on your website design.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Image
                  src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&q=80"
                  alt="Armando McClure"
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />

                <div className="leading-tight">
                  <div className="text-lg font-extrabold text-slate-900">
                    Armando McClure
                  </div>
                  <div className="text-sm text-slate-500">
                    Senior Markets Architect
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Technical Data Sheet Download */}
      </div>
      <div className="bg-[#D6DADE] mt-12 text-center p-12">
          <h3 className="text-3xl font-[500] text-gray-900 text-center mb-2">
            Need Detailed Technical Information?
          </h3>

          <h5 className="text-[#606060] text-sm mb-8">
            Everything you need to evaluate, specify, or implement Glazia systems.
          </h5>

          <div className="bg-[#F7F8F8] grid grid-cols-1 md:grid-cols-2 gap-8 rounded-xl p-8 max-w-3xl mx-auto">

            <div className="flex flex-col items-start text-left gap-12">
              <div className="flex gap-2 justify-start items-center">
                <div className="h-2 w-2 bg-[#EE1C25]" />
                <div className="text-black font-semibold text-[18px]">Talk to Our Team</div>
              </div>
              <div  className="text-[#444E61] text-[18px]">Get expert assistance for product selection, technical queries, or project-specific requirements.</div>
               <Link href="/contact">
                <button className="bg-[#EE1C25] text-white font-medium py-3 px-6 rounded-lg transition-colors">
                  Contact Us
                </button>
              </Link>
            </div>

            <div className="flex flex-col items-start text-left gap-12">
              <div className="flex gap-2 justify-start items-center">
                <div className="h-2 w-2 bg-[#EE1C25]" />
                <div className="text-black font-semibold text-[18px]">Download Technical Brochure</div>
              </div>
              <div className="text-[#444E61] text-[18px]">Access detailed specifications, performance data, and installation guidelines for Glazia products.</div>
               <button  onClick={handleDownloadCatalogue}className="bg-[#EE1C25] text-white font-medium py-3 px-6 rounded-lg transition-colors">
                  Download Catalogue
                </button>
            </div>
          </div>
        </div>

      <PhoneTrackModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={downloadCatalogue}
        reason="download_catalogue"
        title="Download catalogue"
        description="Please share your phone number to download the technical catalogue."
      />
    </section>
  );
}
