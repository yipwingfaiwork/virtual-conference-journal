
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
import { conferenceRecords } from '@/lib/mockData';
import { ConferenceRecord } from '@/lib/types';
import { canUserAccessRecord, getCurrentUser } from '@/lib/auth';
import { users } from '@/lib/auth';

const RecordsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [records, setRecords] = useState<ConferenceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ConferenceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Parse search query from URL
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
    
    // Get visible records based on user access
    const accessibleRecords = conferenceRecords.filter(record => 
      canUserAccessRecord(user, record.createdBy)
    );
    
    setRecords(accessibleRecords);
  }, [location.search, navigate, user]);
  
  // Filter records when search/filters change
  useEffect(() => {
    let results = records;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(record => 
        record.title.toLowerCase().includes(term) ||
        record.department.toLowerCase().includes(term) ||
        record.textRecord.toLowerCase().includes(term)
      );
    }
    
    if (departmentFilter && departmentFilter !== 'all') {
      results = results.filter(record => 
        record.department === departmentFilter
      );
    }
    
    setFilteredRecords(results);
  }, [records, searchTerm, departmentFilter]);
  
  if (!user) {
    return null;
  }
  
  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
  };
  
  const getCreatorName = (userId: string) => {
    const creator = users.find(u => u.id === userId);
    return creator ? creator.name : 'Unknown';
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
      </div>
    </div>
  );
};

export default RecordsPage;
