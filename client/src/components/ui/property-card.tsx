import { useState } from "react";
import { Link } from "wouter";
import { formatPrice } from "@/lib/utils";
import { Property } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, BedDouble, Bath, Ruler, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PropertyCardProps {
  property: Property & {
    images?: { id: number; url: string; isPrimary?: boolean }[];
    isFavorite?: boolean;
  };
  featured?: boolean;
  className?: string;
  showDetailsButton?: boolean;
}

export function PropertyCard({ 
  property, 
  featured = false, 
  className = "", 
  showDetailsButton = true 
}: PropertyCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);
  
  // Get the primary image or the first image
  const primaryImage = property.images?.find(img => img.isPrimary) || 
                      property.images?.[0] || 
                      { url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500' };
  
  const propertyAddress = `${property.address}, ${property.city}, ${property.state}`;
  
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/favorites", { propertyId: property.id });
      return res.json();
    },
    onSuccess: () => {
      setIsFavorite(true);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: "Property has been added to your favorites",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });
  
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/favorites/${property.id}`);
    },
    onSuccess: () => {
      setIsFavorite(false);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from favorites",
        description: "Property has been removed from your favorites",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save properties to your favorites",
        variant: "destructive",
      });
      return;
    }
    
    if (isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };
  
  return (
    <Card className={`group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md ${className}`}>
      <Link href={`/properties/${property.id}`}>
        <a className="block">
          <div className="relative w-full h-60 overflow-hidden">
            <img 
              src={primaryImage.url} 
              alt={property.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute top-0 right-0 p-2">
              <button 
                type="button" 
                className={`p-1.5 rounded-full ${isFavorite ? 'bg-white text-red-500' : 'bg-white/80 hover:bg-white text-gray-700'} transition-colors`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <div className="flex items-center justify-between">
                {featured && (
                  <Badge className="bg-secondary-500 hover:bg-secondary-600">
                    Featured
                  </Badge>
                )}
                <div className="text-white font-semibold">
                  {formatPrice(Number(property.price))}/mo
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 text-lg">{property.title}</h3>
            <p className="mt-1 text-gray-500 text-sm flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              {propertyAddress}
            </p>
            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <BedDouble className="mr-1 h-4 w-4" /> 
                {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}
              </div>
              <div className="flex items-center">
                <Bath className="mr-1 h-4 w-4" /> 
                {Number(property.bathrooms)} {Number(property.bathrooms) === 1 ? 'bath' : 'baths'}
              </div>
              <div className="flex items-center">
                <Ruler className="mr-1 h-4 w-4" /> 
                {property.area} sq.ft
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">4.8</span>
                <span className="text-gray-500 text-sm">(24 reviews)</span>
              </div>
              {showDetailsButton && (
                <Button size="sm" variant="outline">
                  Details
                </Button>
              )}
            </div>
          </div>
        </a>
      </Link>
    </Card>
  );
}
