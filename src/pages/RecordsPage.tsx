
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, Search, Filter, Calendar, Clock, User, Video, FileText, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ConferenceRecord } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';
import { useRecords } from '@/hooks/use-records';
import apiClient from '@/services/api-service';

const RecordsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState<ConferenceRecord[]>([]);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
  
  // Fetch records from API using our hook
  const { records, isLoading, error } = useRecords({
    department: departmentFilter !== 'all' ? departmentFilter : undefined
  });
  
  // Parse search query from URL
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
    };
    
    fetchUser();
    
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [location.search, navigate]);
  
  // Fetch creator names for the records
  useEffect(() => {
    const fetchCreatorNames = async () => {
      if (!records) return;
      
      const uniqueCreatorIds = [...new Set(records.map(record => record.createdBy))];
      const names: Record<string, string> = {};
      
      await Promise.all(
        uniqueCreatorIds.map(async (creatorId) => {
          try {
            const response = await apiClient.get(`/users/${creatorId}`);
            names[creatorId] = response.data.name;
          } catch (error) {
            console.error(`Error fetching user ${creatorId}:`, error);
            names[creatorId] = 'Unknown';
          }
        })
      );
      
      setCreatorNames(names);
    };
    
    fetchCreatorNames();
  }, [records]);
  
  // Filter records when search/filters change
  useEffect(() => {
    if (!records) {
      setFilteredRecords([]);
      return;
    }
    
    let results = [...records];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(record => 
        record.title.toLowerCase().includes(term) ||
        record.department.toLowerCase().includes(term) ||
        record.textRecord.toLowerCase().includes(term)
      );
    }
    
    setFilteredRecords(results);
  }, [records, searchTerm]);
  
  if (!user) {
    return null;
  }
  
  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
  };
  
  const getCreatorName = (userId: string) => {
    return creatorNames[userId] || 'Unknown';
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-terracotta">Conference Records</h1>
          <p className="text-muted-foreground mt-1">
            Browse and search all conference records
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
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search" 
                placeholder="Search by title, content..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              className={showFilters ? "bg-teal/10" : ""}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary"
              onClick={clearFilters}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={departmentFilter} 
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="rounded-md border shadow-sm">
        {isLoading ? (
          <div className="text-center p-8">Loading records...</div>
        ) : error ? (
          <div className="text-center p-8 text-destructive">Error loading records</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden sm:table-cell">Created By</TableHead>
                <TableHead className="hidden lg:table-cell">Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
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
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        {getCreatorName(record.createdBy)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {record.duration}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/records/${record.id}`)}
                        >
                          View
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hidden sm:flex"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[625px]">
                            <DialogHeader>
                              <DialogTitle className="text-terracotta">{record.title}</DialogTitle>
                              <DialogDescription>
                                {record.department} • {new Date(record.date).toLocaleDateString()} • {record.duration}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div>
                                <h3 className="text-sm font-medium mb-1">Participants</h3>
                                <p className="text-sm">{record.participants.join(', ')}</p>
                              </div>
                              <Separator />
                              <div>
                                <h3 className="text-sm font-medium mb-1">Meeting Outline</h3>
                                <p className="text-sm whitespace-pre-line">{record.outline}</p>
                              </div>
                              <Separator />
                              <div>
                                <h3 className="text-sm font-medium mb-1">Text Record Preview</h3>
                                <p className="text-sm line-clamp-4">{record.textRecord}</p>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <Button variant="outline" onClick={() => navigate(`/records/${record.id}`)}>
                                View Full Record
                              </Button>
                              {record.videoLink && (
                                <Button variant="outline" className="gap-2" asChild>
                                  <a href={record.videoLink} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4" />
                                    Video
                                  </a>
                                </Button>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default RecordsPage;
