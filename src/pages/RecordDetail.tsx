
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from '@/lib/auth';
import { PermissionService } from '@/services/permission-service';
import { useRecord } from '@/hooks/use-records';
import apiClient from '@/services/api-service';
import { RecordChange, User } from '@/lib/types';
import RecordDetailHeader from '@/components/records/RecordDetailHeader';
import RecordConferenceDetails from '@/components/records/RecordConferenceDetails';
import RecordParticipants from '@/components/records/RecordParticipants';
import RecordResources from '@/components/records/RecordResources';
import RecordContentSections from '@/components/records/RecordContentSections';
import RecordChangeHistory from '@/components/records/RecordChangeHistory';

const RecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [changes, setChanges] = useState<RecordChange[]>([]);
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
        // Check permissions using the new permission service
        const canView = PermissionService.canUserViewRecord(currentUser, record);
        if (!canView) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this record.",
            variant: "destructive",
          });
          navigate('/records');
          return;
        }
        
        // Fetch creator info
        try {
          const creatorResponse = await apiClient.get(`/users/${record.createdBy}`);
          setCreator(creatorResponse.data);
        } catch (error) {
          console.error('Error fetching creator data:', error);
        }
        
        // Fetch change history
        try {
          const changesResponse = await apiClient.get(`/records/${id}/changes`);
          setChanges(changesResponse.data);
        } catch (error) {
          console.error('Error fetching change history:', error);
        }
        
        // Check permissions
        setCanModify(PermissionService.canUserEditRecord(currentUser, record));
        setCanDelete(PermissionService.canUserDeleteRecord(currentUser, record));
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

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <RecordDetailHeader 
        record={record}
        canModify={canModify}
        canDelete={canDelete}
        onDelete={handleDelete}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <RecordConferenceDetails record={record} creatorName={creator?.name || null} />
        <RecordParticipants participants={record.participants} />
        <RecordResources videoLink={record.videoLink} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <RecordContentSections record={record} />
        <RecordChangeHistory changes={changes} />
      </div>
    </div>
  );
};

export default RecordDetail;
