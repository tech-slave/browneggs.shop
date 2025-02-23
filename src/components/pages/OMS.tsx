import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Define a Profile interface for the address details
interface Profile {
  house_no: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'Processing' | 'Cancelled' | 'Delivered';
  created_at: string;
  user_full_name: string;
  order_notes: string;
  // Supabase join returns the related profile data in a property (named "profiles")
  profiles?: Profile | Profile[];
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
  'Your order was Delivered Successfully',
  "Couldn't verify payment",
  "You've requested Cancellation",
] as const;

const orderStatuses: OrderStatus[] = [
  { value: 'Processing', label: 'Processing', color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" /> },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
  { value: 'Delivered', label: 'Delivered', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> },
];

/**
 * CustomDropdown Component
 * Renders a button that toggles an inline dropdown list.
 * The currently selected value is shown on the button but is not included in the list.
 */
const CustomDropdown = ({
  value,
  options,
  onChange,
  buttonClassName = "",
  listClassName = "",
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  buttonClassName?: string;
  listClassName?: string;
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show the current value on the button (even though it's not in the list)
  const currentOption = { label: value };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div className={`relative inline-block ${buttonClassName}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="bg-transparent border-b border-gray-300 focus:border-blue-500 text-sm px-2 py-1 flex items-center justify-between w-full"
      >
        <span>{currentOption.label || 'Select...'}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-2" />
        )}
      </button>
      {open && (
        <ul className={`absolute left-0 z-50 mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded shadow-lg ${listClassName}`}>
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export function OMS() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | Order['status']>('Processing');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<{ id: string } | null>(null);
  const [pendingChanges, setPendingChanges] = useState<OrderChanges[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<{
    id: string;
    items: any[] | null;
    loading: boolean;
  } | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Fetch orders and join with profiles (address details) using Supabase foreign key relation
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('orders')
        .select(`*, profiles ( house_no, street_address, city, state, pincode )`)
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
    setPendingChanges((prev) => {
      const existing = prev.find((p) => p.id === orderId);
      if (existing) {
        return prev.map((p) => (p.id === orderId ? { ...p, [field]: value } : p));
      }
      return [...prev, { id: orderId, [field]: value }];
    });
  };

  const saveOrderChanges = async (orderId: string) => {
    const changes = pendingChanges.find((p) => p.id === orderId);
    if (!changes) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: changes.status,
          order_notes: changes.notes,
        })
        .eq('id', orderId);
      if (error) throw error;
      
      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: changes.status || order.status, order_notes: changes.notes || order.order_notes }
            : order
        )
      );
      setPendingChanges((prev) => prev.filter((p) => p.id !== orderId));
      setShowConfirmation(null);
      
      // Show success notification
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Hide after 3 seconds
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const statusObj = orderStatuses.find((s) => s.value === status);
    return statusObj?.color || 'bg-gray-500';
  };

  const formatId = (id: string) => id.split('-')[0];

  const filteredOrders =
    activeTab === 'all' ? orders : orders.filter((order) => order.status === activeTab);

  const stats = {
    total: orders.length,
    processing: orders.filter((o) => o.status === 'Processing').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 md:pt-0">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 py-8 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="mt-8 md:mt-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Order Management System
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Welcome back, Admin!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
              {[
                { icon: <Package className="w-4 h-4 md:w-5 md:h-5" />, label: 'Total Orders', value: stats.total },
                { icon: <Clock className="w-4 h-4 md:w-5 md:h-5" />, label: 'Processing', value: stats.processing },
                { icon: <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />, label: 'Delivered', value: stats.delivered },
                { icon: <XCircle className="w-4 h-4 md:w-5 md:h-5" />, label: 'Cancelled', value: stats.cancelled },
              ].map((stat, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 md:p-4 rounded-lg flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    {stat.icon}
                    <span className="text-xs md:text-sm">{stat.label}</span>
                  </div>
                  <p className="text-base md:text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        {error && (
          <div className="mb-4 p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 text-sm md:text-base">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
            {error}
          </div>
        )}

        {/* Status Filters - Scrollable on mobile */}
        <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 md:px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
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
              className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-1 md:gap-2 whitespace-nowrap text-sm ${
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

        {/* Orders Table/Cards */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-visible">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Address</th>
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
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => {
                  // For desktop, remove current value from dropdown options.
                  const currentStatus = pendingChanges.find((p) => p.id === order.id)?.status || order.status;
                  const statusOptions = orderStatuses
                    .filter((s) => s.value !== currentStatus)
                    .map((s) => ({ value: s.value, label: s.label }));
                  const currentNote = pendingChanges.find((p) => p.id === order.id)?.notes || order.order_notes || "";
                  const noteOptions = predefinedNotes
                    .filter((note) => note !== currentNote)
                    .map((note) => ({ value: note, label: note }));
                  // Fetch profile (address) from the joined "profiles" column
                  const profile =
                    order.profiles && Array.isArray(order.profiles)
                      ? order.profiles[0]
                      : order.profiles;
                  const address = profile
                    ? `${profile.house_no}, ${profile.street_address}, ${profile.city}, ${profile.state} - ${profile.pincode}`
                    : 'N/A';
                  return (
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
                      <td className="px-6 py-4 text-sm">{address}</td>
                      <td className="px-6 py-4 text-sm">${order.total_amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                          <CustomDropdown
                            value={currentStatus}
                            options={statusOptions}
                            onChange={(newVal) => handleOrderChange(order.id, 'status', newVal)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <CustomDropdown
                          value={currentNote}
                          options={noteOptions}
                          onChange={(newVal) => handleOrderChange(order.id, 'notes', newVal)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {pendingChanges.find((p) => p.id === order.id)?.status &&
                          pendingChanges.find((p) => p.id === order.id)?.notes && (
                            <button
                              onClick={() => setShowConfirmation({ id: order.id })}
                              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                            >
                              Update
                            </button>
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading orders...</div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrders.includes(order.id);
                  const currentStatus = pendingChanges.find((p) => p.id === order.id)?.status || order.status;
                  const statusOptions = orderStatuses
                    .filter((s) => s.value !== currentStatus)
                    .map((s) => ({ value: s.value, label: s.label }));
                  const currentNote = pendingChanges.find((p) => p.id === order.id)?.notes || order.order_notes || "";
                  const noteOptions = predefinedNotes
                    .filter((note) => note !== currentNote)
                    .map((note) => ({ value: note, label: note }));
                                      // Fetch profile (address) from the joined "profiles" column
                  const profile =
                  order.profiles && Array.isArray(order.profiles)
                    ? order.profiles[0]
                    : order.profiles;
                const address = profile
                  ? `${profile.house_no}, ${profile.street_address}, ${profile.city}, ${profile.state} - ${profile.pincode}`
                  : 'N/A';
                  return (
                    <div key={order.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <button
                            onClick={() => fetchOrderDetails(order.id)}
                            className="text-blue-500 hover:text-blue-700 underline text-sm"
                          >
                            {formatId(order.id)}
                          </button>
                          <span className="block text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button onClick={() => toggleExpand(order.id)}>
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{order.user_full_name}</span>
                            {/* Replace this td element */}
                            <span className="text-sm text-gray-600">{address}</span>
                            <span className="text-sm font-semibold">${order.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                            <CustomDropdown
                                value={currentStatus}
                                options={statusOptions}
                                onChange={(newVal) => handleOrderChange(order.id, 'status', newVal)}
                                buttonClassName="flex-1"
                            />
                            </div>
                          <CustomDropdown
                            value={currentNote}
                            options={noteOptions}
                            onChange={(newVal) => handleOrderChange(order.id, 'notes', newVal)}
                            buttonClassName="w-full"
                          />
                          {pendingChanges.find((p) => p.id === order.id)?.status &&
                            pendingChanges.find((p) => p.id === order.id)?.notes && (
                              <button
                                onClick={() => setShowConfirmation({ id: order.id })}
                                className="w-full mt-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                              >
                                Update
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

          {/* Success Notification Toast */}
        {saveSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-scale">
            <CheckCircle className="w-6 h-6" />
            <span className="text-base font-medium">Order updated successfully!</span>
            </div>
        </div>
        )}

      {/* Confirmation Modal (opens from bottom) */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full md:w-auto md:max-w-sm rounded-t-lg md:rounded-lg">
            <div className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Changes</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to update this order?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmation(null)}
                  className="flex-1 px-4 py-3 md:py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveOrderChanges(showConfirmation.id)}
                  className="flex-1 px-4 py-3 md:py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </
div>
        </div>
      )}

      {/* Order Details Modal (opens from bottom like confirmation modal) */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full h-full md:h-auto md:max-h-[90vh] md:w-auto md:max-w-2xl md:rounded-lg overflow-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Order Details: {formatId(selectedOrderDetails.id)}
                </h3>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-2 -mr-2 text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {selectedOrderDetails.loading ? (
                <div className="py-8 text-center">Loading order details...</div>
              ) : selectedOrderDetails.items?.length ? (
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full min-w-[300px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Item</th>
                        <th className="text-left py-2 px-2 w-20">Qty</th>
                        <th className="text-left py-2 px-2 w-24">Price</th>
                        <th className="text-left py-2 px-2 w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderDetails.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-2">{item.product_name}</td>
                          <td className="py-2 px-2">{item.quantity}</td>
                          <td className="py-2 px-2">${item.price.toFixed(2)}</td>
                          <td className="py-2 px-2">${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No items found for this order
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
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
