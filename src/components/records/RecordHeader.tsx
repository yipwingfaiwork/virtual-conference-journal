
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const RecordHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-terracotta">Meeting Records</h1>
        <p className="text-muted-foreground mt-1">
          Browse and search all meeting records
        </p>
      </div>
      <div className="mt-4 sm:mt-0">
        <Button 
          onClick={() => navigate('/records/new')}
          className="bg-terracotta hover:bg-terracotta/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Record
        </Button>
      </div>
    </div>
  );
};

export default RecordHeader;
