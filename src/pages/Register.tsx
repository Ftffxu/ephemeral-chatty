
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
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define form validation schema
const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize react-hook-form with zod validation
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values: RegisterFormValues) => {    
    try {
      setIsLoading(true);
      const user = await authService.register(values.email, values.username, values.password);
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${values.username}! Your unique ID is ${user.uniqueId}`,
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
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-ephemeral-text">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Choose a username"
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
                            placeholder="Create a secure password"
                            className="bg-ephemeral-bg border-ephemeral-purple/30 text-ephemeral-text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-ephemeral-text">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Confirm your password"
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
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
