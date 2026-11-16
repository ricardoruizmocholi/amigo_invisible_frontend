import { ExternalLink, MapPinned } from 'lucide-react';
import { mapsEmbedUrl, mapsOpenUrl, placeQuery } from '../maps.js';

export default function PlaceMap({ place, compact = false }) {
  const query = placeQuery(place);
  if (!query) return null;

  const openUrl = mapsOpenUrl(query);

  return (
    <div className={`place-map${compact ? ' place-map--compact' : ''}`}>
      <a
        className="place-map__frame"
        href={openUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir ${place.title} en Maps`}
      >
        <iframe
          title={`Mapa de ${place.title}`}
          src={mapsEmbedUrl(query)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          tabIndex={-1}
          aria-hidden="true"
        />
        <span className="place-map__hit" aria-hidden="true" />
      </a>
      {place.address && <p className="place-map__address">{place.address}</p>}
      <a className="btn btn--ghost btn--block" href={openUrl} target="_blank" rel="noopener noreferrer">
        <MapPinned size={18} aria-hidden="true" /> Abrir en Maps
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
