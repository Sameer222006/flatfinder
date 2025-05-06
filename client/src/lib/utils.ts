import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const propertyTypes = [
  { id: "any", name: "Any type" },
  { id: "apartment", name: "Apartment" },
  { id: "house", name: "House" },
  { id: "studio", name: "Studio" },
  { id: "condo", name: "Condo" },
  { id: "townhouse", name: "Townhouse" },
  { id: "duplex", name: "Duplex" },
];

export const priceRanges = [
  { id: "any", name: "Any price" },
  { id: "500-1000", name: "$500 - $1,000" },
  { id: "1000-1500", name: "$1,000 - $1,500" },
  { id: "1500-2000", name: "$1,500 - $2,000" },
  { id: "2000-3000", name: "$2,000 - $3,000" },
  { id: "3000+", name: "$3,000+" },
];

export function getPriceRangeValues(rangeId: string): { min?: number; max?: number } {
  switch (rangeId) {
    case "500-1000":
      return { min: 500, max: 1000 };
    case "1000-1500":
      return { min: 1000, max: 1500 };
    case "1500-2000":
      return { min: 1500, max: 2000 };
    case "2000-3000":
      return { min: 2000, max: 3000 };
    case "3000+":
      return { min: 3000 };
    default:
      return {};
  }
}

export function getCoordinatesFromAddress(address: string, city: string, state: string): { lat: number; lng: number } {
  // This would normally call the Google Geocoding API
  // For now, we'll simulate coordinates based on the address info
  
  // State-based default coordinates (rough center points)
  const stateCoordinates: Record<string, { lat: number; lng: number }> = {
    'NY': { lat: 40.7128, lng: -74.0060 }, // New York
    'CA': { lat: 37.7749, lng: -122.4194 }, // San Francisco
    'TX': { lat: 29.7604, lng: -95.3698 }, // Houston
    'FL': { lat: 25.7617, lng: -80.1918 }, // Miami
    'IL': { lat: 41.8781, lng: -87.6298 }, // Chicago
    'AZ': { lat: 33.4484, lng: -112.0740 }, // Phoenix
    'WA': { lat: 47.6062, lng: -122.3321 }, // Seattle
    'MA': { lat: 42.3601, lng: -71.0589 }, // Boston
  };
  
  // Use state coordinates or default to New York
  const baseCoords = stateCoordinates[state] || { lat: 40.7128, lng: -74.0060 };
  
  // Use string hashing to generate "realistic" variations based on address and city
  const addressHash = address.split('').reduce((acc, char) => 
    ((acc << 5) - acc) + char.charCodeAt(0), 0) / 10000000;
  
  const cityHash = city.split('').reduce((acc, char) => 
    ((acc << 5) - acc) + char.charCodeAt(0), 0) / 10000000;
  
  return {
    lat: baseCoords.lat + (addressHash * 0.1),
    lng: baseCoords.lng + (cityHash * 0.1)
  };
}

export function getMapCenter(properties: any[] | undefined): { lat: number; lng: number } {
  if (!properties || properties.length === 0) {
    // Default to New York City
    return { lat: 40.7128, lng: -74.0060 };
  }
  
  // If the properties have latitude/longitude, use those
  const propertiesWithCoords = properties.filter(p => p.latitude && p.longitude);
  if (propertiesWithCoords.length > 0) {
    // Calculate the average of all property coordinates
    const sum = propertiesWithCoords.reduce(
      (acc, property) => {
        return {
          lat: acc.lat + parseFloat(property.latitude),
          lng: acc.lng + parseFloat(property.longitude),
        };
      },
      { lat: 0, lng: 0 }
    );

    return {
      lat: sum.lat / propertiesWithCoords.length,
      lng: sum.lng / propertiesWithCoords.length,
    };
  }
  
  // If no coordinates, use the first property's address
  if (properties[0] && properties[0].address) {
    return getCoordinatesFromAddress(
      properties[0].address,
      properties[0].city,
      properties[0].state
    );
  }
  
  // Default to New York City
  return { lat: 40.7128, lng: -74.0060 };
}

export function getPropertiesAsMapMarkers(properties: any[]): Array<{
  id: number;
  position: { lat: number; lng: number };
  title: string;
}> {
  return properties.map(property => {
    let position: { lat: number; lng: number };
    
    // Use existing coordinates if available
    if (property.latitude && property.longitude) {
      position = {
        lat: parseFloat(property.latitude),
        lng: parseFloat(property.longitude)
      };
    } else {
      // Otherwise generate from address
      position = getCoordinatesFromAddress(
        property.address,
        property.city,
        property.state
      );
    }
    
    return {
      id: property.id,
      position,
      title: property.title
    };
  });
}
