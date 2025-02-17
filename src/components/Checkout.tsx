import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import qrCodeImage from './qr-code.png';
import { ArrowLeft, Check, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface CheckoutPageProps {
  onClose: () => void;
}

export default function CheckoutPage({ onClose }: CheckoutPageProps) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(900);
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePaymentConfirmation = async () => {
    try {
      setIsPaid(true);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create orders for each item in the cart
      const orderPromises = state.items.map(item => {
        return supabase
          .from('orders')
          .insert({
            user_id: user.id,
            product_name: item.title,
            quantity: item.quantity,
            status: 'pending',
            created_at: new Date().toISOString(),
            amount: item.price * item.quantity,
          });
      });

      await Promise.all(orderPromises);

      // Clear cart and redirect after successful order creation
      setTimeout(() => {
        dispatch({ type: 'CLEAR_CART' });
        onClose();
        navigate('/orders');
      }, 2000);

    } catch (error) {
      console.error('Error creating order:', error);
      // You might want to show an error message to the user here
    }
  };

  const hasMoreItems = state.items.length > 3;
  const displayedItems = showAllItems ? state.items : state.items.slice(0, 3);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 m-auto">
        {/* Timer */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
            <Clock className="animate-pulse" />
            <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Please complete your payment before the timer expires
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2 dark:text-white">Order Summary</h3>
          {displayedItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm mb-1">
              <span className="dark:text-gray-300">
                {item.quantity}x {item.title}
              </span>
              <span className="dark:text-gray-300">₹{item.price * item.quantity}</span>
            </div>
          ))}

          {hasMoreItems && (
            <button
              onClick={() => setShowAllItems(!showAllItems)}
              className="w-full mt-2 pt-2 text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center justify-center gap-1 transition-colors border-t border-gray-200 dark:border-gray-600"
            >
              {showAllItems ? (
                <>
                  Show Less <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Show More ({state.items.length - 3} items) <ChevronDown size={16} />
                </>
              )}
            </button>
          )}

          <div className="border-t dark:border-gray-600 mt-2 pt-2 flex justify-between font-bold">
            <span className="dark:text-white">Total:</span>
            <span className="dark:text-white">₹{state.total}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="text-center mb-6">
          <img
            src={qrCodeImage}
            alt="Payment QR Code"
            className="w-64 h-64 mx-auto mb-4 bg-white p-2 rounded-lg"
          />
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Scan the QR code with any UPI app to make the payment
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg font-semibold border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Cancel
          </button>
          
          <button
            onClick={handlePaymentConfirmation}
            disabled={isPaid}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              isPaid
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-pink-700 hover:from-amber-700 hover:to-amber-800 text-white'
            }`}
          >
            {isPaid ? (
              <>
                <Check className="w-5 h-5" />
                Confirmed
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Click here if paid
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}