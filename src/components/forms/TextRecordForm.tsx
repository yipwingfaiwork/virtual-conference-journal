
import { FileText } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface TextRecordFormProps {
  textRecord: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const TextRecordForm = ({ textRecord, handleChange }: TextRecordFormProps) => {
  console.log('=== TEXT RECORD FORM DEBUG ===');
  console.log('Text record value:', textRecord);
  console.log('=== END TEXT RECORD FORM DEBUG ===');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Meeting Full Record</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <Label htmlFor="textRecord">Meeting Full Record</Label>
          </div>
          <Textarea
            name="MeetingFullRecord"
            value={textRecord}
            onChange={handleChange}
            placeholder="Enter meeting notes..."
            className="min-h-[300px] resize-y"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TextRecordForm;
