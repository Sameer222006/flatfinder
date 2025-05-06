import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyDetails } from "@/components/property/property-details";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";

export default function PropertyDetailsPage() {
  const [, params] = useRoute("/properties/:id");
  const propertyId = params?.id ? parseInt(params.id) : undefined;
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
  });
  
  const [activeTab, setActiveTab] = useState<"details" | "gallery">("details");
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <MobileNavigation />
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Property Not Found</h1>
              <p className="text-gray-600 mb-8">
                We couldn't find the property you're looking for. It may have been removed or the URL might be incorrect.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild variant="outline">
                  <Link href="/properties">
                    <Home className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Homepage
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <MobileNavigation />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile tabs */}
          <div className="md:hidden mb-6">
            <div className="flex border-b">
              <button
                className={`flex-1 py-3 font-medium text-sm ${
                  activeTab === "details"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
              <button
                className={`flex-1 py-3 font-medium text-sm ${
                  activeTab === "gallery"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("gallery")}
              >
                Photos
              </button>
            </div>
          </div>
          
          {/* Desktop layout */}
          <div className="hidden md:block mb-8">
            <PropertyGallery 
              images={property.images || []} 
              title={property.title}
            />
          </div>
          
          {/* Mobile layout */}
          <div className="md:hidden">
            {activeTab === "gallery" ? (
              <div className="mb-8">
                <PropertyGallery 
                  images={property.images || []} 
                  title={property.title}
                />
              </div>
            ) : (
              <PropertyDetails property={property} />
            )}
          </div>
          
          {/* Desktop layout for details */}
          <div className="hidden md:block">
            <PropertyDetails property={property} />
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNavigation />
    </div>
  );
}
