import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MessageList } from "@/components/messaging/message-list";
import { MessageThread } from "@/components/messaging/message-thread";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const [location, search] = useLocation();
  const searchParams = new URLSearchParams(search || "");
  
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    searchParams.get("userId") ? parseInt(searchParams.get("userId")!) : undefined
  );
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>(
    searchParams.get("propertyId") ? parseInt(searchParams.get("propertyId")!) : undefined
  );
  
  const [showMobileList, setShowMobileList] = useState(true);
  
  // Update URL when selected conversation changes
  useEffect(() => {
    if (selectedUserId && selectedPropertyId) {
      const params = new URLSearchParams();
      params.append("userId", selectedUserId.toString());
      params.append("propertyId", selectedPropertyId.toString());
      window.history.pushState(null, "", `${location}?${params.toString()}`);
      
      // On mobile, show the message thread when a conversation is selected
      setShowMobileList(false);
    }
  }, [selectedUserId, selectedPropertyId, location]);
  
  const handleSelectConversation = (userId: number, propertyId: number) => {
    setSelectedUserId(userId);
    setSelectedPropertyId(propertyId);
  };
  
  const handleBackToList = () => {
    setShowMobileList(true);
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardSidebar />
        <div className="flex-1 p-8 md:ml-64">
          <div className="text-center">
            <p>Please log in to view your messages.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />
      
      <div className="flex-1 md:ml-64">
        <div className="h-full flex flex-col">
          <div className="border-b bg-white px-4 py-3 flex items-center">
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Mobile: Toggle between list and thread view */}
            {showMobileList ? (
              <div className="md:hidden w-full">
                <MessageList 
                  onSelectConversation={handleSelectConversation}
                />
              </div>
            ) : (
              <div className="md:hidden w-full">
                {selectedUserId && selectedPropertyId ? (
                  <MessageThread 
                    userId={selectedUserId}
                    propertyId={selectedPropertyId}
                    onBack={handleBackToList}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center">
                    <div>
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversation Selected</h3>
                      <p className="text-gray-500">
                        Please select a conversation from the list to view messages.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Desktop: Always show both columns */}
            <div className="hidden md:block w-1/3 border-r">
              <MessageList 
                onSelectConversation={handleSelectConversation}
                selectedUserId={selectedUserId}
                selectedPropertyId={selectedPropertyId}
              />
            </div>
            
            <div className="hidden md:block flex-1">
              {selectedUserId && selectedPropertyId ? (
                <MessageThread 
                  userId={selectedUserId}
                  propertyId={selectedPropertyId}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Conversation</h3>
                    <p className="text-gray-500 max-w-md">
                      Choose a conversation from the list on the left to view and respond to messages.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
