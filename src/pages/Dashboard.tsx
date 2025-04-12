
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthenticatedUser } from '@/services/auth-service';
import { useRecords } from '@/hooks/use-records';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardChart from '@/components/dashboard/DashboardChart';
import DashboardQuickSearch from '@/components/dashboard/DashboardQuickSearch';
import DashboardDepartmentStats from '@/components/dashboard/DashboardDepartmentStats';
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks';
import DashboardRecentRecords from '@/components/dashboard/DashboardRecentRecords';
import { User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Use the hook to fetch records from API
  const { records, isLoading: recordsLoading, error: recordsError } = useRecords();
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const currentUser = await getAuthenticatedUser();
        
        // Redirect to login if not authenticated
        if (!currentUser) {
          navigate('/login');
          return;
        }
        
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-10 flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-terracotta" />
            <p className="mt-2">Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <DashboardHeader user={user} />
      
      {/* Chart and Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <DashboardChart />
        </div>
        <div className="space-y-6">
          <DashboardQuickSearch />
          <DashboardDepartmentStats 
            records={records} 
            isLoading={recordsLoading} 
            error={recordsError} 
          />
          <DashboardQuickLinks user={user} />
        </div>
      </div>
      
      {/* Recent Records Table */}
      <DashboardRecentRecords 
        records={records} 
        isLoading={recordsLoading} 
        error={recordsError} 
      />
    </div>
  );
};

export default Dashboard;
