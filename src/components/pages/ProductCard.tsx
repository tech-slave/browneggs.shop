import React, { useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext'
import { usePromoOrders } from '../../hooks/usePromoOrders';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  isPromo?: boolean; // Add this prop
}

export default function ProductCard({ id, title, price, image, description, isPromo }: ProductCardProps) {
  const { purchasedPromoItems, loading: promoCheckLoading } = usePromoOrders();
  // Check if this product (if it's a promo) has been purchased before
  const hasOrderedPromo = isPromo && purchasedPromoItems.includes(id);
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
      console.log('Add to cart attempt:', {
        productId: id,
        isPromo,
        alreadyPurchased: purchasedPromoItems.includes(id)
      });
    
      if (isPromo && hasOrderedPromo) {
        console.log('Blocking promo purchase - already ordered');
        return;
      }
    
      // For promo items, force quantity to 1
      dispatch({
        type: 'ADD_ITEM',
        payload: { id, title, price, image, isPromo }  // Pass isPromo to cart
      });
    };
    
    const handleUpdateQuantity = (newQuantity: number) => {
      // Prevent increasing quantity for promo items
      if (isPromo && newQuantity > 1) {
        return;
      }
    
      if (newQuantity <= 0) {
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
            <h3 className="text-sm font-semibold mb-0.5 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent leading-tight">
              {(() => {
                const words = title.split(' ');
                const packIndex = words.findIndex(word => 
                  word.toLowerCase().includes('pack') && words[words.indexOf(word) - 1]?.match(/^\d+/)
                );
                
                return words.map((word, index) => {
                  if (index === packIndex - 1) {
                    // Combine number with 'pack'
                    return (
                      <React.Fragment key={index}>
                        {index > 0 && ' '}
                        <>
                          <br className="block sm:hidden" />
                          <span>{word} {words[index + 1]}</span>
                        </>
                      </React.Fragment>
                    );
                  } else if (index === packIndex) {
                    // Skip 'pack' as it's already rendered
                    return null;
                  } else {
                    // Render other words normally
                    return (
                      <React.Fragment key={index}>
                        {index > 0 && ' '}
                        {word}
                      </React.Fragment>
                    );
                  }
                });
              })()}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 leading-tight">
              {description}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-1">
          <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
            ₹{price}
          </span>
          
          {isPromo && hasOrderedPromo ? (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Offer Redeemed
            </span>
          ) : !cartItem ? (
            <button 
              onClick={handleAddToCart}
              disabled={promoCheckLoading}
              className={`relative z-10 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-2 py-1 rounded-full text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1 ${
                promoCheckLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ShoppingCart size={14} />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                className="p-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="w-5 text-center text-xs font-semibold">
                {cartItem.quantity}
              </span>
              {!isPromo && (
                <button
                  onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                  className="p-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}