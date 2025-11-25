import React, { useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center" 
      style={{ background: 'linear-gradient(135deg, #ab83c3 0%, #ff85b4 50%, #86c6fd 100%)' }}
    >
      <h1 className="text-6xl font-bold text-white animate-pulse">Eventora</h1>
    </div>
  );
};

export default SplashScreen;