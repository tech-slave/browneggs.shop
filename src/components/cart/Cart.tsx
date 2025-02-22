import React,{useState,useEffect} from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CheckoutPage from './Checkout';
import { Link } from "react-router-dom";
import { useLoading } from '../context/LoadingContext'; // Add this import at the top
import { CartItem } from '../context/CartContext'; // Add this import for CartItem
import { lockScroll, unlockScroll } from '../../utils/scrollLock';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const calculateDeliveryFee = (items: CartItem[]): number => {
  // Check if any promo items exist in cart
  return items.some(item => item.isPromo) ? 20 : 0;
};

export default function Cart({ isOpen, onClose }: CartProps) {
  const { state, dispatch } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const { loading: isLoading, setLoading } = useLoading(); // Destructure loading and rename it to isLoading
  const calculatedTotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    if (isOpen || showCheckout) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll(); // Cleanup on unmount
    };
  }, [isOpen, showCheckout]);

  useEffect(() => {
    // Verify cart total matches calculated total
    if (Math.abs(calculatedTotal - state.total) > 0.01) {
      // Fix the total if there's a mismatch
      dispatch({
        type: 'SET_ITEMS',
        payload: state.items
      });
    }
  }, [state.items, state.total, calculatedTotal, dispatch]);

  // Update price display to show 2 decimal places
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const handleCheckout = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 4500));
    setLoading(false);
    // Pass total with delivery fee to checkout
    setShowCheckout(true);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
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
    <>
      {/* Cart Modal */}
      <div 
        className={`fixed inset-0 z-[60] ${!isOpen || showCheckout ? 'pointer-events-none' : ''}`}
      >
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={onClose}
        />
        
        {/* Cart Content */}
        <div 
          className={`fixed top-0 right-0 w-full max-w-md h-screen bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-none p-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingBag />
                Your Cart
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X />
              </button>
            </div>
          </div>

          {state.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <ShoppingBag size={48} className="text-gray-400 mb-2" />
              <p className="text-gray-500">
                Your cart is empty.{" "}
                <Link 
                  to="/products" 
                  className="text-blue-500 hover:underline"
                  onClick={onClose} // Add onClick handler to close cart
                >
                  Click here
                </Link>{" "}
                to start ordering.
              </p>
            </div>
          ) : (
            <>
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="p-4 space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold dark:text-white">{item.title}</h3> {/* Add the title here */}
                        <p className="text-lg font-bold dark:text-white">₹{item.price * item.quantity}</p> {/* Calculate total price */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-semibold dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatPrice(state.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Charges:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatPrice(calculateDeliveryFee(state.items))}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t dark:border-gray-700">
                    <span className="text-blue-600 dark:text-blue-400">Sub Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {formatPrice(state.total + calculateDeliveryFee(state.items))}
                    </span>
                  </div>
                </div>
                  {/* Add this prompt section */}
                  {state.items.length > 0 && (
                    <div className="mb-3 text-sm">
                      <p className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 justify-center animate-pulse">
                        <ShoppingBag className="w-4 h-4" />
                        Ready to complete your order? Click checkout below
                      </p>
                    </div>
                  )}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading || showCheckout}
                  className={`w-full py-3 bg-gradient-to-r text-white rounded-lg font-semibold transition-all duration-300 ${
                    isLoading || showCheckout 
                      ? 'from-gray-400 to-gray-500 cursor-not-allowed opacity-50'
                      : 'from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    {/* Checkout Modal */}
    {showCheckout && (
      <div className="fixed inset-0 z-[70] isolate">
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />
        <div className="relative z-[71] h-full">
          <CheckoutPage
            onClose={() => {
              setShowCheckout(false);
              onClose();
            }}
          />
        </div>
      </div>
    )}
  </>
);
}