import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import ProductCard from './components/ProductCard';
import Reviews from './components/Reviews';
import About from './components/About';
import Contact from './components/Contact';
//https://images.unsplash.com/photo-1577619590212-fcb85e9818ef?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
const products = [
  {
    title: "Premium Brown Eggs - 6 Pack",
    price: 90,
    image: "https://images.unsplash.com/photo-1617054280194-9eb3deda5325?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Farm-fresh premium brown eggs, perfect for your daily needs."
  },
  {
    title: "Organic Brown Eggs - 12 Pack",
    price: 180,
    image: "https://plus.unsplash.com/premium_photo-1676686126965-cb536e2328c3?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Organic certified brown eggs from free-range hens."
  },
  {
    title: "Jumbo Brown Eggs - 6 Pack",
    price: 120,
    image: "https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Extra-large brown eggs, perfect for baking and cooking."
  },
  {
    title: "Premium Brown Eggs - 30 Pack",
    price: 450,
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80",
    description: "Bulk pack of premium brown eggs for families and businesses."
  }
];

function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
          Our Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div 
              key={index} 
              className="transform hover:scale-105 transition-all duration-300" 
              style={{ 
                marginTop: index % 2 ? '2rem' : '0',
                transform: `rotate(${Math.random() * 2 - 1}deg)`
              }}
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
      <Reviews />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
//exports
