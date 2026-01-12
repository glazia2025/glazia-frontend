import Link from "next/link";
import {
  ArrowRight
} from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Aluminium Profiles",
    image: "/new-ui/card/aluminum.png",
    link: "/categories/aluminium-profiles",
    products: "1,500+ Products"
  },
  {
    id: 2,
    name: "Hardware",
    image: "/new-ui/card/hardware.png",
    link: "/categories/hardware",
    color: "#359496",
    products: "2,100+ Products"
  },
  {
    id: 2,
    name: "Railings",
    image: "/new-ui/card/railing.png",
    link: "/categories/railings",
    color: "#359496",
    products: "2,100+ Products"
  }
];

export default function FeaturedCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-[500] text-gray-900 mb-4">
            Our Products
          </h2>
          <p className="text-md text-gray-600 mx-auto">
            A complete range of aluminium, hardware, and railing systems for contemporary design.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[90vw] mx-auto">
          {categories.map((category) => {
            return (
              <Link
                key={`${category.id}-${category.name}`}
                href={category.link}
                className="group bg-white relative rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover-primary-border"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute flex justify-between items-center bottom-0 left-0 w-full p-6 text-white">
                  <div>
                     <h3 className="text-xl text-white font-semibold text-gray-900 mb-2">
                    {category.name}
                    </h3>
                    <div className="text-sm font-medium">
                      {category.products}
                    </div>
                  </div>
                  <ArrowRight className="w-8 h-8 text-white" />
                 
                </div>


              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
