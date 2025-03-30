
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { authService } from "@/services/auth";
import { toast } from "@/components/ui/use-toast";
import { ArrowRight, Lock } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !username || !password) {
      toast({
        title: "Registration Failed",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const user = await authService.register(email, username, password);
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${username}! Your unique ID is ${user.uniqueId}`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: (error as Error).message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ephemeral-bg">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-md mx-auto">
          <Card className="bg-ephemeral-dark border-ephemeral-purple/20">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-ephemeral-purple/20 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-ephemeral-purple" />
                </div>
              </div>
              <CardTitle className="text-2xl text-ephemeral-text">Create an account</CardTitle>
              <CardDescription className="text-ephemeral-muted">
                Enter your details below to create your secure account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-ephemeral-text">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-ephemeral-text">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-ephemeral-text">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-ephemeral-text">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-ephemeral-purple hover:bg-opacity-90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Register"}
                </Button>
                <div className="text-center mt-4">
                  <p className="text-ephemeral-muted text-sm">
                    Already have an account?{" "}
                    <a 
                      className="text-ephemeral-green hover:underline cursor-pointer"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
