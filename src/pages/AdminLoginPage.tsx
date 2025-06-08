
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MailIcon, LockIcon, ShieldIcon, ArrowLeftIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { login } from '@/lib/auth';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
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
        if (!user.isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Admin login successful",
          description: `Welcome back, ${user.name}!`,
        });
        
        // Redirect to admin dashboard
        navigate('/admin');
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
      console.error('Admin login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-terracotta mb-2">Relax Hotel Group</h1>
          <p className="text-gray">Admin Access Portal</p>
        </div>
        
        <Card className="border-gold/20 shadow-md animate-fade-in">
          <CardHeader>
            <CardTitle className="text-terracotta flex items-center">
              <ShieldIcon className="mr-2 h-5 w-5" />
              Admin Login
            </CardTitle>
            <CardDescription>
              Enter your admin credentials to access the management system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAdminLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MailIcon className="h-4 w-4 text-gray" />
                  </div>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockIcon className="h-4 w-4 text-gray" />
                  </div>
                  <Input
                    id="admin-password"
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
                    <ShieldIcon className="mr-2 h-4 w-4" /> Admin Sign In
                  </>
                )}
              </Button>
              
              <Link 
                to="/login"
                className="w-full"
              >
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-gray text-gray hover:bg-gray hover:text-cream"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to User Login
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;
