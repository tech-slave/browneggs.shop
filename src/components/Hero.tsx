import React, { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import video from './bes_hd.mp4';
const adjectives = ['Premium', 'Healthy', 'Farm-Fresh', 'Organic', 'Grade A','Omega-3 enriched'];

export default function Hero() {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentWord = adjectives[currentWordIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText(currentWord.substring(0, displayText.length - 1));
        setTypingSpeed(50);
      }, typingSpeed);

      if (displayText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % adjectives.length);
        setTypingSpeed(150);
      }
    } else {
      timer = setTimeout(() => {
        setDisplayText(currentWord.substring(0, displayText.length + 1));
      }, typingSpeed);

      if (displayText === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentWordIndex, typingSpeed]);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute w-full h-full object-cover "
        >
          <source
            src={video}
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-amber-900/50 to-black/80" />
      </div>

      {/* Floating Eggs Background
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="egg-float absolute top-1/4 left-1/4 w-32 h-32 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1569288052389-dac9b0ac9eac?auto=format&fit=crop&q=80"
            alt="Floating egg"
            className="w-full h-full object-cover rounded-full animate-float"
          />
        </div>
        <div className="egg-float absolute top-1/3 right-1/4 w-24 h-24 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?auto=format&fit=crop&q=80"
            alt="Floating egg"
            className="w-full h-full object-cover rounded-full animate-float-delayed"
          />
        </div>
      </div> */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="inline-block min-w-[280px] h-[1.2em] relative">
              <span className="typing-text border-r-2 border-amber-500 animate-blink">
                {displayText}
              </span>
            </span>
            <span className="block text-transparent bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text animate-gradient">
              Brown Eggs
            </span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 animate-fade-up">
            Experience the richness of nature with our premium selection of farm-fresh brown eggs,
            delivered straight to your doorstep.
          </p>
          <button 
            onClick={scrollToProducts}
            className="group bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center gap-2 mx-auto animate-bounce-slow shadow-lg hover:shadow-amber-500/25"
          >
            Shop Now
            <ArrowDown className="group-hover:translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}