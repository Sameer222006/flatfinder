import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { PropertyCard } from "@/components/ui/property-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { AlertCircle, ChevronRight, Home, MessageSquare, Heart, User, Plus, Settings } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  
  const { data: properties } = useQuery({
    queryKey: ["/api/dashboard/properties"],
    enabled: isOwner,
  });
  
  const { data: favorites } = useQuery({
    queryKey: ["/api/favorites"],
  });
  
  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
  });
  
  // Count unread messages
  const unreadCount = conversations?.reduce((count, convo) => count + (convo.unreadCount || 0), 0) || 0;
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />
      
      <div className="flex-1 p-4 md:p-8 md:ml-64">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600">
            {isOwner 
              ? "Manage your properties, track inquiries, and update your profile." 
              : "Find your perfect home, manage your saved properties, and contact owners."}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {isOwner ? "My Properties" : "Saved Properties"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isOwner ? properties?.length || 0 : favorites?.length || 0}
                </div>
                <div className={`p-2 rounded-full ${isOwner ? "bg-blue-100" : "bg-red-100"}`}>
                  {isOwner ? <Home className="h-5 w-5 text-blue-600" /> : <Heart className="h-5 w-5 text-red-600" />}
                </div>
              </div>
              <div className="mt-4">
                <Button variant="ghost" size="sm" asChild className="px-0 text-primary-600">
                  <Link href={isOwner ? "/dashboard/properties" : "/favorites"}>
                    <span>View all</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {conversations?.length || 0}
                </div>
                <div className="relative">
                  <div className="p-2 rounded-full bg-purple-100">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Button variant="ghost" size="sm" asChild className="px-0 text-primary-600">
                  <Link href="/messages">
                    <span>View messages</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium truncate max-w-[180px]">
                  {user?.email}
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <User className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="ghost" size="sm" asChild className="px-0 text-primary-600">
                  <Link href="/account">
                    <span>Edit profile</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {isOwner ? "Add Property" : "Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium">
                  {isOwner ? "Create Listing" : "Preferences"}
                </div>
                <div className="p-2 rounded-full bg-amber-100">
                  {isOwner ? <Plus className="h-5 w-5 text-amber-600" /> : <Settings className="h-5 w-5 text-amber-600" />}
                </div>
              </div>
              <div className="mt-4">
                <Button variant="ghost" size="sm" asChild className="px-0 text-primary-600">
                  <Link href={isOwner ? "/add-property" : "/settings"}>
                    <span>{isOwner ? "Add new property" : "Edit settings"}</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {isOwner ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Recent Properties</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/properties">View All</Link>
              </Button>
            </div>
            
            {properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.slice(0, 3).map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <CardTitle className="mb-2 text-center">No Properties Listed</CardTitle>
                  <CardDescription className="text-center mb-6">
                    You haven't added any properties yet. Add your first property to start receiving inquiries.
                  </CardDescription>
                  <Button asChild>
                    <Link href="/add-property">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Property
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Saved Properties</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/favorites">View All</Link>
              </Button>
            </div>
            
            {favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.slice(0, 3).map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
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
        )}
        
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/messages">View All</Link>
            </Button>
          </div>
          
          {conversations && conversations.length > 0 ? (
            <Card>
              <div className="divide-y">
                {conversations.slice(0, 3).map((conversation: any) => (
                  <div key={`${conversation.otherUserId}-${conversation.propertyId}`} className="p-4 hover:bg-gray-50">
                    <Link href={`/messages?userId=${conversation.otherUserId}&propertyId=${conversation.propertyId}`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {conversation.otherUser.avatar ? (
                            <img
                              src={conversation.otherUser.avatar}
                              alt={conversation.otherUser.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-medium">
                                {conversation.otherUser.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.otherUser.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Re: {conversation.property.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                              {conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <CardTitle className="mb-2 text-center">No Messages</CardTitle>
                <CardDescription className="text-center mb-6">
                  {isOwner 
                    ? "You haven't received any inquiries yet. List more properties to attract potential tenants." 
                    : "You haven't started any conversations yet. Contact property owners to inquire about listings."}
                </CardDescription>
                <Button asChild>
                  <Link href={isOwner ? "/add-property" : "/properties"}>
                    {isOwner ? (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Property
                      </>
                    ) : (
                      <>
                        <Home className="mr-2 h-4 w-4" />
                        Browse Properties
                      </>
                    )}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
