
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
  isLoading: boolean;
}

const CreateGroupDialog = ({ open, onOpenChange, onCreateGroup, isLoading }: CreateGroupDialogProps) => {
  const [groupNameInput, setGroupNameInput] = useState("");
  const [groupMemberIds, setGroupMemberIds] = useState<string[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState("");

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

  const handleCreateGroup = () => {
    if (groupNameInput && groupMemberIds.length > 0) {
      onCreateGroup(groupNameInput, groupMemberIds);
      setGroupNameInput("");
      setGroupMemberIds([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            className="bg-ephemeral-green hover:bg-opacity-90 text-white"
            disabled={!groupNameInput || groupMemberIds.length === 0 || isLoading}
          >
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
