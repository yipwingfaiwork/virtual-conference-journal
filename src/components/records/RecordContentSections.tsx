
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConferenceRecord } from '@/lib/types';
import { FileText, Import, MessageSquare } from 'lucide-react';

interface RecordContentSectionsProps {
  record: ConferenceRecord;
}

const RecordContentSections = ({ record }: RecordContentSectionsProps) => {
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Meeting Outline</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: record.outline }}
          />
        </CardContent>
      </Card>
      
      <Card className="md:row-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Text Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: record.textRecord }}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center">
            <Import className="h-4 w-4 mr-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mr-2">Import from AI:</p>
            <p>{record.importFromAI ? 'Yes' : 'No'}</p>
          </div>
          
          {record.remark && (
            <>
              <Separator />
              <div className="flex items-start">
                <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Remarks:</p>
                  <p className="whitespace-pre-line">{record.remark}</p>
                </div>
              </div>
            </>
          )}
          
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Created at:</p>
            <p>{new Date(record.createdAt).toLocaleString()}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Last updated:</p>
            <p>{new Date(record.updatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default RecordContentSections;
