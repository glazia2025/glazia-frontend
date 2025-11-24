"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Premium Aluminium Profiles",
    subtitle: "High performance System Aluminium",
    description: "Discover our extensive range of Aluminium. Create energy-efficient and durable Aluminium fenestration products with Glazia's premium profile systems.",
    image: "/hero-slide-1.jpg",
    cta: "Explore Profiles",
    link: "/categories/aluminium-profiles"
  },
  {
    id: 2,
    title: "Professional Hardware",
    subtitle: "Complete Hardware Solutions for Aluminium",
    description: "From hinges and handles to locking systems and operators, find everything you need for professional windoors installation and operation.",
    image: "/hero-slide-2.jpg",
    cta: "Shop Hardware",
    link: "/categories/hardware"
  },
  {
    id: 3,
    title: "Premium Railings",
    subtitle: "Elegant Aluminum Railing Systems",
    description: "Explore our comprehensive range of aluminum railings for balconies, staircases, and architectural applications. Combining safety, durability, and aesthetic appeal.",
    image: "/hero-slide-3.jpg",
    cta: "View Railings",
    link: "/categories/railings"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % slides.length);
  //   }, 5000);

  //   return () => clearInterval(timer);
  // }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #35875C, #7FB549)' }}>
            <div className="w-full h-full bg-gradient-to-r from-gray-900/30 to-transparent"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-start">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                {slide.title}
              </h1>
              <h2 className="text-xl md:text-2xl mb-6 text-green-100">
                {slide.subtitle}
              </h2>
              <p className="text-lg mb-8 text-gray-200 leading-relaxed">
                {slide.description}
              </p>
                <Link
                  href={slide.link}
                  className="inline-block text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-300 text-lg hover-primary-bg-dark"
                  style={{ backgroundColor: '#124657' }}
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
