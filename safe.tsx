import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Package, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Order {
  id: string;
  total_amount: number;
  status: 'Processing' | 'Cancelled' | 'Delivered';
  created_at: string;
  user_full_name: string;
  order_notes: string;
}

interface OrderStatus {
  value: 'Processing' | 'Cancelled' | 'Delivered';
  label: string;
  color: string;
  icon: React.ReactNode;
}

interface OrderChanges {
  id: string;
  status?: Order['status'];
  notes?: string;
}

const predefinedNotes = [
  'Verifying your payment',
  'Delivered',
  'Couldn\'t verify payment',
  'You\'ve requested Cancellation'
] as const;

const orderStatuses: OrderStatus[] = [
  { value: 'Processing', label: 'Processing', color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" /> },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
  { value: 'Delivered', label: 'Delivered', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> },
];

export function OMS() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | Order['status']>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<{id: string} | null>(null);
  const [pendingChanges, setPendingChanges] = useState<OrderChanges[]>([]);


  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add to existing state declarations
const [selectedOrderDetails, setSelectedOrderDetails] = useState<{
    id: string;
    items: any[] | null;
    loading: boolean;
  } | null>(null);
  
  // Add the fetch function
  const fetchOrderDetails = async (orderId: string) => {
    setSelectedOrderDetails({ id: orderId, items: null, loading: true });
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
  
      if (error) throw error;
      setSelectedOrderDetails({ id: orderId, items: data, loading: false });
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSelectedOrderDetails(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderChange = (orderId: string, field: 'status' | 'notes', value: string) => {
    setPendingChanges(prev => {
      const existing = prev.find(p => p.id === orderId);
      if (existing) {
        return prev.map(p => p.id === orderId ? { ...p, [field]: value } : p);
      }
      return [...prev, { id: orderId, [field]: value }];
    });
  };

  const saveOrderChanges = async (orderId: string) => {
    const changes = pendingChanges.find(p => p.id === orderId);
    if (!changes) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: changes.status,
          order_notes: changes.notes
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: changes.status || order.status, order_notes: changes.notes || order.order_notes }
          : order
      ));
      setPendingChanges(prev => prev.filter(p => p.id !== orderId));
      setShowConfirmation(null);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-500';
  };

  const formatId = (id: string) => id.split('-')[0];

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'Processing').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order Management System
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex gap-4">
              {[
                { icon: <Package className="w-5 h-5" />, label: 'Total Orders', value: stats.total },
                { icon: <Clock className="w-5 h-5" />, label: 'Processing', value: stats.processing },
                { icon: <CheckCircle className="w-5 h-5" />, label: 'Delivered', value: stats.delivered },
              ].map((stat, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Status Filters */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            All Orders
          </button>
          {orderStatuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setActiveTab(status.value)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === status.value 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {status.icon}
              {status.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Notes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-6 py-4 text-sm">
  <button
    onClick={() => fetchOrderDetails(order.id)}
    className="text-blue-500 hover:text-blue-700 underline"
  >
    {formatId(order.id)}
  </button>
</td>
                  <td className="px-6 py-4 text-sm">{order.user_full_name}</td>
                  <td className="px-6 py-4 text-sm">${order.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                      <select
                        value={pendingChanges.find(p => p.id === order.id)?.status || order.status}
                        onChange={(e) => handleOrderChange(order.id, 'status', e.target.value)}
                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 text-sm"
                      >
                        <option value={order.status}>{order.status}</option>
                        {orderStatuses
                          .filter(status => status.value !== order.status)
                          .map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={pendingChanges.find(p => p.id === order.id)?.notes || order.order_notes}
                      onChange={(e) => handleOrderChange(order.id, 'notes', e.target.value)}
                      className="bg-transparent border-b border-gray-300 focus:border-blue-500 text-sm"
                    >
                      <option value="">{order.order_notes || 'Select note...'}</option>
                      {predefinedNotes.map((note) => (
                        <option key={note} value={note}>
                          {note}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {pendingChanges.find(p => p.id === order.id)?.status && 
                     pendingChanges.find(p => p.id === order.id)?.notes && (
                      <button
                        onClick={() => setShowConfirmation({ id: order.id })}
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                      >
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Changes</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to update this order?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => saveOrderChanges(showConfirmation.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Order Details Modal */}
{selectedOrderDetails && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Order Details: {formatId(selectedOrderDetails.id)}
        </h3>
        <button
          onClick={() => setSelectedOrderDetails(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>
      
      {selectedOrderDetails.loading ? (
        <div className="text-center py-8">Loading order details...</div>
      ) : selectedOrderDetails.items?.length ? (
        <div className="mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-left py-2">Quantity</th>
                <th className="text-left py-2">Price</th>
                <th className="text-left py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrderDetails.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.product_name}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">${item.price.toFixed(2)}</td>
                  <td className="py-2">${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No items found for this order
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setSelectedOrderDetails(null)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}