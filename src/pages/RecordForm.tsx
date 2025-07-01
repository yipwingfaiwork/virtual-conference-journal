import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { canUserModifyRecord, getCurrentUser } from '@/lib/auth';
import { ConferenceRecord, User } from '@/lib/types';
import { useRecord, useRecords } from '@/hooks/use-records';
import BasicInformationForm from '@/components/forms/BasicInformationForm';
import OutlineForm from '@/components/forms/OutlineForm';
import TextRecordForm from '@/components/forms/TextRecordForm';
import FormActions from '@/components/forms/FormActions';

const RecordForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { record: existingRecord, isLoading: recordLoading } = useRecord(id || '');
  const { createRecord, updateRecord } = useRecords();
  
  const mode = id ? 'edit' : 'create';
  
  const [record, setRecord] = useState<Partial<ConferenceRecord>>({
    date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
    duration: '',
    departmentId: undefined,
    title: '',
    participants: [],
    videoLink: '',
    textRecord: '',
    outline: '',
    remark: '',
    accessLevel: 'DEPARTMENT',
    aiTranslate: false,
  });
  
  const [participantsInput, setParticipantsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const userData = await getCurrentUser();
      
      if (!userData) {
        navigate('/login');
        return;
      }
      
      setUser(userData);
      
      // Set default department for new records
      if (mode === 'create') {
        setRecord(prev => ({
          ...prev,
          departmentId: userData.departmentId
        }));
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [navigate, mode]);
  
  useEffect(() => {
    if (mode === 'edit' && existingRecord && !recordLoading) {
      if (user && !canUserModifyRecord(user, existingRecord.createdBy)) {
        toast({
          title: "Permission denied",
          description: "You don't have permission to edit this record.",
          variant: "destructive",
        });
        navigate('/records');
        return;
      }
      
      // Convert date from database format to datetime-local format and set all fields
      const formattedRecord = {
        ...existingRecord,
        date: existingRecord.date ? new Date(existingRecord.date).toISOString().slice(0, 16) : '',
        title: existingRecord.title || '',
        duration: existingRecord.duration || '',
        departmentId: existingRecord.departmentId || '',
        participants: existingRecord.participants || [],
        videoLink: existingRecord.videoLink || '',
        textRecord: existingRecord.textRecord || '',
        outline: existingRecord.outline || '',
        remark: existingRecord.remark || '',
        accessLevel: existingRecord.accessLevel || 'DEPARTMENT',
        aiTranslate: existingRecord.aiTranslate || false,
        tags: existingRecord.tags || []
      };
      
      console.log('Setting record with formatted data:', formattedRecord);
      setRecord(formattedRecord);
      setParticipantsInput(existingRecord.participants ? existingRecord.participants.join(', ') : '');
    }
  }, [existingRecord, mode, navigate, recordLoading, toast, user]);
  
  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (mode === 'edit' && recordLoading) {
    return <div className="flex justify-center items-center h-screen">Loading record...</div>;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecord(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'departmentId') {
      setRecord(prev => ({ ...prev, departmentId: value }));
    } else {
      setRecord(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRadioChange = (name: string, value: string) => {
    // This function is no longer needed but keeping for compatibility
    console.log('Radio change:', name, value);
  };
  
  const handleParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParticipantsInput(e.target.value);
    const participants = e.target.value
      .split(',')
      .map(p => p.trim())
      .filter(p => p);
    
    setRecord(prev => ({ ...prev, participants }));
  };
  
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
        createdBy: user.id,
        departmentId: record.departmentId || user.departmentId,
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
        
        <h1 className="text-2xl sm:text-3xl font-bold text-terracotta">
          {mode === 'create' ? 'Create New Conference Record' : 'Edit Conference Record'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <BasicInformationForm
            record={record}
            setRecord={setRecord}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleParticipantsChange={handleParticipantsChange}
            handleRadioChange={handleRadioChange}
            participantsInput={participantsInput}
          />
          
          <div className="space-y-6">
            <OutlineForm 
              outline={record.outline || ''} 
              handleChange={handleChange} 
            />
            
            <TextRecordForm 
              textRecord={record.textRecord || ''} 
              handleChange={handleChange} 
            />
          </div>
        </div>
        
        <FormActions 
          isSubmitting={isSubmitting} 
          mode={mode} 
          onCancel={() => navigate('/records')} 
        />
      </form>
    </div>
  );
};

export default RecordForm;
