
import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from '@/lib/types';

interface DashboardQuickLinksProps {
  user: User;
}

const DashboardQuickLinks = ({ user }: DashboardQuickLinksProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Quick Links</CardTitle>
        <CardDescription>Frequently used actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="justify-start border-gold/30 hover:bg-gold/10 hover:text-gold"
            onClick={() => navigate('/records')}
          >
            <FileText className="mr-2 h-4 w-4" />
            All Records
          </Button>
          <Button 
            variant="outline" 
            className="justify-start border-terracotta/30 hover:bg-terracotta/10 hover:text-terracotta"
            onClick={() => navigate('/records/new')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Record
          </Button>
          <Button 
            variant="outline" 
            className="justify-start border-teal/30 hover:bg-teal/10 hover:text-teal"
            onClick={() => navigate('/profile')}
          >
            <Users className="mr-2 h-4 w-4" />
            Profile
          </Button>
          {user.isAdmin && (
            <Button 
              variant="outline" 
              className="justify-start border-gray/30 hover:bg-gray/10 hover:text-gray"
              onClick={() => navigate('/admin')}
            >
              <Users className="mr-2 h-4 w-4" />
              Admin
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickLinks;
