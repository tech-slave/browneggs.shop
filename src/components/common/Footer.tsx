import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, Home, Info, Phone as PhoneIcon, Sun, Moon } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <footer className="bg-gradient-to-b from-grey-900 to-amber-800 text-white py-7">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 text-center w-full justify-center">
          {/* Navigation */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-5 font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">Navigation</h3>
            <ul className="flex flex-row space-x-6 md:flex-col md:space-x-0 md:space-y-3">
              <li>
                <Link to="/" className="flex items-center hover:text-amber-500 transition-colors duration-300">
                  <Home className="w-5 h-5 mr-2" /> Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="flex items-center hover:text-amber-500 transition-colors duration-300">
                  <Info className="w-5 h-5 mr-2" /> About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="flex items-center hover:text-amber-500 transition-colors duration-300">
                  <PhoneIcon className="w-5 h-5 mr-2" /> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="flex flex-col items-center md:items-center">
            <h3 className="text-lg font-semibold mb-5 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">Follow Us</h3>
            <div className="flex space-x-6 animate-float">
              <a href="https://wa.me/919493543214" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400 transition-colors duration-300">
                <FaWhatsapp size={24} />
              </a>
              <a href="https://www.instagram.com/browneggs.shop/" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-300 transition-colors duration-300">
                <Instagram size={24} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61571716144145" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-400 transition-colors duration-300">
                <Facebook size={24} />
              </a>
            </div>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col items-center md:items-end text-right justify-center">
            <h3 className="text-lg font-semibold mb-3 font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">Contact Us</h3>
            <p className="text-gray-400 flex items-center mb-3">
              <Phone className="w-5 h-5 mr-2" />
              <a 
                href="tel:+919493543214" 
                className="hover:text-amber-500 transition-colors duration-300"
                aria-label="Call us"
              >
                +91 94935 43214
              </a>
            </p>
            <p className="text-gray-400 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              <a 
                href="mailto:contact@browneggs.shop"
                className="hover:text-amber-500 transition-colors duration-300"
                aria-label="Email us"
              >
                contact@browneggs.shop
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-6 text-center text-gray-400 text-sm w-full">
          <p>
            Made with <span className="text-amber-500">♥</span> by <a href="https://browneggs.shop" className="text-blue-500 hover:text-amber-500 transition-colors duration-300">aha-browneggs.shop</a>
          </p>
          <p>&copy; {currentYear} browneggs.shop All rights reserved.</p>
          <p><Link to="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link></p>
        </div>
      </div>
    </footer>
  );
}