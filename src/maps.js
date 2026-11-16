export function placeQuery(place) {
  if (!place) return '';
  const parts = [place.title, place.address].filter(Boolean);
  return parts.join(', ');
}

export function mapsOpenUrl(query) {
  const encoded = encodeURIComponent(query);
  if (/iPhone|iPad|Macintosh/.test(navigator.userAgent)) {
    return `https://maps.apple.com/?q=${encoded}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

export function mapsEmbedUrl(query) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&hl=es&output=embed`;
}
