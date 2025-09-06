
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { canUserModifyRecord, getCurrentUser } from '@/lib/auth';
import { ConferenceRecord, User } from '@/lib/types';
import { useRecord, useRecords } from '@/hooks/use-records';

export const useRecordForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { record: existingRecord, isLoading: recordLoading } = useRecord(id || '');
  const { createRecord, updateRecord } = useRecords();
  
  const mode: 'edit' | 'create' = id ? 'edit' : 'create';
  
  const [record, setRecord] = useState<Partial<ConferenceRecord>>({
    date: new Date().toISOString().slice(0, 16),
    duration: '',
    departmentId: undefined,
    title: '',
    participants: [],
    videoLink: '',
    MeetingFullRecord: '',
    MeetingOutline: '',
    remark: '',
    accessLevel: 'DEPARTMENT',
    aiTranslate: false,
    tags: []
  });

  console.log('=== USE RECORD FORM HOOK DEBUG ===');
  console.log('ID from params:', id);
  console.log('Mode:', mode);
  console.log('ExistingRecord from useRecord:', existingRecord);
  console.log('RecordLoading:', recordLoading);
  console.log('Current record state:', record);
  console.log('=== END USE RECORD FORM HOOK DEBUG ===');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const userData = await getCurrentUser();
      
      if (!userData) {
        navigate('/login');
        return;
      }
      
      setUser(userData);
      
      if (mode === 'create') {
        setRecord(prev => ({
          ...prev,
          departmentId: String(userData.departmentId)
        }));
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [navigate, mode]);

  useEffect(() => {
    if (mode === 'edit' && existingRecord && !recordLoading && user) {
      console.log('=== EDIT RECORD DEBUG ===');
      console.log('Mode:', mode);
      console.log('ExistingRecord:', existingRecord);
      console.log('RecordLoading:', recordLoading);
      console.log('User:', user);
      console.log('Record ID from params:', id);
      
      if (!canUserModifyRecord(user, existingRecord.createdBy)) {
        console.log('Permission check failed');
        toast({
          title: "Permission denied",
          description: "You don't have permission to edit this record.",
          variant: "destructive",
        });
        navigate('/records');
        return;
      }
      
      console.log('Permission check passed');
      
      // Ensure departmentId is a string for Select component
      const departmentIdStr = existingRecord.departmentId ? String(existingRecord.departmentId) : String(user.departmentId);
      
      const formattedRecord = {
        id: existingRecord.id,
        date: existingRecord.date ? new Date(existingRecord.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        title: existingRecord.title || '',
        duration: String(existingRecord.duration || ''),
        departmentId: departmentIdStr,
        participants: Array.isArray(existingRecord.participants) ? existingRecord.participants : [],
        videoLink: existingRecord.videoLink || '',
        MeetingFullRecord: existingRecord.MeetingFullRecord || '',
        MeetingOutline: existingRecord.MeetingOutline || '',
        remark: existingRecord.remark || '',
        accessLevel: existingRecord.accessLevel || 'DEPARTMENT',
        aiTranslate: Boolean(existingRecord.aiTranslate),
        tags: Array.isArray(existingRecord.tags) ? existingRecord.tags : [],
        createdBy: existingRecord.createdBy,
        createdAt: existingRecord.createdAt,
        updatedAt: existingRecord.updatedAt
      };
      
      console.log('=== FORMATTED RECORD FOR EDIT ===');
      console.log('Formatted record:', JSON.stringify(formattedRecord, null, 2));
      console.log('Department ID (original vs formatted):', existingRecord.departmentId, '->', departmentIdStr);
      console.log('MeetingFullRecord:', formattedRecord.MeetingFullRecord);
      console.log('MeetingOutline:', formattedRecord.MeetingOutline);
      console.log('Title:', formattedRecord.title);
      console.log('Date:', formattedRecord.date);
      console.log('Participants:', formattedRecord.participants);
      console.log('=== END DEBUG ===');
      
      setRecord(formattedRecord);
    }
  }, [existingRecord, mode, navigate, recordLoading, toast, user, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!record.title || !record.date || !record.departmentId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const recordData = {
        ...record,
        createdBy: user?.id,
        departmentId: record.departmentId || user?.departmentId,
        aiTranslate: record.aiTranslate || false
      };
      
      console.log('Submitting record data:', recordData);
      
      if (mode === 'create') {
        createRecord(recordData);
      } else if (mode === 'edit' && id) {
        updateRecord({
          id,
          data: recordData
        });
      }
      
      const successMessage = mode === 'create'
        ? "Conference record created successfully"
        : "Conference record updated successfully";
      
      toast({
        title: "Success",
        description: successMessage,
      });
      
      navigate('/records');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    record,
    setRecord,
    user,
    loading,
    recordLoading,
    isSubmitting,
    mode,
    handleSubmit,
    navigate
  };
};
