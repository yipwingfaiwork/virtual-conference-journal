
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { canUserDeleteRecord, canUserModifyRecord, getCurrentUser } from '@/lib/auth';
import { useRecord } from '@/hooks/use-records';
import apiClient from '@/services/api-service';
import RecordDetailHeader from '@/components/records/RecordDetailHeader';
import RecordConferenceDetails from '@/components/records/RecordConferenceDetails';
import RecordParticipants from '@/components/records/RecordParticipants';
import RecordResources from '@/components/records/RecordResources';
import RecordContentSections from '@/components/records/RecordContentSections';

const RecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<null | any>(null);
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
        if (currentUser && typeof currentUser === 'object' && 'id' in currentUser) {
          setCanModify(canUserModifyRecord(currentUser, record.createdBy));
          setCanDelete(canUserDeleteRecord(currentUser));
        } else {
          setCanModify(canUserModifyRecord(currentUser.toString(), record.createdBy));
          setCanDelete(canUserDeleteRecord(currentUser.toString()));
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
        <RecordConferenceDetails record={record} creatorName={creator?.name} />
        <RecordParticipants participants={record.participants} />
        <RecordResources videoLink={record.videoLink} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <RecordContentSections record={record} />
      </div>
    </div>
  );
};

export default RecordDetail;
