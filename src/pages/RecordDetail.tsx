
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, Users, Video, Link2, Pencil, Trash2, ArrowLeft, Building } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { canUserDeleteRecord, canUserModifyRecord, getCurrentUser } from '@/lib/auth';
import { useRecord } from '@/hooks/use-records';
import apiClient from '@/services/api-service';

const RecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [creator, setCreator] = useState(null);
  const [canModify, setCanModify] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  
  // Use the hook to fetch the record data
  const { record, isLoading, error } = useRecord(id || '');
  
  useEffect(() => {
    const fetchUserAndPermissions = async () => {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      setUser(currentUser);
      
      if (record) {
        // Fetch creator info
        try {
          const creatorResponse = await apiClient.get(`/users/${record.createdBy}`);
          setCreator(creatorResponse.data);
        } catch (error) {
          console.error('Error fetching creator data:', error);
        }
        
        // Check permissions
        try {
          const modifyResponse = await canUserModifyRecord(currentUser.id, record.createdBy);
          setCanModify(modifyResponse);
          
          const deleteResponse = await canUserDeleteRecord(currentUser.id);
          setCanDelete(deleteResponse);
        } catch (error) {
          console.error('Error checking permissions:', error);
        }
      }
    };
    
    fetchUserAndPermissions();
  }, [id, navigate, record]);
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Record not found",
        description: "The requested record does not exist or you don't have permission to view it.",
        variant: "destructive",
      });
      navigate('/records');
    }
  }, [error, navigate, toast]);
  
  if (!user || isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 text-center">
        <p>Loading record...</p>
      </div>
    );
  }
  
  if (!record) {
    return null;
  }
  
  const handleDelete = async () => {
    try {
      await apiClient.delete(`/records/${id}`);
      toast({
        title: "Record deleted",
        description: "The conference record has been permanently deleted.",
      });
      navigate('/records');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the record",
        variant: "destructive",
      });
      console.error('Error deleting record:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0 mb-2"
          onClick={() => navigate('/records')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Records
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-terracotta">{record.title}</h1>
          
          <div className="flex space-x-2 mt-4 sm:mt-0">
            {canModify && (
              <Button 
                variant="outline"
                onClick={() => navigate(`/records/edit/${record.id}`)}
                className="border-gold text-gold hover:bg-gold/10"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      conference record and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Conference Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">Date:</span>
              <span>{new Date(record.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">Duration:</span>
              <span>{record.duration}</span>
            </div>
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">Department:</span>
              <Badge variant="outline" className="bg-teal/10">
                {record.department}
              </Badge>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">Created by:</span>
              <span>{creator ? creator.name : 'Unknown'}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {record.participants.map((participant, index) => (
                <Badge key={index} variant="secondary">
                  {participant}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {record.videoLink && (
              <div>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={record.videoLink} target="_blank" rel="noopener noreferrer">
                    <Video className="mr-2 h-4 w-4 text-gold" />
                    Watch Recording
                  </a>
                </Button>
              </div>
            )}
            <div>
              <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
                <Link2 className="mr-2 h-4 w-4 text-teal" />
                Share Record
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Meeting Outline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line">
              {record.outline}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:row-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Text Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>{record.textRecord}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Created at:</p>
              <p>{new Date(record.createdAt).toLocaleString()}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Last updated:</p>
              <p>{new Date(record.updatedAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecordDetail;
