
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
import { MessageCircle, Plus, Search, Users, Save, Trash, UserPlus, UsersRound } from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import SavedContactCard from "@/components/SavedContactCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectIdInput, setConnectIdInput] = useState("");
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [savedContacts, setSavedContacts] = useState<Array<{id: string, name: string}>>([]);
  const [contactNameInput, setContactNameInput] = useState("");
  const [contactIdInput, setContactIdInput] = useState("");
  const [showSaveContactDialog, setShowSaveContactDialog] = useState(false);
  
  // Group chat dialog state
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [groupMemberIds, setGroupMemberIds] = useState<string[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState("");

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

  const handleSaveContact = () => {
    if (!contactNameInput || !contactIdInput || !user) return;
    
    const newContact = { id: contactIdInput, name: contactNameInput };
    const updatedContacts = [...savedContacts, newContact];
    
    // Save to state and localStorage
    setSavedContacts(updatedContacts);
    localStorage.setItem(`savedContacts_${user.id}`, JSON.stringify(updatedContacts));
    
    // Reset form and close dialog
    setContactNameInput("");
    setContactIdInput("");
    setShowSaveContactDialog(false);
    
    toast({
      title: "Contact Saved",
      description: `${contactNameInput} has been added to your contacts`,
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

  const handleAddGroupMember = () => {
    if (!currentMemberId || groupMemberIds.includes(currentMemberId)) {
      return;
    }
    
    setGroupMemberIds([...groupMemberIds, currentMemberId]);
    setCurrentMemberId("");
  };

  const handleRemoveGroupMember = (id: string) => {
    setGroupMemberIds(groupMemberIds.filter(memberId => memberId !== id));
  };

  const handleCreateGroupChat = async () => {
    if (!user || !groupNameInput || groupMemberIds.length === 0) return;
    
    try {
      setConnectLoading(true);
      
      // Create array of group participants
      const participantPromises = groupMemberIds.map(
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
      const session = await chatService.createSession(user, null, true, groupNameInput);
      
      // Reset form and close dialog
      setGroupNameInput("");
      setGroupMemberIds([]);
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
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-ephemeral-dark border-ephemeral-purple/20 mb-8 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-ephemeral-purple/20 to-ephemeral-dark">
                <CardTitle className="text-ephemeral-text flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-ephemeral-green" />
                  Your Unique ID
                </CardTitle>
                <CardDescription className="text-ephemeral-muted">
                  Share this ID with others to allow them to connect with you
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
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
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-ephemeral-text flex items-center gap-2">
                <Users className="h-5 w-5 text-ephemeral-purple" />
                Saved Contacts
              </h2>
              <Button 
                onClick={() => setShowSaveContactDialog(true)}
                className="bg-ephemeral-dark border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text flex items-center gap-1"
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Contact</span>
              </Button>
            </div>
            
            <div className="space-y-4">
              {savedContacts.length > 0 ? (
                savedContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="animate-fade-in"
                  >
                    <SavedContactCard
                      contact={contact}
                      onStartChat={() => handleStartChat(contact.id)}
                      onDelete={() => handleDeleteContact(contact.id)}
                    />
                  </motion.div>
                ))
              ) : (
                <Card className="bg-ephemeral-dark border-ephemeral-purple/10 p-6">
                  <p className="text-ephemeral-muted text-center">No saved contacts. Add some to get started!</p>
                </Card>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Connect with ID Dialog */}
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
      
      {/* Save Contact Dialog */}
      <Dialog open={showSaveContactDialog} onOpenChange={setShowSaveContactDialog}>
        <DialogContent className="bg-ephemeral-dark border-ephemeral-purple/20 text-ephemeral-text">
          <DialogHeader>
            <DialogTitle>Save New Contact</DialogTitle>
            <DialogDescription className="text-ephemeral-muted">
              Save a contact's ID and a friendly name for easy access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name" className="text-ephemeral-text">Contact Name</Label>
              <Input
                id="contact-name"
                placeholder="Enter a name for this contact"
                value={contactNameInput}
                onChange={(e) => setContactNameInput(e.target.value)}
                className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-id" className="text-ephemeral-text">Contact ID</Label>
              <Input
                id="contact-id"
                placeholder="Enter the contact's unique ID"
                value={contactIdInput}
                onChange={(e) => setContactIdInput(e.target.value)}
                className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowSaveContactDialog(false)}
              variant="outline"
              className="border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveContact}
              className="bg-ephemeral-green hover:bg-opacity-90 text-white"
              disabled={!contactNameInput || !contactIdInput}
            >
              Save Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Group Chat Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="bg-ephemeral-dark border-ephemeral-purple/20 text-ephemeral-text">
          <DialogHeader>
            <DialogTitle>Create Group Chat</DialogTitle>
            <DialogDescription className="text-ephemeral-muted">
              Create a group chat by adding multiple participants
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name" className="text-ephemeral-text">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter a name for this group"
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="member-id" className="text-ephemeral-text">Add Members by ID</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="member-id"
                  placeholder="Enter member's unique ID"
                  value={currentMemberId}
                  onChange={(e) => setCurrentMemberId(e.target.value)}
                  className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
                />
                <Button
                  onClick={handleAddGroupMember}
                  disabled={!currentMemberId}
                  className="bg-ephemeral-purple text-white"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>
            
            {groupMemberIds.length > 0 && (
              <div className="bg-ephemeral-bg/50 p-3 rounded-md">
                <Label className="text-sm text-ephemeral-muted mb-2 block">Group Members</Label>
                <div className="space-y-2">
                  {groupMemberIds.map((id) => (
                    <div key={id} className="flex items-center justify-between p-2 bg-ephemeral-dark rounded-md">
                      <span className="text-ephemeral-text text-sm font-mono">{id}</span>
                      <Button
                        onClick={() => handleRemoveGroupMember(id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-ephemeral-muted hover:text-ephemeral-purple"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowGroupDialog(false)}
              variant="outline"
              className="border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroupChat}
              className="bg-ephemeral-green hover:bg-opacity-90 text-white"
              disabled={!groupNameInput || groupMemberIds.length === 0 || connectLoading}
            >
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
