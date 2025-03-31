
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { authService, User } from "@/services/auth";
import { chatService } from "@/services/chat";
import { toast } from "@/components/ui/use-toast";
import { UserPlus, UsersRound } from "lucide-react";

// Import new components
import UserIdCard from "@/components/UserIdCard";
import SavedContactsList from "@/components/SavedContactsList";
import ConnectDialog from "@/components/ConnectDialog";
import SaveContactDialog from "@/components/SaveContactDialog";
import CreateGroupDialog from "@/components/CreateGroupDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  
  // Saved contacts state
  const [savedContacts, setSavedContacts] = useState<Array<{id: string, name: string}>>([]);
  
  // Dialog visibility states
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showSaveContactDialog, setShowSaveContactDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        
        if (!currentUser) {
          navigate("/login");
          return;
        }
        
        setUser(currentUser);
        
        // Load saved contacts from localStorage
        const savedContactsStr = localStorage.getItem(`savedContacts_${currentUser.id}`);
        if (savedContactsStr) {
          setSavedContacts(JSON.parse(savedContactsStr));
        }
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

  const handleStartChat = async (contactId: string) => {
    if (!user) return;
    
    try {
      setConnectLoading(true);
      const otherUser = await authService.findUserByUniqueId(contactId);
      
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

  const handleConnectWithId = async (connectIdInput: string) => {
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

  const handleSaveContact = (contactName: string, contactId: string) => {
    if (!contactName || !contactId || !user) return;
    
    const newContact = { id: contactId, name: contactName };
    const updatedContacts = [...savedContacts, newContact];
    
    // Save to state and localStorage
    setSavedContacts(updatedContacts);
    localStorage.setItem(`savedContacts_${user.id}`, JSON.stringify(updatedContacts));
    
    // Close dialog
    setShowSaveContactDialog(false);
    
    toast({
      title: "Contact Saved",
      description: `${contactName} has been added to your contacts`,
    });
  };

  const handleDeleteContact = (contactId: string) => {
    if (!user) return;
    
    const updatedContacts = savedContacts.filter(contact => contact.id !== contactId);
    
    // Update state and localStorage
    setSavedContacts(updatedContacts);
    localStorage.setItem(`savedContacts_${user.id}`, JSON.stringify(updatedContacts));
    
    toast({
      title: "Contact Removed",
      description: "Contact has been removed from your list",
    });
  };

  const handleCreateGroupChat = async (groupName: string, memberIds: string[]) => {
    if (!user || !groupName || memberIds.length === 0) return;
    
    try {
      setConnectLoading(true);
      
      // Create array of group participants
      const participantPromises = memberIds.map(
        id => authService.findUserByUniqueId(id)
      );
      
      const participants = await Promise.all(participantPromises);
      const validParticipants = participants.filter(p => p !== null) as User[];
      
      if (validParticipants.length === 0) {
        toast({
          title: "Error",
          description: "No valid participants found",
          variant: "destructive",
        });
        return;
      }
      
      // Create a group chat session
      const session = await chatService.createSession(user, null, true, groupName);
      
      // Reset form and close dialog
      setShowGroupDialog(false);
      
      navigate(`/chat/${session.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to create group chat",
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <h1 className="text-2xl font-bold text-ephemeral-text">Dashboard</h1>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowGroupDialog(true)}
                className="bg-ephemeral-green hover:bg-opacity-90 text-white flex items-center gap-2"
              >
                <UsersRound className="h-4 w-4" />
                <span>Create Group</span>
              </Button>
              <Button 
                onClick={() => setShowConnectDialog(true)}
                className="bg-ephemeral-purple hover:bg-opacity-90 text-white flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Connect with ID</span>
              </Button>
            </div>
          </motion.div>
          
          {/* Display user's unique ID */}
          {user && <UserIdCard uniqueId={user.uniqueId} />}
          
          {/* Display saved contacts */}
          <SavedContactsList 
            contacts={savedContacts}
            onAddContact={() => setShowSaveContactDialog(true)}
            onStartChat={handleStartChat}
            onDeleteContact={handleDeleteContact}
          />
        </div>
      </div>
      
      {/* Dialogs */}
      <ConnectDialog
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        onConnect={handleConnectWithId}
        isLoading={connectLoading}
      />
      
      <SaveContactDialog
        open={showSaveContactDialog}
        onOpenChange={setShowSaveContactDialog}
        onSave={handleSaveContact}
      />
      
      <CreateGroupDialog
        open={showGroupDialog}
        onOpenChange={setShowGroupDialog}
        onCreateGroup={handleCreateGroupChat}
        isLoading={connectLoading}
      />
    </div>
  );
};

export default Dashboard;
