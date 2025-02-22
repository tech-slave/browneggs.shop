import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Home, User, ChevronDown, ChevronUp, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Cart from '../cart/Cart';
import { useCart } from '../context/CartContext';
import logo from '../../assets/images/bes.png';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { state } = useCart();
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const navLinks: { [key: string]: string } = {
    Home: '/',
    Shop: '/products',
  };
  
  const navItems = [
    { name: 'Home', icon: <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> },
    { name: 'Shop', icon: <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> },
    { 
      name: 'Cart', 
      icon: <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-white" />,
      action: () => setIsCartOpen(true)
    }
  ];
  const cartItemCount = state.items.reduce((total, item) => total + item.quantity, 0);

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
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
        setIsVisible(false);
      } else {
        setScrollDirection('up');
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
      setIsScrolled(currentScrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAccountOpen) {
      timer = setTimeout(() => {
        setIsAccountOpen(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isAccountOpen]);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }
    setIsAccountOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsAccountOpen(false);
    }, 2000);
    setHoverTimeout(timeout);
  };

  const handleAccountClick = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }
    setIsAccountOpen(!isAccountOpen);
    if (!isAccountOpen) {
      const timeout = setTimeout(() => {
        setIsAccountOpen(false);
      }, 5000);
      setClickTimeout(timeout);
    }
  };

  const handleDropdownItemClick = () => {
    setIsAccountOpen(false);
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gradient-to-r from-amber-900/90 via-black/90 to-amber-900/90 backdrop-blur-lg shadow-lg'
          : 'bg-gradient-to-r from-black/20 via-amber-900/20 to-black/20 backdrop-blur-sm'
      } ${isVisible ? 'top-0' : '-top-16'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo section - keep as is */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <img src={logo} alt="Logo" className="h-6 w-6 sm:h-10 sm:w-10" />
            </Link>
            <Link to="/" onClick={() => setIsOpen(false)}>
              <span className="text-sm sm:text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">
                browneggs.shop
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2 sm:space-x-4 justify-end flex-1">
            {navItems.map((item) => (
                item.name === 'Cart' ? (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className="relative px-2 sm:px-3 py-2 text-sm font-medium group overflow-hidden flex items-center"
                  >
                    <div className="relative">
                      {item.icon}
                      {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItemCount}
                        </span>
                      )}
                    </div>
                    <span className="relative z-10 text-white transition-colors duration-300 group-hover:text-amber-600 hidden md:inline ml-2">
                      {item.name}
                    </span>
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                    <span className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                  </button>
                ) : (
                <Link
                  key={item.name}
                  to={navLinks[item.name]}
                  className="relative px-2 sm:px-3 py-2 text-sm font-medium group overflow-hidden flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="relative z-10 text-white transition-colors duration-300 group-hover:text-amber-600 hidden md:inline ml-2">
                    {item.name}
                  </span>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              )
            ))}
            {/* Account dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={handleAccountClick}
                className="relative px-2 sm:px-3 py-2 text-sm font-medium group overflow-hidden flex items-center"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-0 text-white" />
                <span className="relative z-10 text-white transition-colors duration-300 group-hover:text-amber-600 hidden md:inline ml-2">
                  Account
                </span>
                {isAccountOpen ? (
                  <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 ml-1 hidden md:inline text-white" />
                ) : (
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 ml-1 hidden md:inline text-white" />
                )}
              </button>
              {isAccountOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="absolute top-0 right-4 w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 -mt-1"></div>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleDropdownItemClick}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleDropdownItemClick}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      handleDropdownItemClick();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 md:hidden">
            {navItems.map((item) => (
                item.name === 'Cart' ? (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className="relative p-1.5 rounded-full bg-gradient-to-r from-amber-900/20 to-yellow-900/20 hover:from-amber-900/40 hover:to-yellow-900/40 text-white transition-all duration-300 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12"
                  >
                    <div className="relative">
                      {item.icon}
                      {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItemCount}
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                <Link
                  key={item.name}
                  to={navLinks[item.name]}
                  className="relative p-2 rounded-full bg-gradient-to-r from-amber-900/20 to-yellow-900/20 hover:from-amber-900/40 hover:to-yellow-900/40 text-white transition-all duration-300 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                </Link>
              )
            ))}
            <div className="relative">
              <button
                onClick={handleAccountClick}
                className="relative p-2 rounded-full bg-gradient-to-r from-amber-900/20 to-yellow-900/20 hover:from-amber-900/40 hover:to-yellow-900/40 text-white transition-all duration-300 flex items-center justify-center"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                {isAccountOpen ? (
                  <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 ml-1 text-white" />
                ) : (
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 ml-1 text-white" />
                )}
              </button>
              {isAccountOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20"
                >
                  <div className="absolute top-0 right-4 w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 -mt-1"></div>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleDropdownItemClick}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleDropdownItemClick}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      handleDropdownItemClick();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-500 ${isOpen ? 'max-h-64' : 'max-h-0'} overflow-hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-r from-amber-900/90 via-black/90 to-amber-900/90 backdrop-blur-lg">
          {navItems.map((item) => (
            item.name === 'Cart' ? (
              <button
                key={item.name}
                onClick={item.action}
                className="block w-full px-3 py-2 text-sm font-medium text-white hover:text-amber-400 transition-colors duration-300 flex items-center"
              >
                {item.icon}
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                to={navLinks[item.name]}
                className="block px-3 py-2 text-sm font-medium text-white hover:text-amber-400 transition-colors duration-300 flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}