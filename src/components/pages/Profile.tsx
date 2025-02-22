import React, { useState, useEffect } from 'react';
import { User, ShoppingCart, Phone, MapPin, Save, Home, Building2, MapPinned } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const AVAILABLE_CITIES = ['Hyderabad'] as const;
const AVAILABLE_STATES = ['Telangana'] as const;

interface ProfileData {
  full_name: string;
  phone: string;
  house_no: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  is_profile_completed: boolean;
}
// Add this function at the top of the file, after the interfaces
const isValidPhoneNumber = (phone: string) => {
  const phoneRegex = /^[6-9]\d{9}$/;  // Starts with 6-9 and has exactly 10 digits
  return phoneRegex.test(phone);
};

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isNewUser = location.state?.isNewUser;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string; type: 'success' | 'error'} | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    house_no: '',
    street_address: '',
    city: '',
    state: '',
    pincode: '',
    is_profile_completed: false
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          ...data,
          is_profile_completed: data.is_profile_completed || false
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
  
    try {
      if (!user) throw new Error('No user logged in');
  
      // Validate phone number format
      if (!isValidPhoneNumber(profileData.phone)) {
        setMessage({ 
          text: 'Please enter a valid 10-digit phone number starting with 6-9', 
          type: 'error' 
        });
        setLoading(false);
        return;
      }
  
      // Check if phone number already exists (excluding current user)
      const { data: existingUser, error: searchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', profileData.phone)
        .neq('id', user.id)
        .single();
  
      if (searchError && searchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw searchError;
      }
  
      if (existingUser) {
        setMessage({ 
          text: 'This phone number is already registered with another account', 
          type: 'error' 
        });
        setLoading(false);
        return;
      }
  
      // If validation passes, proceed with the update
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          is_profile_completed: true,
          updated_at: new Date().toISOString()
        });
  
      if (error) throw error;
  
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      
      if (isNewUser || !profileData.is_profile_completed) {
        setProfileData(prev => ({ ...prev, is_profile_completed: true }));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Error updating profile. Please try again.', type: 'error' });
      // Also scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Only allow digits and limit to 10 characters
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
      setProfileData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
      return;
    }
  
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startShopping = () => {
    navigate('/products');
  };

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-fade-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <User size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
              {isNewUser ? 'Complete Your Profile' : 'Profile Settings'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {isNewUser 
                ? 'Please provide your details to start shopping' 
                : 'Update your personal information'}
            </p>
          </div>


          {message && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-500'
              } animate-fade-in`}>
                {message.text}
              </div>
              
              {message.type === 'success' && (
                <div className="flex justify-center">
                  <button
                    onClick={startShopping}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number * <span className="text-xs text-gray-500">(10 digits)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border 
                        ${profileData.phone && !isValidPhoneNumber(profileData.phone)
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-amber-500'
                        } rounded-lg focus:ring-2 dark:text-white`}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                  {profileData.phone && !isValidPhoneNumber(profileData.phone) && (
                    <p className="mt-1 text-sm text-red-500">
                      Please enter a valid 10-digit mobile number starting with 6-9
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                Delivery Address 
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    House/Flat No. *
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="house_no"
                      value={profileData.house_no}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white"
                      placeholder="Flat/House Number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Street Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="street_address"
                      value={profileData.street_address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white"
                      placeholder="Street Address"
                      required
                    />
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City *
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                            name="city"
                            value={profileData.city}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white appearance-none cursor-pointer"
                            required
                        >
                        <option value="" disabled>Select your city</option>
                        {AVAILABLE_CITIES.map((city) => (
                            <option key={city} value={city}>
                            {city}
                            </option>
                        ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                            />
                        </svg>
                        </div>
                    </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            State *
                        </label>
                        <div className="relative">
                            <MapPinned className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                            <select
                            name="state"
                            value={profileData.state}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white appearance-none cursor-pointer"
                            required
                            >
                            <option value="" disabled>Select your state</option>
                            {AVAILABLE_STATES.map((state) => (
                                <option key={state} value={state}>
                                {state}
                                </option>
                            ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                                />
                            </svg>
                            </div>
                        </div>
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PIN Code *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="pincode"
                      value={profileData.pincode}
                      onChange={handleChange}
                      pattern="[0-9]{6}"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white"
                      placeholder="6-digit PIN Code"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              <Save className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}