import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import ProductCard from './ProductCard';
import { supabase } from '../../lib/supabase';
import { useCart,CartContext } from '../context/CartContext';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  is_promo?: boolean;
}

export function Products() {
  const { state } = useCart(); // Add this line to access cart state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-900">
      {state.items.length > 0 && !isCartOpen && (
        <>
          {/* Desktop notification */}
          <div className="hidden md:block absolute top-20 right-[200px] z-30"> {/* Reduced z-index to be below cart */}
            <div className="relative">
              <div className="absolute -top-3 right-36 w-4 h-4 bg-amber-100 dark:bg-amber-900 transform rotate-45" />
              <div className="relative bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 
                          px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 
                          animate-bounce">
              <span className="text-sm whitespace-nowrap flex items-center gap-1">
                {state.items.length} products in cart - Click <ShoppingCart className="w-4 h-4 ml-1" /> to checkout! 
              </span>
              </div>
            </div>
          </div>

          {/* Mobile notification */}
          <div className="md:hidden absolute top-[80px] right-[16px] z-51"> {/* Reduced z-index to be below cart */}
            <div className="viewport">
              <div className="absolute -top-3 right-20 w-4 h-4 bg-amber-100 dark:bg-amber-900 transform rotate-45" />
              <div className="relative bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 
                          px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 
                          animate-bounce">
              <span className="text-sm whitespace-nowrap flex items-center gap-1">
                {state.items.length} products in cart - Click<ShoppingCart className="w-4 h-4 ml-1" /> to checkout! 
              </span>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
            Our Products
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Premium selection of farm-fresh brown eggs for your daily needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id}
              className="transform transition-all duration-300 animate-fade-in"
            >
              <ProductCard {...product} isPromo={product.is_promo} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}