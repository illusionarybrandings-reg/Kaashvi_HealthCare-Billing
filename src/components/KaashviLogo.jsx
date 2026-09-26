import React from 'react';

export default function KaashviLogo({ variant = "full", height = 48, className = "" }) {
  if (variant === "icon") {
    return (
      <img 
        src="/assets/logo.png" 
        alt="Kaashvi Healthcare Icon" 
        className={className} 
        style={{ 
          height: `${height}px`, 
          width: `${height}px`, 
          objectFit: 'contain',
          objectPosition: 'left center',
          display: 'block' 
        }} 
      />
    );
  }

  return (
    <img 
      src="/assets/logo.png" 
      alt="Kaashvi Healthcare Logo" 
      className={className} 
      style={{ 
        height: `${height}px`, 
        width: 'auto', 
        maxWidth: '100%', 
        objectFit: 'contain', 
        display: 'block' 
      }} 
    />
  );
}
