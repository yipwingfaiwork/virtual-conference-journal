
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Video, FileText, Clock, Users, PlusCircle, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from '@/lib/auth';
import { conferenceRecords } from '@/lib/mockData';
import { ConferenceRecord } from '@/lib/types';
import AccessLevelBadge from '@/components/AccessLevelBadge';

const Dashboard = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [recentRecords, setRecentRecords] = useState<ConferenceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Get recent records
    setRecentRecords(
      conferenceRecords
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    );
  }, [navigate, user]);
  
  if (!user) {
    return null;
  }

  const handleSearch = () => {
    navigate(`/records?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-terracotta">Welcome, {user.name}</h1>
          <p className="text-muted-foreground mt-1 flex items-center">
            Access Level: <AccessLevelBadge accessLevel={user.accessLevel} className="ml-2" />
            {user.isAdmin && (
              <span className="ml-2 text-xs bg-gray text-white px-2 py-0.5 rounded">Admin</span>
            )}
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Quick Search</CardTitle>
            <CardDescription>Search conference records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search" 
                  placeholder="Search by title, department..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                type="submit" 
                onClick={handleSearch}
                className="bg-teal hover:bg-teal/90"
              >
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Department Stats</CardTitle>
            <CardDescription>Records by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(['Operations', 'Finance', 'Management', 'Administration'] as const).map(dept => {
                const count = conferenceRecords.filter(record => record.department === dept).length;
                return (
                  <div key={dept} className="flex justify-between items-center">
                    <span>{dept}</span>
                    <span className="text-sm font-medium bg-teal/10 text-teal px-2 py-0.5 rounded-full">
                      {count} records
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
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
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Conference Records</CardTitle>
          <CardDescription>The latest conference records in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{record.title}</TableCell>
                  <TableCell className="hidden md:table-cell">{record.department}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {record.duration}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/records/${record.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/records')}
          >
            View All Records
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
