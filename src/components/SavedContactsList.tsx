
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SavedContactCard from "@/components/SavedContactCard";

interface SavedContactsListProps {
  contacts: Array<{ id: string, name: string }>;
  onAddContact: () => void;
  onStartChat: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
}

const SavedContactsList = ({ 
  contacts, 
  onAddContact, 
  onStartChat, 
  onDeleteContact 
}: SavedContactsListProps) => {
  return (
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
          onClick={onAddContact}
          className="bg-ephemeral-dark border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text flex items-center gap-1"
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Contact</span>
        </Button>
      </div>
      
      <div className="space-y-4">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="animate-fade-in"
            >
              <SavedContactCard
                contact={contact}
                onStartChat={() => onStartChat(contact.id)}
                onDelete={() => onDeleteContact(contact.id)}
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
  );
};

export default SavedContactsList;
