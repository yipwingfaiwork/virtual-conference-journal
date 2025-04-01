
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus, Pencil, Trash2, Search, Filter, RefreshCw, Activity, UserCog } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, users } from '@/lib/auth';
import { activityLogs } from '@/lib/mockData';
import AccessLevelBadge from '@/components/AccessLevelBadge';

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  
  const [usersList, setUsersList] = useState(users);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    accessLevel: 1 as 1 | 2 | 3,
    isAdmin: false,
  });
  
  useEffect(() => {
    if (!user || !user.isAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access the admin area.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
    
    setUsersList(users);
  }, [navigate, toast, user]);
  
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        usersList.filter(u => 
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.department.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredUsers(usersList);
    }
  }, [searchTerm, usersList]);
  
  if (!user || !user.isAdmin) {
    return null;
  }
  
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      id: Math.random().toString(36).substring(7),
      name: '',
      email: '',
      phone: '',
      address: '',
      department: '',
      accessLevel: 1,
      isAdmin: false,
    });
    setIsDialogOpen(true);
  };
  
  const handleEditUser = (user: typeof users[0]) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsDialogOpen(true);
  };
  
  const handleDeleteUser = (userId: string) => {
    // In a real app, this would call an API
    setUsersList(usersList.filter(u => u.id !== userId));
    
    toast({
      title: "User deleted",
      description: "The user has been permanently removed from the system.",
    });
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'accessLevel') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) as 1 | 2 | 3 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleIsAdminChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isAdmin: checked }));
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (editingUser) {
      // Update existing user
      setUsersList(usersList.map(u => 
        u.id === editingUser.id ? formData : u
      ));
      
      toast({
        title: "User updated",
        description: `User ${formData.name} has been updated successfully.`,
      });
    } else {
      // Add new user
      setUsersList([...usersList, formData]);
      
      toast({
        title: "User added",
        description: `User ${formData.name} has been added successfully.`,
      });
    }
    
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-terracotta mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center">
            <UserCog className="mr-2 h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Activity Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="animate-fadeIn">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search" 
                    placeholder="Search users..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button 
                    onClick={handleAddUser}
                    className="bg-terracotta hover:bg-terracotta/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden sm:table-cell">Access Level</TableHead>
                    <TableHead className="hidden sm:table-cell">Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.department}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <AccessLevelBadge accessLevel={user.accessLevel} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {user.isAdmin ? 
                            <span className="text-xs bg-gray text-white px-2 py-0.5 rounded">Admin</span> : 
                            <span className="text-xs">User</span>
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-destructive border-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-destructive"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Update the user information.' : 'Fill in the details to add a new user.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accessLevel">Access Level *</Label>
                      <Select 
                        value={formData.accessLevel.toString()} 
                        onValueChange={(value) => handleSelectChange('accessLevel', value)}
                      >
                        <SelectTrigger id="accessLevel">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Level 1</SelectItem>
                          <SelectItem value="2">Level 2</SelectItem>
                          <SelectItem value="3">Level 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex items-end">
                      <div className="flex items-center space-x-2 h-10">
                        <Checkbox 
                          id="isAdmin" 
                          checked={formData.isAdmin}
                          onCheckedChange={handleIsAdminChange}
                        />
                        <Label htmlFor="isAdmin">Administrator</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-terracotta hover:bg-terracotta/90"
                  >
                    {editingUser ? 'Save Changes' : 'Add User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="logs" className="animate-fadeIn">
          <Card>
            <CardHeader>
              <CardTitle>System Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.length > 0 ? (
                    activityLogs.map((log) => {
                      const logUser = users.find(u => u.id === log.userId);
                      return (
                        <TableRow key={log.id}>
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{logUser?.name || 'Unknown User'}</TableCell>
                          <TableCell>
                            <Badge className="bg-teal/10 text-teal border-teal">
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{log.details}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
