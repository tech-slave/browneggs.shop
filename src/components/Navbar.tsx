import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Home, Info, Phone, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Cart from './Cart';
import { useCart } from './CartContext';
import logo from './bes.png';
import { supabase } from '../lib/supabase'; 
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react'; 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { state } = useCart();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { [key: string]: string } = {
    Home: '/',
    Order: '/products',
    About: '/about',
    Contact: '/contact',
  };

  const navItems = [
    { name: 'Home', icon: <Home className="w-5 h-5 sm:w-6 sm:h-6 mr-3" /> },
    { name: 'Order', icon: <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-3" /> },
    { name: 'About', icon: <Info className="w-5 h-5 sm:w-6 sm:h-6 mr-3" /> },
    { name: 'Contact', icon: <Phone className="w-5 h-5 sm:w-6 sm:h-6 mr-3" /> },
  ];

  const handleLinkClick = (item: string) => {
    setIsOpen(false);
    if (item === 'Home') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      navigate(navLinks[item]);
    }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gradient-to-r from-amber-900/90 via-black/90 to-amber-900/90 backdrop-blur-lg shadow-lg'
          : 'bg-gradient-to-r from-black/20 via-amber-900/20 to-black/20 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          <div className="flex items-center">
            <Link to="/" onClick={() => handleLinkClick('Home')}>
              <img src={logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 mr-2" />
            </Link>
            <Link to="/" onClick={() => handleLinkClick('Home')}>
              <span className="text-base sm:text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">
                browneggs.shop
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={navLinks[item.name]}
                  className="relative px-3 py-2 text-sm font-medium group overflow-hidden flex items-center"
                  onClick={() => handleLinkClick(item.name)}
                >
                  {item.icon}
                  <span className="relative z-10 text-white transition-colors duration-300 group-hover:text-amber-600">
                    {item.name}
                  </span>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {user && (
              <Link
                to="/profile"
                className="p-2 sm:p-2.5 rounded-full bg-gradient-to-r from-amber-900/20 to-yellow-900/20 hover:from-amber-900/40 hover:to-yellow-900/40 text-white transition-all duration-300 transform hover:scale-110 group"
                title="Profile"
              >
                <User size={20} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
              </Link>
            )}
            
            {user && (
              <button
                onClick={handleLogout}
                className="p-2 sm:p-2.5 rounded-full bg-gradient-to-r from-red-900/20 to-red-700/20 hover:from-red-900/40 hover:to-red-700/40 text-white transition-all duration-300 transform hover:scale-110 group"
                title="Logout"
              >
                <LogOut size={20} className="sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            )}

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-full bg-gradient-to-r from-amber-900/20 to-yellow-900/20 hover:from-amber-900/40 hover:to-yellow-900/40 text-white transition-all duration-300 transform hover:scale-110 group" 
              title="Cart"
            >
              <ShoppingCart size={20} className="sm:w-5 sm:h-5" />
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-600 to-yellow-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  {state.items.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 sm:p-2.5 rounded-full bg-gradient-to-r from-amber-900/20 to-yellow-900/20 hover:from-amber-900/40 hover:to-yellow-900/40 text-white transition-all duration-300 mr-2"
              >
                {isOpen ? (
                  <X size={20} className="sm:w-5 sm:h-5" />
                ) : (
                  <Menu size={20} className="sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-500 ${isOpen ? 'max-h-64' : 'max-h-0'} overflow-hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-r from-amber-900/90 via-black/90 to-amber-900/90 backdrop-blur-lg">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={navLinks[item.name]}
              className="block px-3 py-2 text-sm font-medium text-white hover:text-amber-400 transition-colors duration-300 flex items-center"
              onClick={() => handleLinkClick(item.name)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}