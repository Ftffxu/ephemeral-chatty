
import { User } from "@/services/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, User as UserIcon } from "lucide-react";

interface UserCardProps {
  user: User;
  onStartChat: (user: User) => void;
}

const UserCard = ({ user, onStartChat }: UserCardProps) => {
  return (
    <Card className="bg-ephemeral-dark border-ephemeral-purple/20 w-full animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ephemeral-purple/20 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-ephemeral-purple" />
            </div>
            <div>
              <h3 className="font-medium text-ephemeral-text">{user.username}</h3>
              <p className="text-sm text-ephemeral-muted">ID: {user.uniqueId}</p>
            </div>
          </div>
          <Button 
            className="bg-ephemeral-purple text-white hover:bg-opacity-90 flex items-center gap-2"
            onClick={() => onStartChat(user)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
