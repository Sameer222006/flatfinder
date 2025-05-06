import { useEffect, useRef, useState } from 'react';
import { Input } from './input';
import { GOOGLE_MAPS_API_KEY } from '@/lib/api-keys';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Enter location',
  className = '',
  disabled = false,
  required = false
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps Places API script
  useEffect(() => {
    if (window.google?.maps?.places) {
      setScriptLoaded(true);
      return;
    }

    // Check if script already exists
    const existingScript = document.getElementById('google-maps-places-script');
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-places-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    
    document.body.appendChild(script);

    return () => {
      // Don't remove the script on component unmount as other components might need it
    };
  }, []);

  // Initialize autocomplete once script is loaded and input ref is available
  useEffect(() => {
    if (!scriptLoaded || !inputRef.current) return;

    // Initialize the autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'], // Restrict to geographical locations
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
    });

    // Add listener for place selection
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address) {
        onChange(place.formatted_address);
      } else if (place?.name) {
        onChange(place.name);
      }
    });

    setIsLoaded(true);

    return () => {
      // Remove listener when component unmounts
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [scriptLoaded, onChange]);

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      disabled={disabled || !isLoaded}
      required={required}
    />
  );
}