import { CheckCircle, Award, Shield, Thermometer, Volume2, Lock } from "lucide-react";

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
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Technical Specifications
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our windoors systems meet the highest international standards for performance, 
            security, and energy efficiency.
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {specifications.map((spec, index) => {
            const IconComponent = spec.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className={`${spec.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {spec.category}
                </h3>
                <div className="space-y-3">
                  {spec.specs.map((item, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-2 last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <span className="text-sm font-bold text-[#124657}">{item.value}</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

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

        {/* Certifications */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Certifications & Standards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">CERT</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{cert.name}</h4>
                <p className="text-sm text-gray-600">{cert.description}</p>
              </div>
            ))}
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
              <button className="bg-[#124657} hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Download Technical Sheets
              </button>
              <button className="border border-[#124657} text-[#124657} hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors">
                Request Custom Specifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
