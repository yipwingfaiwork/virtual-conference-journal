
import { useEffect, useState } from 'react';
import { ConferenceRecord } from '@/lib/types';
import apiClient from '@/services/api-service';
import BasicFields from './BasicFields';
import ParticipantsField from './ParticipantsField';
import TagsField from './TagsField';
import RemarkField from './RemarkField';

interface BasicInformationFormProps {
  record: Partial<ConferenceRecord>;
  setRecord: (record: Partial<ConferenceRecord>) => void;
}

interface Department {
  id: string;
  name: string;
}

const BasicInformationForm = ({ record, setRecord }: BasicInformationFormProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await apiClient.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  return (
    <div className="space-y-4">
      <BasicFields 
        record={record} 
        setRecord={setRecord} 
        departments={departments} 
      />
      
      <ParticipantsField 
        record={record} 
        setRecord={setRecord} 
      />
      
      <TagsField 
        record={record} 
        setRecord={setRecord} 
      />
      
      <RemarkField 
        record={record} 
        setRecord={setRecord} 
      />
    </div>
  );
};

export default BasicInformationForm;
