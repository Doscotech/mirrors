'use client';

import { vujahdayScript } from '@/app/fonts';

interface KortixLogoProps {
  size?: number;
  className?: string;
}

export function KortixLogo({ size = 24, className = '' }: KortixLogoProps) {
  // Calculate font size based on the size prop
  const fontSize = size * 1.2; // Make text slightly larger than the size
  
  return (
    <span 
      className={`${vujahdayScript.className} ${className}`}
      style={{ 
        fontSize: `${fontSize}px`,
        fontStyle: 'italic',
        color: 'hsl(var(--primary))',
        lineHeight: 1,
        display: 'inline-block'
      }}
    >
      Xera
    </span>
  );
}
