import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PropertyCard } from "@/components/ui/property-card";
import { SearchFilters } from "@/components/ui/search-filters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallback } from "react";
import { propertyTypes } from "@/lib/utils";

export default function PropertyListingPage() {
  const [location, search] = useLocation();
  const searchParams = new URLSearchParams(search || "");
  
  const [type, setType] = useState<string>(searchParams.get("type") || "any");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const limit = 8;
  
  // Extract filters from URL
  const initialFilters = {
    location: searchParams.get("location") || "",
    type: type,
    priceRange: searchParams.get("priceRange") || "any",
    bedrooms: searchParams.get("bedrooms") ? Number(searchParams.get("bedrooms")) : undefined,
    bathrooms: searchParams.get("bathrooms") ? Number(searchParams.get("bathrooms")) : undefined,
    amenities: searchParams.get("amenities") ? searchParams.get("amenities")?.split(",").map(Number) : undefined,
  };
  
  // Build query string for API call
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    if (initialFilters.location) params.append("location", initialFilters.location);
    if (type !== "any") params.append("type", type);
    if (initialFilters.priceRange && initialFilters.priceRange !== "any") params.append("priceRange", initialFilters.priceRange);
    if (initialFilters.bedrooms) params.append("bedrooms", initialFilters.bedrooms.toString());
    if (initialFilters.bathrooms) params.append("bathrooms", initialFilters.bathrooms.toString());
    if (initialFilters.amenities) params.append("amenities", initialFilters.amenities.join(","));
    
    params.append("limit", limit.toString());
    params.append("offset", ((page - 1) * limit).toString());
    
    return params.toString();
  }, [initialFilters, type, page, limit]);
  
  // Fetch properties based on filters
  const { data: properties, isLoading } = useQuery({
    queryKey: [`/api/properties/search?${buildQueryString()}`],
    keepPreviousData: true,
  });
  
  const handleTypeChange = (newType: string) => {
    setType(newType);
    setPage(1);
  };
  
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    // In a real app, we would update the query to include sort parameter
  };
  
  const handleSearch = (values: any) => {
    // Update URL with search params
    const params = new URLSearchParams();
    
    if (values.location) params.append("location", values.location);
    if (values.type && values.type !== "any") params.append("type", values.type);
    if (values.priceRange && values.priceRange !== "any") params.append("priceRange", values.priceRange);
    if (values.bedrooms) params.append("bedrooms", values.bedrooms.toString());
    if (values.bathrooms) params.append("bathrooms", values.bathrooms.toString());
    if (values.amenities && values.amenities.length > 0) params.append("amenities", values.amenities.join(","));
    
    window.history.pushState(null, "", `${location}?${params.toString()}`);
    
    // Set the filters locally
    setType(values.type || "any");
    setPage(1);
  };
  
  // Get the type display name
  const getTypeDisplayName = (typeId: string) => {
    if (typeId === "any") return "All Properties";
    const type = propertyTypes.find(t => t.id === typeId);
    return type ? `${type.name}s` : "Properties";
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Search Filters Section */}
        <section className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <SearchFilters onSearch={handleSearch} initialValues={initialFilters} />
          </div>
        </section>
        
        {/* Property Listings */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">
                {getTypeDisplayName(type)}
                {initialFilters.location && ` in ${initialFilters.location}`}
              </h1>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <label htmlFor="property-type" className="mr-2 text-sm text-gray-500">Type:</label>
                  <Select value={type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center">
                  <label htmlFor="sort-by" className="mr-2 text-sm text-gray-500">Sort:</label>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Results count */}
            <p className="text-gray-500 mb-6">
              {isLoading ? (
                "Loading properties..."
              ) : properties?.length > 0 ? (
                `Showing ${properties.length} properties`
              ) : (
                "No properties found matching your criteria"
              )}
            </p>
            
            {/* Property grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading ? (
                // Loading skeletons
                Array(limit).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg animate-pulse h-80"></div>
                ))
              ) : properties?.length > 0 ? (
                properties.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    We couldn't find any properties matching your search criteria. Try adjusting your filters or search in a different location.
                  </p>
                  <Button onClick={() => handleSearch({ type: "any", priceRange: "any" })}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {properties && properties.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    disabled={properties.length < limit}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
      <MobileNavigation />
    </div>
  );
}
