import { useState } from 'react';
import Image from 'next/image';

interface ZoomImageProps {
  src: string;
  alt: string;
}

export function ZoomImage({ src, alt }: ZoomImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPosition({ x, y });
  };

  return (
    <div 
      className="relative overflow-hidden rounded-lg cursor-zoom-in"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-200"
        style={{
          transform: isZoomed ? 'scale(2)' : 'scale(1)',
          transformOrigin: `${position.x}% ${position.y}%`
        }}
      />
    </div>
  );
} 