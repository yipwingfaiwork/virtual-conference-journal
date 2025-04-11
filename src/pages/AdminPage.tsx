
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';
import ActivityLogs from '@/components/admin/ActivityLogs';

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          navigate('/login');
          return;
        }
        
        if (!currentUser.isAdmin) {
          navigate('/dashboard');
          return;
        }
        
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [navigate]);

  if (loading) {
    return <div className="p-4 sm:p-6 md:p-8 flex justify-center">Loading...</div>;
  }

  if (!user || !user.isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-terracotta mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity">
          <ActivityLogs />
        </TabsContent>
        
        <TabsContent value="users">
          <div className="text-center text-muted-foreground p-8">
            User management coming soon
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="text-center text-muted-foreground p-8">
            System settings coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
