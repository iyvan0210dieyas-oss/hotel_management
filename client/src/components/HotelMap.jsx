import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, Navigation } from 'lucide-react';

// Custom clean SVG pin icon to avoid broken default marker paths in Vite/Leaflet
const hotelPinIcon = L.divIcon({
  className: 'custom-hotel-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #1e3a8a, #2563eb);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">
      <svg style="transform: rotate(45deg); width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 22v-6.57"/>
        <path d="M12 11h.01"/>
        <path d="M12 7h.01"/>
        <path d="M14 15.43V22"/>
        <path d="M15 11h.01"/>
        <path d="M15 7h.01"/>
        <path d="M16 16h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
        <path d="M18 22v-4"/>
        <path d="M6 18v4"/>
        <path d="M9 11h.01"/>
        <path d="M9 7h.01"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Helper component to smoothly re-center map when coordinates change
const MapRecenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], 14, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
};

const HotelMap = ({ latitude, longitude, title, price, address }) => {
  const lat = Number(latitude) || 0;
  const lng = Number(longitude) || 0;

  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="hotel-map-box">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter lat={lat} lng={lng} />
        <Marker position={[lat, lng]} icon={hotelPinIcon}>
          <Popup>
            <div style={{ padding: '4px', maxWidth: '200px' }}>
              <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                {title || 'Hotel Location'}
              </strong>
              {price && (
                <div style={{ color: '#2563eb', fontWeight: 'bold', marginBottom: '6px' }}>
                  ${Number(price).toLocaleString()} / night
                </div>
              )}
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
                Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: '#2563eb',
                    fontWeight: 600,
                  }}
                >
                  <Navigation size={12} /> Directions
                </a>
                <a
                  href={osmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: '#64748b',
                  }}
                >
                  <ExternalLink size={12} /> OSM
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default HotelMap;
