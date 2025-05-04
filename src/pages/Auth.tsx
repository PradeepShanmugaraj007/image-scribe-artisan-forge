
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Mock authentication functions (to be replaced with real auth later)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      toast({
        title: "Login successful",
        description: "Welcome back to Posture Corrector!",
      });
      // Store user info in localStorage for demo purposes
      localStorage.setItem("user", JSON.stringify({ email: loginEmail, name: "Demo User" }));
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Password validation
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulating API call
    setTimeout(() => {
      toast({
        title: "Account created",
        description: "Welcome to Posture Corrector!",
      });
      // Store user info in localStorage for demo purposes
      localStorage.setItem("user", JSON.stringify({ email: signupEmail, name: signupName }));
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0f172a] border-gray-800 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#2ece71]">Posture Corrector</CardTitle>
          <CardDescription className="text-gray-300">
            Improve your sitting posture and reduce back pain
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-[#172036]">
            <TabsTrigger value="login" className="text-white data-[state=active]:bg-[#2ece71] data-[state=active]:text-white">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-white data-[state=active]:bg-[#2ece71] data-[state=active]:text-white">Sign Up</TabsTrigger>
          </TabsList>
          
          {/* Login Form */}
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-[#172036]/50 border-gray-700 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Button variant="link" className="text-sm text-[#2ece71]">
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-[#172036]/50 border-gray-700 text-white"
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit"
                  className="w-full bg-[#2ece71] hover:bg-[#28b863] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          {/* Signup Form */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input 
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="bg-[#172036]/50 border-gray-700 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email</Label>
                  <Input 
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="bg-[#172036]/50 border-gray-700 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="bg-[#172036]/50 border-gray-700 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="bg-[#172036]/50 border-gray-700 text-white"
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit"
                  className="w-full bg-[#2ece71] hover:bg-[#28b863] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="p-6 pt-0 text-center">
          <Link to="/dashboard" className="w-full">
            <Button 
              variant="outline"
              className="w-full border-[#2ece71] text-[#2ece71] hover:bg-[#2ece71] hover:text-white"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
