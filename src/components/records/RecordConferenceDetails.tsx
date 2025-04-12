
import { Calendar, Clock, Users, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConferenceRecord } from '@/lib/types';

interface RecordConferenceDetailsProps {
  record: ConferenceRecord;
  creatorName: string | null;
}

const RecordConferenceDetails = ({ record, creatorName }: RecordConferenceDetailsProps) => {
  return (
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
          <span>{creatorName || 'Unknown'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordConferenceDetails;
