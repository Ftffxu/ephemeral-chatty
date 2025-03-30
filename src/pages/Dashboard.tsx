
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { authService, User } from "@/services/auth";
import { chatService } from "@/services/chat";
import { toast } from "@/components/ui/use-toast";
import UserCard from "@/components/UserCard";
import { MessageCircle, Plus, Search, Users } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectIdInput, setConnectIdInput] = useState("");
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        
        if (!currentUser) {
          navigate("/login");
          return;
        }
        
        setUser(currentUser);
        
        // Create some demo users if they don't exist
        if (authService.users.length <= 1) {
          const demoUsers = [
            { email: "alex@example.com", username: "Alex", password: "password" },
            { email: "jamie@example.com", username: "Jamie", password: "password" },
            { email: "taylor@example.com", username: "Taylor", password: "password" },
          ];
          
          for (const demoUser of demoUsers) {
            if (!authService.users.some(u => u.email === demoUser.email)) {
              await authService.register(demoUser.email, demoUser.username, demoUser.password);
            }
          }
        }
        
        // Filter out the current user from the list
        const otherUsers = authService.users.filter(u => u.id !== currentUser.id);
        setDemoUsers(otherUsers);
      } catch (error) {
        console.error("Auth error:", error);
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleStartChat = async (otherUser: User) => {
    if (!user) return;
    
    try {
      const session = await chatService.createSession(user, otherUser);
      navigate(`/chat/${session.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to start chat",
        variant: "destructive",
      });
    }
  };

  const handleConnectWithId = async () => {
    if (!user || !connectIdInput) return;
    
    try {
      setConnectLoading(true);
      const otherUser = await authService.findUserByUniqueId(connectIdInput);
      
      if (!otherUser) {
        toast({
          title: "User Not Found",
          description: "No user found with that ID",
          variant: "destructive",
        });
        return;
      }
      
      if (otherUser.id === user.id) {
        toast({
          title: "Error",
          description: "You cannot chat with yourself",
          variant: "destructive",
        });
        return;
      }
      
      const session = await chatService.createSession(user, otherUser);
      setShowConnectDialog(false);
      navigate(`/chat/${session.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to connect",
        variant: "destructive",
      });
    } finally {
      setConnectLoading(false);
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
    <div className="min-h-screen bg-ephemeral-bg">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-ephemeral-text">Dashboard</h1>
            <Button 
              onClick={() => setShowConnectDialog(true)}
              className="bg-ephemeral-purple hover:bg-opacity-90 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Connect with ID</span>
            </Button>
          </div>
          
          <Card className="bg-ephemeral-dark border-ephemeral-purple/20 mb-8">
            <CardHeader>
              <CardTitle className="text-ephemeral-text flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-ephemeral-green" />
                Your Unique ID
              </CardTitle>
              <CardDescription className="text-ephemeral-muted">
                Share this ID with others to allow them to connect with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-ephemeral-bg border border-ephemeral-purple/30 rounded-md p-4 flex items-center justify-between">
                <span className="text-xl font-mono text-ephemeral-green">{user?.uniqueId}</span>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(user?.uniqueId || "");
                    toast({
                      title: "Copied to clipboard",
                      description: "Your unique ID has been copied",
                    });
                  }}
                  className="border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text"
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-xl font-semibold text-ephemeral-text mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-ephemeral-purple" />
            Available Users
          </h2>
          
          <div className="space-y-4">
            {demoUsers.length > 0 ? (
              demoUsers.map((demoUser) => (
                <UserCard
                  key={demoUser.id}
                  user={demoUser}
                  onStartChat={handleStartChat}
                />
              ))
            ) : (
              <p className="text-ephemeral-muted text-center py-8">No users available</p>
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-ephemeral-dark border-ephemeral-purple/20 text-ephemeral-text">
          <DialogHeader>
            <DialogTitle>Connect with ID</DialogTitle>
            <DialogDescription className="text-ephemeral-muted">
              Enter a user's unique ID to start a private chat session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unique-id" className="text-ephemeral-text">Unique ID</Label>
              <Input
                id="unique-id"
                placeholder="Enter the unique ID"
                value={connectIdInput}
                onChange={(e) => setConnectIdInput(e.target.value)}
                className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowConnectDialog(false)}
              variant="outline"
              className="border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnectWithId}
              className="bg-ephemeral-purple hover:bg-opacity-90 text-white"
              disabled={!connectIdInput || connectLoading}
            >
              {connectLoading ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add Label component if not imported
const Label = ({ htmlFor, className, children }: { htmlFor: string, className?: string, children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className={className}>
    {children}
  </label>
);

export default Dashboard;
