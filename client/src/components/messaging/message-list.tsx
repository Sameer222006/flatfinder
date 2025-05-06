import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { truncateText } from "@/lib/utils";

interface MessageListProps {
  onSelectConversation: (userId: number, propertyId: number) => void;
  selectedUserId?: number;
  selectedPropertyId?: number;
}

interface Conversation {
  otherUserId: number;
  propertyId: number;
  otherUser: {
    id: number;
    name: string;
    avatar?: string;
  };
  property: {
    id: number;
    title: string;
    primaryImage?: {
      url: string;
    };
  };
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    read: boolean;
  };
  unreadCount: number;
}

export function MessageList({ onSelectConversation, selectedUserId, selectedPropertyId }: MessageListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });
  
  const filteredConversations = conversations?.filter(conversation => {
    const otherUserName = conversation.otherUser.name.toLowerCase();
    const propertyTitle = conversation.property.title.toLowerCase();
    const search = searchQuery.toLowerCase();
    
    return otherUserName.includes(search) || propertyTitle.includes(search);
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="relative">
            <Input
              placeholder="Search messages..."
              className="pl-10"
              disabled
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Input
            placeholder="Search messages..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations && filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((conversation) => (
              <div
                key={`${conversation.otherUserId}-${conversation.propertyId}`}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedUserId === conversation.otherUserId && 
                  selectedPropertyId === conversation.propertyId
                    ? "bg-primary-50"
                    : ""
                }`}
                onClick={() => onSelectConversation(conversation.otherUserId, conversation.propertyId)}
              >
                <div className="flex">
                  <Avatar className="h-12 w-12">
                    {conversation.otherUser.avatar ? (
                      <AvatarImage src={conversation.otherUser.avatar} alt={conversation.otherUser.name} />
                    ) : (
                      <AvatarFallback>{conversation.otherUser.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{conversation.otherUser.name}</h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      Re: {truncateText(conversation.property.title, 25)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {truncateText(conversation.lastMessage.content, 30)}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-primary-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            {searchQuery ? (
              <p className="text-gray-500">No conversations match your search.</p>
            ) : (
              <p className="text-gray-500">No conversations yet. Start messaging property owners!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
