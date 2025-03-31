
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (id: string) => void;
  isLoading: boolean;
}

const ConnectDialog = ({ open, onOpenChange, onConnect, isLoading }: ConnectDialogProps) => {
  const [connectIdInput, setConnectIdInput] = useState("");

  const handleConnect = () => {
    if (connectIdInput) {
      onConnect(connectIdInput);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            className="bg-ephemeral-purple hover:bg-opacity-90 text-white"
            disabled={!connectIdInput || isLoading}
          >
            {isLoading ? "Connecting..." : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectDialog;
