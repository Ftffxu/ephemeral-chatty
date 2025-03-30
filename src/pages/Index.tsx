
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { authService, User } from "@/services/auth";
import { Lock, MessageCircle, Shield, Trash2, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        // If user is logged in, redirect to dashboard
        navigate("/dashboard");
      }
    };
    
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-ephemeral-bg">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-ephemeral-purple/20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-ephemeral-purple" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ephemeral-text animate-slide-up">
            Secure, Private, <span className="text-ephemeral-green">Ephemeral</span> Messaging
          </h1>
          
          <p className="text-xl text-ephemeral-muted mb-8 animate-slide-up">
            Messages that disappear without a trace when the conversation ends.
            Your privacy is our promise.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-16 animate-slide-up">
            <Button 
              className="bg-ephemeral-purple hover:bg-opacity-90 text-white text-lg py-6 px-8"
              onClick={() => navigate("/register")}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              className="border-ephemeral-purple text-ephemeral-purple hover:text-ephemeral-text text-lg py-6 px-8"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-ephemeral-dark p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-ephemeral-purple/20 rounded-full flex items-center justify-center">
                  <Lock className="h-6 w-6 text-ephemeral-green" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-ephemeral-text">End-to-End Encryption</h3>
              <p className="text-ephemeral-muted">Your messages are encrypted and can only be read by you and your recipient.</p>
            </div>
            
            <div className="bg-ephemeral-dark p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-ephemeral-purple/20 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-ephemeral-green" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-ephemeral-text">Auto Deletion</h3>
              <p className="text-ephemeral-muted">All messages are permanently deleted once the chat session ends.</p>
            </div>
            
            <div className="bg-ephemeral-dark p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-ephemeral-purple/20 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-ephemeral-green" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-ephemeral-text">Unique Session IDs</h3>
              <p className="text-ephemeral-muted">Connect securely using unique identifiers that change after each session.</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-ephemeral-dark py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-ephemeral-muted text-sm">
            © {new Date().getFullYear()} EphemChat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
