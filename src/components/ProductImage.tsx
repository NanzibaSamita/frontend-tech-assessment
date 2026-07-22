import { useState } from "react";

interface ProductImageProps {
  imageUrl: string;
  name: string;
  className?: string;
}

export function ProductImage({ imageUrl, name, className = "" }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <div className={`product-image-placeholder ${className}`.trim()}>
        <span aria-hidden="true">▧</span>
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      alt={name}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
      src={imageUrl}
    />
  );
}
