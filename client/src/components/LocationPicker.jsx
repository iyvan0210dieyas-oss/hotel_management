import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

const pickerPinIcon = L.divIcon({
  className: 'custom-picker-marker',
  html: `
    <div style="
      background: #ef4444;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">
      <div style="transform: rotate(45deg); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to handle clicks on the map and set new coordinates
const LocationMarkerListener = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Re-centers map when coordinates change via text input or geolocation
const RecenterOnCoords = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom() || 13, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
};

const LocationPicker = ({ latitude, longitude, onLocationSelect }) => {
  const defaultLat = 40.7128; // New York default if not set
  const defaultLng = -74.0060;

  const currentLat = !isNaN(Number(latitude)) && latitude !== '' ? Number(latitude) : defaultLat;
  const currentLng = !isNaN(Number(longitude)) && longitude !== '' ? Number(longitude) : defaultLng;

  return (
    <div className="map-picker-container">
      <MapContainer
        center={[currentLat, currentLng]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarkerListener onLocationSelect={onLocationSelect} />
        <RecenterOnCoords lat={currentLat} lng={currentLng} />
        <Marker position={[currentLat, currentLng]} icon={pickerPinIcon} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
