
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
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize react-hook-form with zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      const user = await authService.login(values.email, values.password);
      
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-ephemeral-text">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="your.email@example.com"
                            className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-ephemeral-text">Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Enter your password"
                            className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
