import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { PropertyCard } from "@/components/ui/property-card";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Home, Search } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["/api/favorites"],
  });
  
  // Filter favorites based on search term
  const filteredFavorites = favorites?.filter((property: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      property.title.toLowerCase().includes(searchLower) ||
      property.address.toLowerCase().includes(searchLower) ||
      property.city.toLowerCase().includes(searchLower) ||
      property.state.toLowerCase().includes(searchLower) ||
      property.zipCode.toLowerCase().includes(searchLower)
    );
  });
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardSidebar />
        <div className="flex-1 p-8 md:ml-64">
          <div className="text-center">
            <p>Please log in to view your favorites.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />
      
      <div className="flex-1 p-4 md:p-8 md:ml-64">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Properties</h1>
          <p className="text-gray-600">
            Manage your favorite listings and quickly access properties you're interested in.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search saved properties"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button asChild variant="outline">
            <Link href="/properties">
              <Search className="mr-2 h-4 w-4" />
              Explore More Properties
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : filteredFavorites?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((property: any) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : searchTerm ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <CardTitle className="mb-2 text-center">No Matching Properties</CardTitle>
              <CardDescription className="text-center mb-6">
                No saved properties match your search term "{searchTerm}".
              </CardDescription>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-gray-400" />
              </div>
              <CardTitle className="mb-2 text-center">No Saved Properties</CardTitle>
              <CardDescription className="text-center mb-6">
                You haven't saved any properties yet. Browse listings and save properties you're interested in.
              </CardDescription>
              <Button asChild>
                <Link href="/properties">
                  <Home className="mr-2 h-4 w-4" />
                  Browse Properties
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
