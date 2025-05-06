import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MessageComposeProps {
  receiverId: number;
  propertyId: number;
  propertyTitle?: string;
  onSend?: (content: string) => void;
  compact?: boolean;
}

export function MessageCompose({ 
  receiverId, 
  propertyId, 
  propertyTitle, 
  onSend, 
  compact = false 
}: MessageComposeProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId,
        propertyId,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      // If this is a new conversation, invalidate the conversations list
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      // Invalidate the specific conversation
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${receiverId}/${propertyId}`] });
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
      
      if (onSend) {
        onSend(message);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    
    if (onSend) {
      onSend(message);
      setMessage("");
    } else {
      sendMessageMutation.mutate(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!compact && propertyTitle && (
        <div className="text-sm font-medium text-gray-700 mb-2">
          Send a message about: <span className="text-primary-600">{propertyTitle}</span>
        </div>
      )}
      
      <div className="flex">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={compact ? "Type a message..." : "Hi, I'm interested in this property..."}
          className={`flex-1 resize-none ${compact ? 'h-12 py-3' : 'min-h-24'}`}
        />
        <Button 
          type="submit" 
          className="ml-2" 
          disabled={sendMessageMutation.isPending || !message.trim()}
        >
          {compact ? (
            <SendHorizontal className="h-5 w-5" />
          ) : (
            <>
              <SendHorizontal className="h-4 w-4 mr-2" />
              Send
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
