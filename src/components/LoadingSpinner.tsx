import React from 'react';
import box from './box.gif';

export const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-[9999]">
      <div className="w-32 h-32 md:w-40 md:h-40 animate-egg-bounce-bottom">
        <img 
          src={box}
          alt="Loading..."
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};