import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ShoppingCart, XCircle ,CheckCircle, Clock, ChevronDown, ChevronUp, MessageCircle, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useConfetti } from '../common/Confetti';
import { useLocation } from 'react-router-dom';
import { Link } from "react-router-dom";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string; 
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'Processing' | 'Cancelled' | 'Delivered';
  created_at: string;
  user_full_name: string;
  order_notes: string;
  items?: OrderItem[];
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const location = useLocation();
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    // Check if user just completed a payment
    if (location.state?.fromCheckout) {
      triggerConfetti();
    }
  }, [location]);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      if (!user) return;
  
      // First, check if order_items exist
      const { data: itemsCheck, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', 'b95e940a-9ae2-41f4-ad65-b7f1c25515d1'); // Use the order ID from your log
  
      console.log('Items check:', itemsCheck); // Debug log
  
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items!order_id(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
  
      if (ordersError) throw ordersError;
      console.log('Fetched orders:', ordersData); // Debug log
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error fetching orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-fade-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <ShoppingCart size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
              Your Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              View and track your orders
            </p>
          </div>

          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-300">
              Loading orders...
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-300">
              No orders found.{" "}
              <Link 
                to="/products" 
                className="text-blue-500 hover:underline"
              >
                Click here
              </Link>{" "}
              to start ordering.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} 
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md animate-fade-in hover:ring-2 hover:ring-amber-500/20 transition-all duration-200"
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Order #{order.id.slice(0, 8)}
                        </h2>
                        <span className="text-sm text-amber-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-200">
                          {expandedOrder === order.id ? 'Show less' : 'View details'}
                        </span>
                        {expandedOrder === order.id ? 
                          <ChevronUp className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : 
                          <ChevronDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        }
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Total Amount: ₹{order.total_amount}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Ordered on: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'Delivered' ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : order.status === 'Cancelled' ? (
                        <XCircle className="h-6 w-6 text-red-500" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-500" />
                      )}
                      <span className={`
                        ${order.status === 'Delivered' ? 'text-green-600 dark:text-green-400' : ''}
                        ${order.status === 'Cancelled' ? 'text-red-600 dark:text-red-400' : ''}
                        ${order.status === 'Processing' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                      `}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Expandable items section */}
                  {expandedOrder === order.id && order.items && (
                    <div className="mt-4 space-y-2 border-t pt-4 dark:border-gray-600 animate-fade-down">
                      <p className="text-gray-500 dark:text-amber-400 text-sm italic mt-1">
                        {order.order_notes}
                      </p>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order Items ({order.items.length})
                      </h3>

                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.quantity}x {item.product_name}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Contact Information */}
      <div className="mt-12 text-center border-t dark:border-gray-700 pt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Need help with your order?
            </h3>
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                <FaWhatsapp className="w-5 h-5 text-green-500" />
                WhatsApp us: <a href="https://wa.me/+919493543214" className="text-amber-600 dark:text-amber-400 hover:underline">+91 9493543214</a>
              </p>
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                <Mail className="w-5 h-5 text-amber-500" />
                Email us: <a href="mailto:contact@browneggs.shop" className="text-amber-600 dark:text-amber-400 hover:underline">contact@browneggs.shop</a>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Our support team is available Monday to Saturday, 9 AM to 6 PM IST
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We typically respond within 2 hours during business hours
              </p>
            </div>
          </div>
    </div>
  );
}