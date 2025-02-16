import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { ShoppingCart, CheckCircle, Clock } from 'lucide-react';

interface Order {
  id: string;
  product_name: string;
  quantity: number;
  status: 'pending' | 'fulfilled';
  created_at: string;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error fetching orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
              No orders found.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md flex items-center justify-between animate-fade-in">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {order.product_name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Quantity: {order.quantity}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Ordered on: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {order.status === 'fulfilled' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Clock className="h-6 w-6 text-yellow-500" />
                    )}
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}