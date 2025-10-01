import Link from "next/link";
import {
  RectangleHorizontal,
  DoorOpen,
  Settings,
  Lock,
  Layers,
  Wrench,
  Shield,
  Hammer
} from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Windoor Profiles",
    description: "UPVC, aluminum, and composite window & door profiles",
    icon: RectangleHorizontal,
    link: "/categories/windoor-profiles",
    color: "bg-blue-500",
    products: "1,500+ Products"
  },
  {
    id: 2,
    name: "Hardware",
    description: "Complete hardware solutions for windows and doors",
    icon: Settings,
    link: "/categories/hardware",
    color: "bg-green-600",
    products: "2,100+ Products"
  }
];

export default function FeaturedCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Windoor Product Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of windoor profiles and hardware solutions,
            carefully curated for professionals and contractors.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                href={category.link}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
              >
                <div className="p-6">
                  {/* Icon */}
                  <div className={`${category.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="text-blue-600 text-sm font-medium">
                    {category.products}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
            );
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
