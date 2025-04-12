
import { Save } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
}

const FormActions = ({ isSubmitting, mode, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button 
        variant="outline" 
        type="button"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        className="bg-terracotta hover:bg-terracotta/90"
        disabled={isSubmitting}
      >
        <Save className="mr-2 h-4 w-4" />
        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Record' : 'Update Record'}
      </Button>
    </div>
  );
};

export default FormActions;
