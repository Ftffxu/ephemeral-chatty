
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Lock, MessageCircle, User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    
    loadUser();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-ephemeral-dark to-ephemeral-dark/95 backdrop-blur-sm sticky top-0 z-10"
    >
      <motion.div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate("/")}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <MessageCircle className="h-6 w-6 text-ephemeral-green" />
        <span className="text-xl font-semibold text-ephemeral-text">EphemChat</span>
      </motion.div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <User className="h-5 w-5 text-ephemeral-purple" />
              <span className="text-ephemeral-text">{(user as any).username}</span>
            </motion.div>
            <motion.div 
              className="hidden md:flex items-center gap-2 bg-ephemeral-bg px-3 py-1 rounded-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ShieldCheck className="h-4 w-4 text-ephemeral-green" />
              <span className="text-sm text-ephemeral-muted">ID: {(user as any).uniqueId}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button 
                variant="outline" 
                className="bg-ephemeral-dark border-ephemeral-purple text-ephemeral-purple hover:text-ephemeral-text"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button 
                variant="outline" 
                className="bg-ephemeral-dark border-ephemeral-purple text-ephemeral-purple hover:text-ephemeral-text"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Button 
                className="bg-ephemeral-purple text-white hover:bg-opacity-90"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
