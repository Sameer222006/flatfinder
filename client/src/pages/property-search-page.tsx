import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SearchFilters } from "@/components/ui/search-filters";
import { PropertyCard } from "@/components/ui/property-card";
import { Map } from "@/components/ui/map";
import { PropertySearch } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

export default function PropertySearchPage() {
  const isMobile = useMobile();
  const [location, search] = useLocation();
  const searchParams = new URLSearchParams(search || "");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // Get search filters from URL
  const initialFilters: PropertySearch = {
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "any",
    priceRange: searchParams.get("priceRange") || "any",
    bedrooms: searchParams.get("bedrooms") ? Number(searchParams.get("bedrooms")) : undefined,
    bathrooms: searchParams.get("bathrooms") ? Number(searchParams.get("bathrooms")) : undefined,
    amenities: searchParams.get("amenities") ? searchParams.get("amenities")?.split(",").map(Number) : undefined,
  };
  
  // Build query string for API call
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    if (initialFilters.location) params.append("location", initialFilters.location);
    if (initialFilters.type && initialFilters.type !== "any") params.append("type", initialFilters.type);
    if (initialFilters.priceRange && initialFilters.priceRange !== "any") params.append("priceRange", initialFilters.priceRange);
    if (initialFilters.bedrooms) params.append("bedrooms", initialFilters.bedrooms.toString());
    if (initialFilters.bathrooms) params.append("bathrooms", initialFilters.bathrooms.toString());
    if (initialFilters.amenities && initialFilters.amenities.length > 0) {
      params.append("amenities", initialFilters.amenities.join(","));
    }
    
    params.append("limit", limit.toString());
    params.append("offset", ((page - 1) * limit).toString());
    
    return params.toString();
  }, [initialFilters, page, limit]);
  
  // Fetch properties based on filters
  const { data: properties, isLoading } = useQuery({
    queryKey: [`/api/properties/search?${buildQueryString()}`],
    keepPreviousData: true,
  });
  
  // Select first property in results by default
  useEffect(() => {
    if (properties && properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);
  
  const handleSearch = (values: PropertySearch) => {
    // Update URL with search params
    const params = new URLSearchParams();
    
    if (values.location) params.append("location", values.location);
    if (values.type && values.type !== "any") params.append("type", values.type);
    if (values.priceRange && values.priceRange !== "any") params.append("priceRange", values.priceRange);
    if (values.bedrooms) params.append("bedrooms", values.bedrooms.toString());
    if (values.bathrooms) params.append("bathrooms", values.bathrooms.toString());
    if (values.amenities && values.amenities.length > 0) {
      params.append("amenities", values.amenities.join(","));
    }
    
    window.history.pushState(null, "", `${location}?${params.toString()}`);
    
    // Reset page and selected property
    setPage(1);
    setSelectedPropertyId(undefined);
  };
  
  const handleSelectProperty = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    // Scroll to property card on mobile
    if (isMobile) {
      const propertyElement = document.getElementById(`property-${propertyId}`);
      if (propertyElement) {
        propertyElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
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
        
        {/* Map and Results Section */}
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Map (shows on top for mobile, on right for desktop) */}
              <div className={`${isMobile ? 'order-1' : 'order-2 md:w-1/2 lg:w-3/5 md:sticky md:top-20 md:self-start'}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Map 
                    properties={properties} 
                    selectedPropertyId={selectedPropertyId}
                    onSelectProperty={handleSelectProperty}
                    height={isMobile ? "300px" : "calc(100vh - 200px)"}
                  />
                </div>
              </div>
              
              {/* Results list */}
              <div className={`${isMobile ? 'order-2' : 'order-1 md:w-1/2 lg:w-2/5'}`}>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isLoading ? "Searching..." : properties?.length ? `${properties.length} Results` : "No Results Found"}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {isLoading ? (
                    // Loading skeletons
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg animate-pulse h-36"></div>
                    ))
                  ) : properties?.length > 0 ? (
                    properties.map((property) => (
                      <div 
                        id={`property-${property.id}`}
                        key={property.id} 
                        className={`transition-all ${selectedPropertyId === property.id ? 'ring-2 ring-primary-500 scale-[1.02]' : ''}`}
                        onClick={() => handleSelectProperty(property.id)}
                      >
                        <PropertyCard 
                          property={property} 
                          className="h-full cursor-pointer"
                          showDetailsButton={false}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                      <p className="text-gray-500 mb-6">
                        Try adjusting your search filters or looking in a different location.
                      </p>
                      <Button 
                        onClick={() => handleSearch({ 
                          location: "", 
                          type: "any", 
                          priceRange: "any" 
                        })}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Pagination */}
                {properties && properties.length >= limit && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <MobileNavigation />
    </div>
  );
}
