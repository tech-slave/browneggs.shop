import React,{useState} from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';
import CheckoutPage from './Checkout';
import { Link } from "react-router-dom";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { state, dispatch } = useCart();

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

  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className={`fixed top-0 right-0 w-full max-w-md h-screen bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 overflow-hidden ${
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
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold dark:text-white">{item.title}</h3>
                        <p className="text-lg font-bold dark:text-white">₹{item.price * item.quantity}</p>
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
              <div className="flex-none p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex justify-between mb-4">
                  <span className="text-lg font-semibold dark:text-white">Total:</span>
                  <span className="text-lg font-bold dark:text-white">₹{state.total}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg font-semibold transition-colors"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showCheckout && (
        <CheckoutPage
          onClose={() => {
            setShowCheckout(false);
            onClose();
          }}
        />
      )}

    </div>
  );
}