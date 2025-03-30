
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { authService, User } from "@/services/auth";
import { chatService, ChatSession, Message } from "@/services/chat";
import { toast } from "@/components/ui/use-toast";
import MessageBubble from "@/components/MessageBubble";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Lock, Send, Trash2, X } from "lucide-react";

const Chat = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        
        if (!currentUser) {
          navigate("/login");
          return;
        }
        
        setUser(currentUser);
        
        if (!sessionId) {
          navigate("/dashboard");
          return;
        }
        
        const chatSession = await chatService.getSessionById(sessionId);
        
        if (!chatSession) {
          toast({
            title: "Session Not Found",
            description: "The chat session does not exist",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }
        
        if (!chatSession.participants.some(p => p.id === currentUser.id)) {
          toast({
            title: "Access Denied",
            description: "You are not a participant in this chat session",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }
        
        setSession(chatSession);
        
        // Find the other user in the session
        const other = chatSession.participants.find(p => p.id !== currentUser.id) || null;
        setOtherUser(other);
        
        // Load initial messages
        const decryptedMessages = await chatService.getDecryptedMessages(sessionId, currentUser.id);
        setMessages(decryptedMessages);
        
        // Poll for new messages every 2 seconds
        const interval = setInterval(async () => {
          const updatedMessages = await chatService.getDecryptedMessages(sessionId, currentUser.id);
          setMessages(updatedMessages);
        }, 2000);
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error("Session error:", error);
        toast({
          title: "Error",
          description: (error as Error).message || "Failed to load chat session",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, sessionId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !session || !messageInput.trim()) return;
    
    try {
      await chatService.sendMessage(session.id, user, messageInput.trim());
      setMessageInput("");
      
      // Immediately update messages
      const updatedMessages = await chatService.getDecryptedMessages(session.id, user.id);
      setMessages(updatedMessages);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleEndSession = async () => {
    if (!session) return;
    
    try {
      await chatService.endSession(session.id);
      setShowEndDialog(false);
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to end session",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ephemeral-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-10 flex items-center justify-center">
          <p className="text-ephemeral-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ephemeral-bg flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-ephemeral-dark border-b border-ephemeral-purple/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {otherUser ? (
              <>
                <div className="w-10 h-10 rounded-full bg-ephemeral-purple/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-ephemeral-green" />
                </div>
                <div>
                  <h3 className="font-medium text-ephemeral-text">{otherUser.username}</h3>
                  <p className="text-xs text-ephemeral-muted">Encrypted, ephemeral chat</p>
                </div>
              </>
            ) : (
              <h3 className="font-medium text-ephemeral-text">Secure Chat</h3>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowEndDialog(true)}
            className="border-red-500/30 text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span>End Chat</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={message.senderId === user?.id}
                  sender={session?.participants.find(p => p.id === message.senderId)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-ephemeral-purple/20 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-ephemeral-green" />
              </div>
              <h3 className="text-xl font-semibold text-ephemeral-text mb-2">
                End-to-End Encrypted Chat
              </h3>
              <p className="text-ephemeral-muted max-w-md">
                Messages sent in this chat are end-to-end encrypted and will be permanently deleted when the chat ends.
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-ephemeral-dark border-t border-ephemeral-purple/20 p-4">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="bg-ephemeral-purple hover:bg-opacity-90 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent className="bg-ephemeral-dark border-ephemeral-purple/20 text-ephemeral-text">
          <AlertDialogHeader>
            <AlertDialogTitle>End Chat Session</AlertDialogTitle>
            <AlertDialogDescription className="text-ephemeral-muted">
              This will permanently delete all messages in this chat. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndSession}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chat;
