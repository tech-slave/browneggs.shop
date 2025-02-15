import React, { useState, useEffect } from 'react';
import { AuthForm } from '../components/AuthForm';
import { Link, useLocation } from 'react-router-dom';

const adjectives = ['Fresh, Local', 'Premium, Grade-A', 'Organic, Healthy', 'Farm-Fresh, Natural'];

export function Login() {
    const location = useLocation();
    const message = location.state?.message;
    const [displayText, setDisplayText] = useState(adjectives[0]);
    const [nextText, setNextText] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setIsAnimating(true);
            const currentIndex = adjectives.indexOf(displayText);
            const nextIndex = (currentIndex + 1) % adjectives.length;
            setNextText(adjectives[nextIndex]);
            
            setTimeout(() => {
                setDisplayText(adjectives[nextIndex]);
                setIsAnimating(false);
            }, 500);
        }, 2000);

        return () => clearInterval(timer);
    }, [displayText]);

    return (
        <div className="h-[calc(100vh-4rem)] mt-20 bg-gradient-to-br from-[#2B86C5] via-[#784BA0] to-[#F76B1C] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Farm Fresh Eggs</h1>
                <p className="text-gray-300 flex items-center justify-center gap-1">
                    Login to access{' '}
                    <span className="inline-block relative w-40 h-6 "> {/* Added fixed width */}
                        <span 
                            className={`text-transparent font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent animate-gradient absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                                isAnimating 
                                    ? '-translate-y-full opacity-0' 
                                    : 'translate-y-0 opacity-100'
                            }`}
                        >
                            {displayText}
                        </span>
                    </span>
                    {' '}eggs
                </p>
            </div>
  
        {message && (
          <div className="w-full max-w-md mb-4">
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
              {message}
            </div>
          </div>
        )}
        
        <AuthForm type="login" />
        
        <p className="mt-8 text-gray-300">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300">
            Sign up
          </Link>
        </p>
      </div>
    );
  }