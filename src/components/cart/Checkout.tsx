import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Check, Clock, XCircle, ChevronDown, ChevronUp, Loader2, WifiOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import qrCodeImage from '../../assets/images/qr-code.png';
import { CartItem } from '../context/CartContext';
import { lockScroll, unlockScroll } from '../../utils/scrollLock';
import { Copy } from 'lucide-react';
import { SiGooglepay, SiPhonepe } from 'react-icons/si';
import { FaIndianRupeeSign } from 'react-icons/fa6';

interface CheckoutPageProps {
  onClose: () => void;
}
const calculateDeliveryFee = (items: CartItem[]): number => {
  return items.some(item => item.isPromo) ? 20 : 0;
};


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
  const totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = calculateDeliveryFee(state.items);
  const finalTotal = totalAmount + deliveryFee;
  const [showQR, setShowQR] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard('test@ybl');
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };
  useEffect(() => {
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, []);

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
      product_name: item.title, // Make sure title is included
      quantity: item.quantity,
      price: item.price,
      created_at: new Date().toISOString()
    }));
  
    const { data, error } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();
  
    if (error) {
      throw new Error('Failed to create order items');
    }
  
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

        // Create order with timeout handling
        const orderData = await Promise.race([
            retryOperation(() => createOrder(finalTotal)), // Pass the final total including delivery fee
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_DURATION)
            )
        ]);

        setLoadingState('retrying');

        // Create order items with retry
        await retryOperation(() => createOrderItems(orderData.id));
        
        try {
          await retryOperation(() =>
            supabase.functions.invoke('orderconfirmation', {
              body: {
                order: {
                  ...orderData,
                  delivery_fee: deliveryFee,
                  final_total: finalTotal
                },
                email: user.email,
                items: state.items.map(item => ({
                  ...item,
                  product_name: item.title // Ensure the title is mapped to product_name
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
    <>
      {/* Add backdrop overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Update the existing outer div with higher z-index */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div 
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full m-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Scrollable content area */}
        <div className="max-h-[80vh] overflow-y-auto">
          <div className="p-6 space-y-6">
          {/* Timer section - remove mb-6 since parent has padding */}
          <div className="text-center">
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

            <div className="space-y-2 pt-2 border-t dark:border-gray-600">
              <div className="flex justify-between text-sm">
                <span className="dark:text-gray-300">Subtotal:</span>
                <span className="dark:text-gray-300">₹{state.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="dark:text-gray-300">Delivery Fee:</span>
                <span className="dark:text-gray-300">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t dark:border-gray-600">
                <span className="text-blue-600 dark:text-blue-400">Total:</span>
                <span className="text-blue-600 dark:text-blue-400">₹{state.total + deliveryFee}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col mb-6 px-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Payment Details</h3>
            <div className="flex flex-col gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 relative">
                  <span className="text-gray-600 dark:text-green-400">UPI ID:</span>
                  <span className="font-mono font-medium text-blue-600 dark:text-blue-400">test@ybl</span>
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Copy UPI ID"
                  >
                    <Copy size={14} />
                  </button>
                  {showCopied && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg">
                      Copied!
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-2 animate-pulse">
                  Please copy the UPI ID and complete the payment using your preferred UPI app.
                </p>
                <div className="flex items-center gap-6 mt-3 mb-2 justify-center">
                <SiPhonepe className="w-8 h-8" style={{ color: '#5F259F' }} /> {/* PhonePe purple */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                  {/* Hidden SVG with the gradient definition */}
                  <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <defs>
                      <linearGradient id="googlepayGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="red" />
                        <stop offset="33%" stopColor="yellow" />
                        <stop offset="66%" stopColor="green" />
                        <stop offset="100%" stopColor="blue" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Clone the icon and override its fill with the gradient */}
                  {React.cloneElement(<SiGooglepay className="w-full h-full" />, {
                    fill: 'url(#googlepayGradient)',
                  })}
                </div>
                {/* Google Pay blue */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                    {/* Hidden SVG for gradient definition */}
                    <svg width="0" height="0" style={{ position: 'absolute' }}>
                      <defs>
                        <linearGradient id="rupeeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="orange" />
                          <stop offset="50%" stopColor="white" />
                          <stop offset="100%" stopColor="green" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Clone the icon and override its fill */}
                    {React.cloneElement(<FaIndianRupeeSign className="w-5 h-5" />, { fill: 'url(#rupeeGradient)' })}
                  </div>
              </div>
              </div>
      
              <button
                onClick={() => {
                  setShowQR(!showQR);
                  // If showing QR, wait for state update and scroll
                  if (!showQR) {
                    setTimeout(() => {
                      qrRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }
                }}
                className="text-amber-600 hover:text-blue-700 dark:text-amber-500 dark:hover:text-blue-400 text-sm font-medium flex items-center gap-2"
              >
                {showQR ? (
                  <>Hide QR Code<ChevronUp size={16} /></>
                ) : (
                  <>Show QR Code Instead<ChevronDown size={16} /></>
                )}
              </button>

              {showQR && (
                <div 
                  ref={qrRef}
                  className="flex flex-col items-center gap-2 transition-all duration-300 ease-in-out"
                >
                  <img
                    src={qrCodeImage}
                    alt="Payment QR Code"
                    className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    You can also scan this QR code to make the payment
                  </p>
                </div>
              )}
            </div>
          </div>

        {/* Action Buttons */}
      {/* Fixed button container - outside scrollable area */}
      <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
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
  </div>
      </div>
    </div>
    </>
  );
}