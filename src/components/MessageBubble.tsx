
import { Message } from "@/services/chat";
import { User } from "@/services/auth";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  sender?: User;
}

const MessageBubble = ({ message, isCurrentUser, sender }: MessageBubbleProps) => {
  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={cn(
        "flex mb-4 message-bubble-animation-in",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "max-w-[75%] px-4 py-2 rounded-lg",
          isCurrentUser 
            ? "bg-ephemeral-purple text-white rounded-br-none" 
            : "bg-ephemeral-dark text-ephemeral-text rounded-bl-none"
        )}
      >
        {!isCurrentUser && sender && (
          <p className="text-xs font-medium text-ephemeral-green mb-1">{sender.username}</p>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className={cn(
          "text-xs mt-1 flex justify-end",
          isCurrentUser ? "text-white/70" : "text-ephemeral-muted"
        )}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
