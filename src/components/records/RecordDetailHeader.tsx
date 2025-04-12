
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
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
import { ConferenceRecord } from '@/lib/types';

interface RecordDetailHeaderProps {
  record: ConferenceRecord;
  canModify: boolean;
  canDelete: boolean;
  onDelete: () => Promise<void>;
}

const RecordDetailHeader = ({ 
  record, 
  canModify, 
  canDelete, 
  onDelete 
}: RecordDetailHeaderProps) => {
  const navigate = useNavigate();

  return (
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
                  <AlertDialogAction onClick={onDelete} className="bg-destructive">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordDetailHeader;
