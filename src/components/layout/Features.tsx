import React, { useState, useEffect, useRef } from 'react';
import { Truck, Shield, Leaf, Award } from 'lucide-react';

const features = [
  {
    icon: <Truck className="w-6 h-6" />,
    title: 'Same Day Delivery',
    description: 'Fresh eggs delivered to your doorstep within hours of your order'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Quality Guaranteed',
    description: 'Every egg is carefully inspected for quality and freshness'
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: 'Organic Feed',
    description: 'Our hens are fed with 100% organic feed for the best quality eggs'
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Premium Selection',
    description: 'Hand-picked premium brown eggs from the finest breeds'
  }
];

const TypingText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible, text]);

  return (
    <div ref={elementRef} className="inline-block">
      <span className="border-r-2 border-amber-500 animate-blink">
        {displayText}
      </span>
    </div>
  );
};

export default function Features() {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          } 
        });
      },
      { threshold: 0.5 }
    );

    const featureElements = featuresRef.current?.querySelectorAll('.feature-card');
    featureElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 to-amber-50 dark:from-gray-900 dark:to-amber-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
            <TypingText text="Why Choose Our Eggs?" />
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We take pride in delivering the finest quality brown eggs with unmatched service
          </p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card opacity-0 bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-700/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900 dark:to-amber-800 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 animate-float">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}