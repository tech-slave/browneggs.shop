import React from 'react';
import box from './box.gif';

export const LoadingSpinner = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-end justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
      <div className="w-32 h-32 mb-[-128px] animate-egg-bounce-bottom">
        <img 
          src={box}
          alt="Loading..."
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};