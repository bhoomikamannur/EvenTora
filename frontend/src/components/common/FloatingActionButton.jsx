import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick, color = '#ab83c3', tooltip = 'Add' }) => {
  const [rightPosition, setRightPosition] = useState('auto');

  useEffect(() => {
    const calculatePosition = () => {
      // max-w-4xl = 56rem = 896px
      const maxWidth = 896;
      const viewportWidth = window.innerWidth;
      const padding = 16; // px-4 = 16px on each side
      
      // Calculate the right position to align with the content area
      const rightSpace = (viewportWidth - maxWidth) / 2 - 16; // subtract for button margin
      
      if (rightSpace > 0) {
        // Desktop: align with content area
        setRightPosition(`${rightSpace}px`);
      } else {
        // Mobile: use a fixed padding
        setRightPosition('16px');
      }
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, []);

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-xl z-40"
      style={{ 
        background: color,
        right: rightPosition
      }}
      title={tooltip}
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};

export default FloatingActionButton;
