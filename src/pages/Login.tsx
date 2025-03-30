
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { authService } from "@/services/auth";
import { toast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast({
        title: "Login Failed",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const user = await authService.login(email, password);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.username}!`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: (error as Error).message || "Invalid credentials",
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
              <CardTitle className="text-2xl text-ephemeral-text">Welcome back</CardTitle>
              <CardDescription className="text-ephemeral-muted">
                Enter your credentials to access your account
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
                  <Label htmlFor="password" className="text-ephemeral-text">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-ephemeral-purple hover:bg-opacity-90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center mt-4">
                  <p className="text-ephemeral-muted text-sm">
                    Don't have an account?{" "}
                    <a 
                      className="text-ephemeral-green hover:underline cursor-pointer"
                      onClick={() => navigate("/register")}
                    >
                      Register
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

export default Login;
