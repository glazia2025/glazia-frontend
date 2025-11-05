"use client";

import { CheckCircle, Award, Shield, Thermometer, Volume2, Lock } from "lucide-react";
import Link from "next/link";

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
  const handleDownloadCatalogue = () => {
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

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
       

        {/* Performance Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Performance Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-[#124657}" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Data Sheet Download */}
        <div className="text-center mt-12">
          <div className="bg-blue-50 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Need Detailed Technical Information?
            </h3>
            <p className="text-gray-600 mb-6">
              Download our comprehensive technical data sheets with detailed specifications, 
              installation guides, and performance data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="border border-[#124657} text-[#124657} hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors">
                  Contact Us
                </button>
              </Link>

              <button
                onClick={handleDownloadCatalogue}
                className="border border-[#124657} text-[#124657} hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Download Technical Catalogue
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
