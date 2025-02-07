import React, { useRef, useEffect } from 'react';
import { Egg, Car as Farm, Users, Heart } from 'lucide-react';
import bes from './bes_nbg.gif';
export default function About() {
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = sectionsRef.current?.querySelectorAll('.animate-on-scroll');
    sections?.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={sectionsRef}>
        <div className="text-center mb-16 animate-on-scroll opacity-0">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
            Our Story
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Delivering premium brown eggs since 2020, we're committed to quality, sustainability, and your health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="animate-on-scroll opacity-0">
            <img
              src={bes}
              alt="Our Farm"
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            />
            {/* <video
                  src={bes_vid}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full rounded-2xl object-cover"
                /> */}
          </div>
          <div className="flex flex-col justify-center animate-on-scroll opacity-0">
            <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
              Farm to Table Excellence
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our journey began with a simple mission: to provide the freshest, highest-quality brown eggs to Indian households. We believe in sustainable farming practices, ethical treatment of our hens, and delivering excellence in every egg.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Egg className="w-6 h-6" />, text: "100% Natural" },
                { icon: <Farm className="w-6 h-6" />, text: "Ethical Farming" },
                { icon: <Users className="w-6 h-6" />, text: "Local Community" },
                { icon: <Heart className="w-6 h-6" />, text: "Happy Hens" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Our Process",
              description: "From carefully selected feed to rigorous quality checks, every step is monitored for excellence.",
              image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&q=80"
            },
            {
              title: "Sustainability",
              description: "We implement eco-friendly practices and use sustainable packaging to minimize our environmental impact.",
              image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80"
            },
            {
              title: "Community",
              description: "Supporting local farmers and contributing to rural development is at the heart of our mission.",
              image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80"
            }
          ].map((section, index) => (
            <div
              key={index}
              className="animate-on-scroll opacity-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              <img
                src={section.image}
                alt={section.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
                  {section.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}