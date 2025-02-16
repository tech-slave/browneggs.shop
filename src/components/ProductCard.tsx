import React, { useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from './CartContext'

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  isPromo?: boolean; // Add this prop
}

export default function ProductCard({ id, title, price, image, description, isPromo }: ProductCardProps) {
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
      payload: { id, title, price, image, quantity: 1  }
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
      className={`product-card animate-on-scroll group relative overflow-hidden rounded-lg ${
        isPromo 
          ? 'bg-gradient-to-br from-amber-500/10 via-blue-500/10 to-blue-500/10 dark:from-amber-400/20 dark:via-blue-600/20 dark:to-pink-400/20 shadow-pink-900/20 hover:shadow-amber-500/30' 
          : 'bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-700/50'
      } shadow hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-[140px]`}
    >
      <div className="flex h-full"> 
        {/* Image section - maintain current width */}
        <div className="relative overflow-hidden min-w-[140px] w-[140px]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className={`absolute inset-0 ${
            isPromo 
              ? 'bg-gradient-to-r from-transparent via-amber-500/10 to-blue-500/20' 
              : 'bg-gradient-to-r from-transparent to-blue/10'
          }`} />
          {isPromo && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">
              EarlyBird Offer
            </div>
          )}
        </div>
        
        {/* Content section - adjusted padding and spacing */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0"> {/* Added min-w-0 and reduced padding */}
          <div>
            <h3 className="text-sm font-semibold mb-0.5 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent truncate">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 leading-tight">
              {description}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-1"> {/* Reduced margin-top */}
            <span className="text-base font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
              ₹{price}
            </span>
            
            {!cartItem ? (
              <button 
                onClick={handleAddToCart}
                className="relative z-10 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-2 py-1 rounded-full text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1"
              >
                <ShoppingCart size={14} />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                  className="p-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center text-xs font-semibold">{cartItem.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                  className="p-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
);
}