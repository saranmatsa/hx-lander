import React from 'react';

interface HxLogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const HxLogo: React.FC<HxLogoProps> = ({ className = 'h-14 w-auto', size, alt = 'HX Logo' }) => {
  return (
    <img
      src="/hxlogo.svg"
      alt={alt}
      className={className}
      style={size ? { height: size, width: 'auto' } : undefined}
      referrerPolicy="no-referrer"
    />
  );
};

export const HxSymbol: React.FC<HxLogoProps> = ({ className = 'h-10 w-auto', size, alt = 'HX' }) => {
  return (
    <img
      src="/hxlogo.svg"
      alt={alt}
      className={className}
      style={size ? { height: size, width: 'auto' } : undefined}
      referrerPolicy="no-referrer"
    />
  );
};