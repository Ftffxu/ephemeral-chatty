
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SaveContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, id: string) => void;
}

const SaveContactDialog = ({ open, onOpenChange, onSave }: SaveContactDialogProps) => {
  const [contactNameInput, setContactNameInput] = useState("");
  const [contactIdInput, setContactIdInput] = useState("");

  const handleSave = () => {
    if (contactNameInput && contactIdInput) {
      onSave(contactNameInput, contactIdInput);
      setContactNameInput("");
      setContactIdInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-ephemeral-green hover:bg-opacity-90 text-white"
            disabled={!contactNameInput || !contactIdInput}
          >
            Save Contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveContactDialog;
