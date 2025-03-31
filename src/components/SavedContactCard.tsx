
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Trash } from "lucide-react";

interface SavedContactProps {
  contact: {
    id: string;
    name: string;
  };
  onStartChat: () => void;
  onDelete: () => void;
}

const SavedContactCard = ({ contact, onStartChat, onDelete }: SavedContactProps) => {
  return (
    <Card className="bg-ephemeral-dark border-ephemeral-purple/20 w-full overflow-hidden hover:border-ephemeral-purple/50 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ephemeral-purple/30 to-ephemeral-purple/10 flex items-center justify-center">
              <User className="h-5 w-5 text-ephemeral-purple" />
            </div>
            <div>
              <h3 className="font-medium text-ephemeral-text">{contact.name}</h3>
              <p className="text-sm text-ephemeral-muted">ID: {contact.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-ephemeral-muted hover:text-red-400 hover:bg-red-400/10"
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button 
              className="bg-ephemeral-purple text-white hover:bg-opacity-90 flex items-center gap-2"
              onClick={onStartChat}
              size="sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedContactCard;
