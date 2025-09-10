
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, LogInIcon, ShieldIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { login } from '@/lib/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await login(email, password);
      
      if (user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please enter correct Email and password, or contact Administrator admin@example.com",
        variant: "destructive",
      });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminRedirect = () => {
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-terracotta mb-2">Relax Hotel Group</h1>
          <p className="text-gray">Virtual Conference Records Management</p>
        </div>
        
        <Card className="border-gold/20 shadow-md animate-fade-in">
          <CardHeader>
            <CardTitle className="text-terracotta">User Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MailIcon className="h-4 w-4 text-gray" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockIcon className="h-4 w-4 text-gray" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-terracotta hover:bg-terracotta/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <LogInIcon className="mr-2 h-4 w-4" /> Sign In
                  </>
                )}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={handleAdminRedirect}
                className="w-full border-terracotta text-terracotta hover:bg-terracotta hover:text-cream"
              >
                <ShieldIcon className="mr-2 h-4 w-4" />
                Admin Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
