import React, { useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from './CartContext'

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
}

export default function ProductCard({ id, title, price, image, description }: ProductCardProps) {
  const productCardRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useCart();
  const cartItem = state.items.find(item => item.id === id);

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

    if (productCardRef.current) {
      observer.observe(productCardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { id, title, price, image }
    });
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity === 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id, quantity: newQuantity }
      });
    }
  };

  return (
    <div 
      ref={productCardRef} 
      className="product-card animate-on-scroll group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
    >
      {/* Image section remains the same */}
      
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
            ₹{price}
          </span>
          
          {!cartItem ? (
            <button 
              onClick={handleAddToCart}
              className="relative z-10 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                className="p-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold">{cartItem.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                className="p-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}