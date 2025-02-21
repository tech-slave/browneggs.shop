import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
//import qrCodeImage from './qr-code.png';
import { ArrowLeft, Check, Clock, XCircle, ChevronDown, ChevronUp, Loader2, WifiOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import qrCodeImage from '../../assets/images/qr-code.png';

interface CheckoutPageProps {
  onClose: () => void;
}

const TIMEOUT_DURATION = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const retryOperation = async (operation: () => Promise<any>, maxRetries = MAX_RETRIES) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
    }
  }
};


const getErrorMessage = (error: any): string => {
  if (!navigator.onLine) return 'No internet connection. Please check your network.';
  if (error.message === 'Request timed out') return 'Network is slow. Please try again.';
  if (error.message.includes('authentication')) return 'Please login again to continue.';
  if (error.message.includes('order items')) return 'Error creating order. Please try again.';
  return 'There was an error processing your order. Please try again.';
};

export default function CheckoutPage({ onClose }: CheckoutPageProps) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(600);
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'retrying'>('idle');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkRecoveryAttempts, setNetworkRecoveryAttempts] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (error && networkRecoveryAttempts < MAX_RETRIES) {
        setNetworkRecoveryAttempts(prev => prev + 1);
        handlePaymentConfirmation();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, networkRecoveryAttempts]);

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

  
  const createOrder = async (totalAmount: number) => {
    if (!user?.id || !user?.email) {
      console.error('Invalid user data:', user);
      throw new Error('User authentication required');
    }
  
    // Verify session and user existence
    await verifyAuthStatus();
  
    const orderData = {
      user_id: user.id,
      total_amount: totalAmount,
      status: 'pending',
      created_at: new Date().toISOString()
    };
  
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
  
      if (error) {
        console.error('Order creation error:', {
          error,
          orderData,
          user: {
            id: user.id,
            provider: user.app_metadata?.provider
          }
        });
        throw error;
      }
  
      return data;
    } catch (error: any) {
      if (error.code === '42501') {
        throw new Error('Permission denied: Please login again');
      }
      throw new Error(`Order creation failed: ${error.message}`);
    }
  };

  const createOrderItems = async (orderId: string) => {
    const orderItems = state.items.map(item => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.title,
      quantity: item.quantity,
      price: item.price,
      created_at: new Date().toISOString()
    }));
  
    console.log('Creating order items:', orderItems); // Debug log
  
    const { data, error } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select(); // Add select to return created items
  
    if (error) {
      console.error('Order items creation error:', error);
      throw new Error('Failed to create order items');
    }
  
    console.log('Created order items:', data); // Debug log
    return data;
  };

  const verifyAuthStatus = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      throw new Error('Authentication error: Please login again');
    }
    
    if (!session.user?.id || !session.user?.email) {
      console.error('Invalid user data:', session.user);
      throw new Error('Invalid user data: Please login again');
    }
  
    return true;
  };

  const handlePaymentConfirmation = async () => {
    if (isPaid || isProcessing) return;

    if (!navigator.onLine) {
        setError('Please check your internet connection and try again.');
        return;
    }

    try {
        await verifyAuthStatus();
        setIsProcessing(true);
        setLoadingState('processing');
        setError(null);

        if (!user) {
            throw new Error('User not authenticated');
        }

        console.log('Starting payment confirmation...'); // Debug log
        
        const totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create order with timeout handling
        const orderData = await Promise.race([
            retryOperation(() => createOrder(totalAmount)),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_DURATION)
            )
        ]);

        setLoadingState('retrying');

        // Create order items with retry
        await retryOperation(() => createOrderItems(orderData.id));

        // Send order confirmation email
        console.log('Invoking edge function with:', {
            order: orderData,
            email: user.email,
            items: state.items
        });
        console.log('Sending confirmation email...'); // Debug log
        
        try {
            await retryOperation(() =>
                supabase.functions.invoke('orderconfirmation', {
                    body: {
                        order: orderData,
                        email: user.email,
                        items: state.items.map(item => ({
                            product_name: item.title,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                })
            );
        } catch (emailError) {
            console.error('Email service error:', emailError);
        }

        setIsPaid(true);
        dispatch({ type: 'CLEAR_CART' });
        setLoadingState('idle');

        const navigateToOrders = async () => {
            try {
                await navigate('/orders', { state: { fromCheckout: true } });
                setTimeout(onClose, 200);
            } catch (error) {
                console.error('Navigation failed:', error);
                window.location.href = '/orders';
            }
        };

        setTimeout(navigateToOrders, 1500);

    } catch (error) {
        console.error('Error in payment confirmation:', error);
        setError(getErrorMessage(error));
        setIsPaid(false);
        
        if (!navigator.onLine && networkRecoveryAttempts < MAX_RETRIES) {
            setLoadingState('retrying');
        } else {
            setLoadingState('idle');
        }
    } finally {
        setIsProcessing(false);
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
          <p className="text-gray-600 dark:text-amber-300 blink animate-blink">
            Please complete your payment before the timer expires
          </p>
        </div>

        {error && (
    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
      {!isOnline ? <WifiOff className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      <div>
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error}</p>
        {loadingState === 'retrying' && (
          <p className="text-sm mt-1">Retrying... Please wait.</p>
        )}
      </div>
    </div>
  )}

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
        <div className="flex gap-4 items-center justify-center">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-32 py-3 px-4 rounded-lg font-semibold border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
          
          <button
            onClick={handlePaymentConfirmation}
            disabled={isPaid || isProcessing}
            className={`w-48 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 text-sm whitespace-nowrap ${
              isPaid || isProcessing
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-pink-700 hover:from-amber-700 hover:to-amber-800 text-white'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : isPaid ? (
              <>
                <Check className="w-4 h-4" />
                Order Confirmed!
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                I've Paid thru UPI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}