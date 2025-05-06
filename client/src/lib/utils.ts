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

export function getMapCenter(properties: any[] | undefined): { lat: number; lng: number } {
  if (!properties || properties.length === 0) {
    // Default to San Francisco
    return { lat: 37.7749, lng: -122.4194 };
  }

  // Calculate the average of all property coordinates
  const sum = properties.reduce(
    (acc, property) => {
      return {
        lat: acc.lat + property.latitude,
        lng: acc.lng + property.longitude,
      };
    },
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / properties.length,
    lng: sum.lng / properties.length,
  };
}
