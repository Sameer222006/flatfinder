import { useState } from "react";
import { PropertyWithRelations, Amenity, User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BedDouble, 
  Bath, 
  Ruler, 
  MapPin, 
  Calendar, 
  Heart, 
  MessageSquare,
  CheckCircle 
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Map } from "@/components/ui/map";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageCompose } from "@/components/messaging/message-compose";

interface PropertyDetailsProps {
  property: PropertyWithRelations & { isFavorite?: boolean };
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);

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
  
  const toggleFavorite = () => {
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

  const isOwner = user?.id === property.ownerId;
  const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{property.title}</h1>
          <p className="mt-1 text-gray-500 flex items-center">
            <MapPin className="h-4 w-4 mr-1" /> {fullAddress}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant={isFavorite ? "default" : "outline"}
            onClick={toggleFavorite}
            disabled={isOwner}
            className={isFavorite ? "bg-red-500 hover:bg-red-600" : ""}
          >
            <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-white" : ""}`} />
            {isFavorite ? "Saved" : "Save"}
          </Button>

          {!isOwner && user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Owner
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Contact Property Owner</SheetTitle>
                  <SheetDescription>
                    Send a message to {property.owner.name} about this property.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <MessageCompose 
                    receiverId={property.ownerId} 
                    propertyId={property.id}
                    propertyTitle={property.title}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Badge variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
          {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
        </Badge>
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
          <BedDouble className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-sm font-medium">
            {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
          </span>
        </div>
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
          <Bath className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-sm font-medium">
            {Number(property.bathrooms)} {Number(property.bathrooms) === 1 ? 'Bathroom' : 'Bathrooms'}
          </span>
        </div>
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
          <Ruler className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-sm font-medium">{property.area} sq.ft</span>
        </div>
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-sm font-medium">Available Now</span>
        </div>
        <div className="text-2xl font-bold text-primary-600 ml-auto">
          {formatPrice(Number(property.price))}<span className="text-gray-500 text-lg font-normal">/month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="text-gray-600 space-y-4">
                <p>{property.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              {property.amenities && property.amenities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.amenities.map((amenity: Amenity) => (
                    <div key={amenity.id} className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No amenities listed</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-[400px] w-full">
                <Map 
                  properties={[property]} 
                  selectedPropertyId={property.id}
                  height="400px"
                />
              </div>
              <p className="mt-4 text-gray-600">{fullAddress}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Property Owner</h2>
              <div className="flex items-center">
                <Avatar className="h-12 w-12">
                  {property.owner.avatar ? (
                    <AvatarImage src={property.owner.avatar} alt={property.owner.name} />
                  ) : (
                    <AvatarFallback>{property.owner.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-4">
                  <h3 className="font-medium">{property.owner.name}</h3>
                  <p className="text-sm text-gray-500">Member since {formatDate(property.owner.createdAt)}</p>
                </div>
              </div>
              {!isOwner && user && (
                <div className="mt-6">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contact Owner
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-md">
                      <SheetHeader>
                        <SheetTitle>Contact Property Owner</SheetTitle>
                        <SheetDescription>
                          Send a message to {property.owner.name} about this property.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-6">
                        <MessageCompose 
                          receiverId={property.ownerId} 
                          propertyId={property.id}
                          propertyTitle={property.title}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium">{property.type.charAt(0).toUpperCase() + property.type.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bedrooms</span>
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bathrooms</span>
                  <span className="font-medium">{Number(property.bathrooms)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Area</span>
                  <span className="font-medium">{property.area} sq.ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Listed</span>
                  <span className="font-medium">{formatDate(property.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium">{formatDate(property.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
