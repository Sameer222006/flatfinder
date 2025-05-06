import { useRef, useState, useCallback } from 'react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markers?: Array<{
    id: number;
    position: {
      lat: number;
      lng: number;
    };
    title?: string;
    onClick?: () => void;
  }>;
  height?: string;
  width?: string;
  onLoad?: () => void;
  className?: string;
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060 // New York City default
};

export function Map({
  center = defaultCenter,
  zoom = 13,
  markers = [],
  height = '400px',
  width = '100%',
  onLoad,
  className = '',
}: MapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
    if (onLoad) onLoad();
  }, [onLoad]);

  const containerStyle = {
    width,
    height,
  };

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <LoadScript
        googleMapsApiKey={import.meta.env.GOOGLE_MAPS_API_KEY || ''}
        loadingElement={<div className="h-full w-full flex items-center justify-center">Loading map...</div>}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          onLoad={handleMapLoad}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true,
          }}
        >
          {isMapLoaded && markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              title={marker.title}
              onClick={marker.onClick}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}