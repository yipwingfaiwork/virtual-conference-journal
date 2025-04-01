
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser, logout } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Update user when it changes
    setUser(getCurrentUser());
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="bg-cream shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-terracotta">ABC Company</span>
            </Link>
          </div>
          
          {user && (
            <>
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                <Link to="/dashboard" className="px-3 py-2 text-gray hover:text-terracotta">
                  Dashboard
                </Link>
                <Link to="/records" className="px-3 py-2 text-gray hover:text-terracotta">
                  Records
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="px-3 py-2 text-gray hover:text-terracotta">
                    Admin
                  </Link>
                )}
              </div>

              <div className="hidden md:ml-6 md:flex md:items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-teal text-cream">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray hover:text-terracotta focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && user && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/dashboard" 
              className="block px-3 py-2 text-base font-medium text-gray hover:text-terracotta"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/records" 
              className="block px-3 py-2 text-base font-medium text-gray hover:text-terracotta"
              onClick={() => setIsMenuOpen(false)}
            >
              Records
            </Link>
            {user.isAdmin && (
              <Link 
                to="/admin" 
                className="block px-3 py-2 text-base font-medium text-gray hover:text-terracotta"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <Link 
              to="/profile" 
              className="block px-3 py-2 text-base font-medium text-gray hover:text-terracotta"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            <button 
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray hover:text-terracotta"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
