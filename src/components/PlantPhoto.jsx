import { useState } from 'react';
import PlantPortrait from './PlantPortrait';

// Real photo of a catalog plant, sourced from the nursery's reference sheet.
// A missing or failed image falls back to the illustrated portrait rather than
// leaving the browser's broken-image icon in the tile.
export default function PlantPhoto({ id, alt, size = 104, family = 'Foliage', className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <PlantPortrait family={family} id={id} size={size} className={className} />;
  }

  return (
    <img
      src={`/plants/${id}.jpg`}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`plant-photo ${className}`}
    />
  );
}
