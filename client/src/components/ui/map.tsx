import { useEffect, useRef, useState } from "react";
import { Property } from "@shared/schema";
import { getMapCenter } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface MapProps {
  properties: Property[] | undefined;
  selectedPropertyId?: number;
  onSelectProperty?: (propertyId: number) => void;
  height?: string;
}

interface LeafletInstance {
  map: any;
  markers: any[];
}

export function Map({ properties, selectedPropertyId, onSelectProperty, height = "600px" }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<LeafletInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load leaflet dynamically
  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        // Only load Leaflet once
        if (typeof window !== "undefined" && !window.L) {
          // Dynamically load Leaflet CSS
          const linkEl = document.createElement("link");
          linkEl.rel = "stylesheet";
          linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(linkEl);

          // Dynamically load Leaflet JS
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (mapRef.current && !leafletRef.current && window.L) {
          const center = getMapCenter(properties);
          
          const map = window.L.map(mapRef.current).setView([center.lat, center.lng], 13);
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          leafletRef.current = { map, markers: [] };
          
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed to load Leaflet", err);
        if (isMounted) {
          setError("Failed to load map. Please try again later.");
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (leafletRef.current?.map) {
        leafletRef.current.map.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!leafletRef.current || !properties || properties.length === 0) return;

    // Remove existing markers
    leafletRef.current.markers.forEach(marker => marker.remove());
    leafletRef.current.markers = [];

    // Add markers for each property
    properties.forEach(property => {
      const { latitude, longitude, id, price } = property;
      
      const isSelected = id === selectedPropertyId;
      
      // Custom icon
      const icon = window.L.divIcon({
        className: 'custom-marker',
        html: `<div class="${isSelected ? 'bg-primary-600' : 'bg-gray-800'} text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">$${Number(price).toLocaleString()}</div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 30]
      });
      
      const marker = window.L.marker([Number(latitude), Number(longitude)], { icon }).addTo(leafletRef.current!.map);
      
      if (onSelectProperty) {
        marker.on('click', () => {
          onSelectProperty(id);
        });
      }
      
      leafletRef.current!.markers.push(marker);
    });

    // Pan to selected property or center of all properties
    if (selectedPropertyId && properties.find(p => p.id === selectedPropertyId)) {
      const selected = properties.find(p => p.id === selectedPropertyId)!;
      leafletRef.current.map.setView([Number(selected.latitude), Number(selected.longitude)], 15);
    } else {
      const center = getMapCenter(properties);
      leafletRef.current.map.setView([center.lat, center.lng], 13);
    }
  }, [properties, selectedPropertyId, onSelectProperty]);

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg p-8" style={{ height }}>
        <MapPin className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Map Unavailable</h3>
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <div ref={mapRef} className="w-full h-full"></div>
    </div>
  );
}
