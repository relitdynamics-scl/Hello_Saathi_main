// Real photo of a catalog plant, sourced from the nursery's reference sheet.
export default function PlantPhoto({ id, alt, size = 104, className = '' }) {
  return (
    <img
      src={`/plants/${id}.jpg`}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={`plant-photo ${className}`}
    />
  );
}
