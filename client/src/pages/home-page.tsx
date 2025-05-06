import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SearchFilters } from "@/components/ui/search-filters";
import { PropertyCard } from "@/components/ui/property-card";
import { CategoryCard } from "@/components/ui/category-card";
import { Button } from "@/components/ui/button";
import { Map } from "@/components/ui/map";
import { PropertySearch } from "@shared/schema";
import { useMobile } from "@/hooks/use-mobile";

export default function HomePage() {
  const isMobile = useMobile();
  const [, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState<PropertySearch>({
    location: "",
    type: "any",
    priceRange: "any",
  });

  // Fetch featured properties
  const { data: featuredProperties, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ["/api/properties", { limit: 4 }],
  });

  const handleSearch = (values: PropertySearch) => {
    const searchQueryParams = new URLSearchParams();
    
    if (values.location) searchQueryParams.append("location", values.location);
    if (values.type && values.type !== "any") searchQueryParams.append("type", values.type);
    if (values.priceRange && values.priceRange !== "any") searchQueryParams.append("priceRange", values.priceRange);
    if (values.bedrooms) searchQueryParams.append("bedrooms", values.bedrooms.toString());
    if (values.bathrooms) searchQueryParams.append("bathrooms", values.bathrooms.toString());
    if (values.amenities && values.amenities.length > 0) {
      searchQueryParams.append("amenities", values.amenities.join(","));
    }
    
    navigate(`/search?${searchQueryParams.toString()}`);
  };

  // Categories for browsing
  const categories = [
    {
      title: "Luxury Apartments",
      description: "Premium living spaces",
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      href: "/properties?type=apartment"
    },
    {
      title: "Studios & Lofts",
      description: "Perfect for individuals",
      imageUrl: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      href: "/properties?type=studio"
    },
    {
      title: "Family Houses",
      description: "Spacious homes with gardens",
      imageUrl: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      href: "/properties?type=house"
    },
    {
      title: "Furnished Places",
      description: "Move-in ready properties",
      imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      href: "/properties"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gray-900 py-24">
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
              alt="City skyline" 
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl text-center">
              Find Your Perfect Home
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl text-center">
              Thousands of apartments and houses available for rent or purchase
            </p>
            <div className="mt-10 w-full max-w-4xl">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <SearchFilters 
                    onSearch={handleSearch} 
                    initialValues={searchParams}
                    compact={isMobile}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Featured Listings</h2>
              <Button variant="link" asChild>
                <a href="/properties" className="text-primary-600 hover:text-primary-500 font-medium flex items-center">
                  View all <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </Button>
            </div>
            
            <div className="mt-8 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
              {isLoadingFeatured ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg animate-pulse h-80"></div>
                ))
              ) : featuredProperties?.length > 0 ? (
                featuredProperties.map((property: any) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                    featured={property.id % 2 === 0} // Just for demo purposes
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No featured properties available
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Map Explorer */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Explore by Map</h2>
            <p className="mt-2 text-gray-600">Find properties in your preferred neighborhood</p>
            
            <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-medium text-gray-900">Search Results</h3>
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-medium">
                      {featuredProperties?.length || 0} properties
                    </span>
                  </div>
                  
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {isLoadingFeatured ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex border border-gray-200 rounded-lg overflow-hidden">
                          <div className="w-20 h-20 bg-gray-200 animate-pulse"></div>
                          <div className="p-3 flex-1">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                            <div className="h-3 bg-gray-100 rounded animate-pulse mb-2 w-1/2"></div>
                            <div className="flex justify-between items-center">
                              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4"></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : featuredProperties?.length > 0 ? (
                      featuredProperties.map((property: any) => (
                        <a
                          key={property.id}
                          href={`/properties/${property.id}`}
                          className="flex border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50"
                        >
                          <img
                            src={property.images?.[0]?.url || "https://images.unsplash.com/photo-1580041065738-e72023775cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=90"}
                            alt={property.title}
                            className="w-20 h-20 object-cover flex-shrink-0"
                          />
                          <div className="p-3 flex-1">
                            <h4 className="font-medium text-sm text-gray-900">{property.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{property.city}, {property.state}</p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="font-medium text-sm">${Number(property.price).toLocaleString()}/mo</span>
                              <div className="flex items-center space-x-1 text-xs">
                                <span className="text-gray-500">{property.bedrooms} bed</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-500">{Number(property.bathrooms)} bath</span>
                              </div>
                            </div>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No properties available
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <Map 
                    center={
                      featuredProperties && featuredProperties.length > 0 && 
                      featuredProperties[0].latitude && featuredProperties[0].longitude
                        ? {
                            lat: parseFloat(featuredProperties[0].latitude),
                            lng: parseFloat(featuredProperties[0].longitude)
                          }
                        : { lat: 40.7128, lng: -74.0060 }
                    }
                    markers={
                      featuredProperties && featuredProperties.length > 0
                        ? featuredProperties.map((property: any) => ({
                            id: property.id,
                            position: {
                              lat: property.latitude ? parseFloat(property.latitude) : 40.7128,
                              lng: property.longitude ? parseFloat(property.longitude) : -74.0060
                            },
                            title: property.title,
                            onClick: () => window.location.href = `/properties/${property.id}`
                          }))
                        : []
                    }
                    height="600px"
                    zoom={12}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Property Categories */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <p className="mt-2 text-gray-600">Find the perfect property based on your needs</p>
            
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <CategoryCard key={index} {...category} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">List Your Property with Us</h2>
                <p className="mt-4 text-primary-100 text-lg">Join thousands of property owners who have successfully found reliable tenants through our platform.</p>
                <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                  <Button asChild className="bg-white text-primary-700 hover:bg-primary-50">
                    <a href="/add-property">List Your Property</a>
                  </Button>
                  <Button asChild variant="outline" className="border-white text-white hover:bg-primary-500">
                    <a href="/properties">Learn More</a>
                  </Button>
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white bg-primary-500 p-1 rounded-full" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-primary-100">Verified tenants</p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white bg-primary-500 p-1 rounded-full" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-primary-100">Secure payments</p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white bg-primary-500 p-1 rounded-full" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-primary-100">24/7 support</p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block relative h-96">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=800" 
                  alt="Property owner with tenants" 
                  className="rounded-xl absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs">
                  <div className="flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <h3 className="font-bold text-gray-900 ml-2">Trusted by Owners</h3>
                  </div>
                  <p className="text-gray-600">Over 10,000 property owners trust our platform to find reliable tenants quickly and efficiently.</p>
                </div>
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
