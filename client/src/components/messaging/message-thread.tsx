import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, User, Property } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageCompose } from "./message-compose";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageThreadProps {
  userId: number;
  propertyId: number;
  onBack?: () => void;
}

interface MessageWithSender extends Message {
  sender: User;
  property: Property;
}

export function MessageThread({ userId, propertyId, onBack }: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { data: conversation, isLoading } = useQuery<MessageWithSender[]>({
    queryKey: [`/api/conversations/${userId}/${propertyId}`],
  });
  
  const { data: property } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !conversation || conversation.length === 0,
  });
  
  const otherUser = conversation && conversation.length > 0
    ? (conversation[0].senderId === user?.id 
        ? { id: conversation[0].receiverId, name: conversation[0].receiver?.name || "User", avatar: conversation[0].receiver?.avatar }
        : { id: conversation[0].senderId, name: conversation[0].sender.name, avatar: conversation[0].sender.avatar })
    : null;
  
  const propertyDetails = conversation && conversation.length > 0 
    ? conversation[0].property
    : property;
  
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: userId,
        propertyId,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${userId}/${propertyId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        {otherUser && (
          <div className="flex items-center flex-1">
            <Avatar className="h-10 w-10">
              {otherUser.avatar ? (
                <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
              ) : (
                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div className="ml-3">
              <h3 className="font-medium">{otherUser.name}</h3>
              <p className="text-xs text-gray-500">
                Re: {propertyDetails?.title || "Property"}
              </p>
            </div>
          </div>
        )}
        
        {propertyDetails && (
          <Link href={`/properties/${propertyDetails.id}`}>
            <Button variant="ghost" size="sm" className="ml-auto">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Property
            </Button>
          </Link>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {conversation && conversation.length > 0 ? (
          <div className="space-y-4">
            {conversation.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div className="flex max-w-[80%]">
                  {message.senderId !== user?.id && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      {message.sender.avatar ? (
                        <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                      ) : (
                        <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.senderId === user?.id
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="border-t p-4">
        <MessageCompose
          receiverId={userId}
          propertyId={propertyId}
          onSend={(content) => sendMessageMutation.mutate({ content })}
          compact
        />
      </div>
    </div>
  );
}
