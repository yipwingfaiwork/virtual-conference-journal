
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { User } from '@/lib/types';
import AccessLevelBadge from '@/components/AccessLevelBadge';

interface DashboardHeaderProps {
  user: User;
}

const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-terracotta">Welcome, {user.name}</h1>
        <p className="text-muted-foreground mt-1 flex items-center">
          Role: <AccessLevelBadge isAdmin={user.isAdmin} className="ml-2" />
        </p>
      </div>
      <div className="mt-4 sm:mt-0">
        <Button 
          onClick={() => navigate('/records/new')}
          className="bg-terracotta hover:bg-terracotta/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Record
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
