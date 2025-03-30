
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Lock, MessageCircle, User } from "lucide-react";

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
    <nav className="flex items-center justify-between px-6 py-4 bg-ephemeral-dark">
      <div className="flex items-center gap-2" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <MessageCircle className="h-6 w-6 text-ephemeral-green" />
        <span className="text-xl font-semibold text-ephemeral-text">EphemChat</span>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-ephemeral-purple" />
              <span className="text-ephemeral-text">{(user as any).username}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-ephemeral-bg px-3 py-1 rounded-md">
              <Lock className="h-4 w-4 text-ephemeral-green" />
              <span className="text-sm text-ephemeral-muted">ID: {(user as any).uniqueId}</span>
            </div>
            <Button 
              variant="outline" 
              className="bg-ephemeral-dark border-ephemeral-purple text-ephemeral-purple hover:text-ephemeral-text"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              className="bg-ephemeral-dark border-ephemeral-purple text-ephemeral-purple hover:text-ephemeral-text"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button 
              className="bg-ephemeral-purple text-white hover:bg-opacity-90"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
