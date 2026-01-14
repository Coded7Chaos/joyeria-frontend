"use client"
import { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const handleOnError = () => {
    setError(true);
  };

  const fallbackSrc = "https://via.placeholder.com/400x300.png?text=No+Imagen";

  return (
    <img
      src={error ? fallbackSrc : imgSrc}
      alt={alt}
      className={className}
      onError={handleOnError}
    />
  );
}
