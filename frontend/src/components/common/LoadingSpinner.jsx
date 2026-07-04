import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" 
        style={{ borderColor: '#6B4A63' }}
      ></div>
      <p className="text-ink-muted">{message}</p>
    </div>
  );
};

export default LoadingSpinner;