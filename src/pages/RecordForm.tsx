
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRecordForm } from '@/hooks/use-record-form';
import BasicInformationForm from '@/components/forms/BasicInformationForm';
import OutlineForm from '@/components/forms/OutlineForm';
import TextRecordForm from '@/components/forms/TextRecordForm';
import FormActions from '@/components/forms/FormActions';

const RecordForm = () => {
  const {
    record,
    setRecord,
    user,
    loading,
    recordLoading,
    isSubmitting,
    mode,
    handleSubmit,
    navigate
  } = useRecordForm();
  
  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (mode === 'edit' && recordLoading) {
    return <div className="flex justify-center items-center h-screen">Loading record...</div>;
  }

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
          />
          
          <div className="space-y-6">
            <OutlineForm 
              outline={record.outline || ''} 
              handleChange={(e) => setRecord({ ...record, outline: e.target.value })} 
            />
            
            <TextRecordForm 
              textRecord={record.textRecord || ''} 
              handleChange={(e) => setRecord({ ...record, textRecord: e.target.value })} 
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
