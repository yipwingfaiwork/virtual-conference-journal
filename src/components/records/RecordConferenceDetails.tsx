
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConferenceRecord } from '@/lib/types';
import { Calendar, Clock, Users, Building2, Shield, Languages, Download } from 'lucide-react';

interface RecordConferenceDetailsProps {
  record: ConferenceRecord;
  creatorName: string | null;
}

const RecordConferenceDetails = ({ record, creatorName }: RecordConferenceDetailsProps) => {
  const getAccessLevelBadge = (accessLevel: string) => {
    switch (accessLevel) {
      case 'PUBLIC':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Public</Badge>;
      case 'CONFIDENTIAL':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Confidential</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Department</Badge>;
    }
  };

  const downloadTextRecord = () => {
    if (!record.textRecord) {
      return;
    }
    
    const element = document.createElement('a');
    const file = new Blob([record.textRecord], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${record.title || 'record'}-text-record.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Conference Details</CardTitle>
          {record.textRecord && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTextRecord}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Text Record
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start">
          <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Date & Time:</p>
            <p>{new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString()}</p>
          </div>
        </div>
        <Separator />
        
        <div className="flex items-start">
          <Clock className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Duration:</p>
            <p>{record.duration}</p>
          </div>
        </div>
        <Separator />
        
        <div className="flex items-start">
          <Building2 className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Department:</p>
            <p>{record.department}</p>
          </div>
        </div>
        <Separator />
        
        <div className="flex items-start">
          <Users className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Created by:</p>
            <p>{creatorName || 'Unknown'}</p>
          </div>
        </div>
        <Separator />
        
        <div className="flex items-start">
          <Shield className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Access Level:</p>
            <div className="mt-1">
              {getAccessLevelBadge(record.accessLevel)}
            </div>
          </div>
        </div>
        <Separator />
        
        {record.aiTranslate !== undefined && (
          <>
            <div className="flex items-start">
              <Languages className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">AI Translate:</p>
                <Badge variant={record.aiTranslate ? "default" : "secondary"}>
                  {record.aiTranslate ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
            <Separator />
          </>
        )}
        
        {record.tags && record.tags.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {record.tags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  style={{ 
                    backgroundColor: `${tag.color}20`,
                    borderColor: tag.color,
                    color: tag.color
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecordConferenceDetails;
