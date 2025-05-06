import { useState } from "react";
import { useLocation } from "wouter";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { PropertyForm } from "@/components/property/property-form";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export default function AddPropertyPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const isOwner = user?.role === 'owner';
  
  const handleSuccess = (property: any) => {
    if (formSubmitted) {
      // Navigate to the property details page
      navigate(`/properties/${property.id}`);
    } else {
      setFormSubmitted(true);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardSidebar />
        <div className="flex-1 p-8 md:ml-64 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="mb-2">Authentication Required</CardTitle>
                <CardDescription className="mb-6">
                  Please log in to add a property.
                </CardDescription>
                <Button asChild>
                  <a href="/auth">Sign In</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardSidebar />
        <div className="flex-1 p-8 md:ml-64 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="mb-2">Owner Account Required</CardTitle>
                <CardDescription className="mb-6">
                  Only property owners can list properties. Please update your account to an owner account to continue.
                </CardDescription>
                <Button asChild>
                  <a href="/account">Update Account</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />
      
      <div className="flex-1 p-4 md:p-8 md:ml-64">
        {formSubmitted ? (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <CardTitle className="text-2xl mb-2">Property Added Successfully!</CardTitle>
                  <CardDescription className="text-base mb-8">
                    Your property has been listed and is now visible to potential tenants.
                  </CardDescription>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button asChild variant="outline">
                      <a href="/dashboard/properties">
                        View All Properties
                      </a>
                    </Button>
                    <Button asChild>
                      <a href="/add-property" onClick={() => setFormSubmitted(false)}>
                        Add Another Property
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-6">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <PropertyForm onSuccess={handleSuccess} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
