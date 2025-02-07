import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navLinks: { [key: string]: string } = {
    Home: '/browneggs.shop',
    Shop: '/browneggs.shop/#products',
    About: '/browneggs.shop/about',
    Contact: '/browneggs.shop/contact',
  };

  const navItems = ['Home', 'Shop', 'About', 'Contact'];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gradient-to-r from-amber-900/90 via-black/90 to-amber-900/90 backdrop-blur-lg shadow-lg'
          : 'bg-gradient-to-r from-black/20 via-amber-900/20 to-black/20 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
          <img src="../bes.png" alt="Logo" className="h-10 w-10 mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">
              browneggs.shop
            </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={navLinks[item]}
                  className="relative px-3 py-2 text-sm font-medium group overflow-hidden"
                >
                  <span className="relative z-10 text-white transition-colors duration-300 group-hover:text-amber-600">
                    {item}
                  </span>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gradient-to-r from-amber-900/20 to-yellow-900/20 hover:from-amber-900/40 hover:to-yellow-900/40 text-white transition-all duration-300 transform hover:scale-110"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="relative p-2 rounded-full bg-gradient-to-r from-amber-900/20 to-yellow-900/20 hover:from-amber-900/40 hover:to-yellow-900/40 text-white transition-all duration-300 transform hover:scale-110 group">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-600 to-yellow-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                0
              </span>
            </button>

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full bg-gradient-to-r from-amber-900/20 to-yellow-900/20 hover:from-amber-900/40 hover:to-yellow-900/40 text-white transition-all duration-300"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-500 ${isOpen ? 'max-h-64' : 'max-h-0'} overflow-hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-r from-amber-900/90 via-black/90 to-amber-900/90 backdrop-blur-lg">
          {navItems.map((item) => (
            <a
              key={item}
              href={navLinks[item]}
              className="block px-3 py-2 text-base font-medium text-white hover:text-amber-400 transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}