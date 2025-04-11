
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import { useRecords } from '@/hooks/use-records';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardChart from '@/components/dashboard/DashboardChart';
import DashboardQuickSearch from '@/components/dashboard/DashboardQuickSearch';
import DashboardDepartmentStats from '@/components/dashboard/DashboardDepartmentStats';
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks';
import DashboardRecentRecords from '@/components/dashboard/DashboardRecentRecords';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Use the hook to fetch records from API
  const { records, isLoading, error } = useRecords();
  
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      
      // Redirect to login if not authenticated
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      setUser(currentUser);
    };
    
    fetchUser();
  }, [navigate]);
  
  if (!user) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <DashboardHeader user={user} />
      
      {/* Chart and Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardChart />
        <DashboardQuickSearch />
        <DashboardDepartmentStats 
          records={records} 
          isLoading={isLoading} 
          error={error} 
        />
        <DashboardQuickLinks user={user} />
      </div>
      
      {/* Recent Records Table */}
      <DashboardRecentRecords 
        records={records} 
        isLoading={isLoading} 
        error={error} 
      />
    </div>
  );
};

export default Dashboard;
