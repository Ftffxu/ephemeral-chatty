
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface UserIdCardProps {
  uniqueId: string;
}

const UserIdCard = ({ uniqueId }: UserIdCardProps) => {
  const handleCopyId = () => {
    navigator.clipboard.writeText(uniqueId || "");
    toast({
      title: "Copied to clipboard",
      description: "Your unique ID has been copied",
    });
  };

  return (
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
            <span className="text-xl font-mono text-ephemeral-green">{uniqueId}</span>
            <Button
              variant="outline"
              onClick={handleCopyId}
              className="border-ephemeral-purple/50 text-ephemeral-purple hover:text-ephemeral-text"
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserIdCard;
