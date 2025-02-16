import React from 'react';
import ProductCard from '../components/ProductCard';

const products = [
  {
    id: "pack-6", // Add unique IDs for each product
    title: "Premium Brown Eggs - 6 Pack",
    price: 90,
    image: "https://images.unsplash.com/photo-1617054280194-9eb3deda5325?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Farm-fresh premium brown eggs, perfect for your daily needs."
  },
  {
    id: "pack-12", // Add unique IDs for each product
    title: "Organic Brown Eggs - 12 Pack",
    price: 180,
    image: "https://plus.unsplash.com/premium_photo-1676686126965-cb536e2328c3?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Organic certified brown eggs from free-range hens."
  },
  {
    id: "pack-6-jumbo", // Add unique IDs for each product
    title: "Jumbo Brown Eggs - 6 Pack",
    price: 120,
    image: "https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Extra-large brown eggs, perfect for baking and cooking."
  },
  {
    id: "pack-30", // Add unique IDs for each product
    title: "Premium Brown Eggs - 30 Pack",
    price: 450,
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80",
    description: "Bulk pack of premium brown eggs for families and businesses."
  }
];

export function Products() {
  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
            Our Products
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Premium selection of farm-fresh brown eggs for your daily needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div 
              key={product.id} // Use product.id instead of index
              className="transform hover:scale-105 transition-all duration-300 animate-fade-in" 
              style={{ 
                marginTop: index % 2 ? '2rem' : '0',
                transform: `rotate(${Math.random() * 2 - 1}deg)`,
                animationDelay: `${index * 200}ms`
              }}
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}