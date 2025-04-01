
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = '404 - Page Not Found | ABC Company';
  }, []);
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-terracotta mb-4">404</h1>
        <p className="text-2xl font-medium mb-2">Page Not Found</p>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Home Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
