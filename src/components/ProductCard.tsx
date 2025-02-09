import React, { useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  title: string;
  price: number;
  image: string;
  description: string;
}

export default function ProductCard({ title, price, image, description }: ProductCardProps) {
  const productCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the element is in view
    );

    // Start observing the product card
    if (productCardRef.current) {
      observer.observe(productCardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={productCardRef} 
      className="product-card animate-on-scroll group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
            ₹{price}
          </span>
          <button 
            onClick={() => {
              const message = `Hi! I'm interested in ordering ${title} - ₹${price}`;
              window.open(`https://wa.me/+919493543214?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="relative z-10 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 animate-float"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
