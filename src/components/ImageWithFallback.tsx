"use client"
import { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const fallbackSrc = "https://via.placeholder.com/400x300.png?text=No+Imagen";
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setError(false);
  }, [src, fallbackSrc]);

  const handleOnError = () => {
    setError(true);
  };

  const resolvedSrc = error ? fallbackSrc : imgSrc;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={handleOnError}
    />
  );
}
