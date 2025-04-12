
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConferenceRecord } from '@/lib/types';

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
          <div className="whitespace-pre-line">
            {record.outline}
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:row-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Text Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{record.textRecord}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
