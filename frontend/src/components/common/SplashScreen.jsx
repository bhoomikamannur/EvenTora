import React, { useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center" 
      style={{ background: 'linear-gradient(135deg, #6B4A63 0%, #B5817A 50%, #E8A33D 100%)' }}
    >
      <h1 className="text-6xl font-display font-semibold text-white animate-pulse">Eventora</h1>
    </div>
  );
};

export default SplashScreen;