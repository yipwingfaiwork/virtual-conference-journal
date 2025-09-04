
import { FileText } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/ui/rich-text-editor";

interface TextRecordFormProps {
  textRecord: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const TextRecordForm = ({ textRecord, handleChange }: TextRecordFormProps) => {
  const handleRichTextChange = (value: string) => {
    // Create a synthetic event to match the expected interface
        const syntheticEvent = {
        target: {
          name: 'MeetingFullRecord',
          value: value
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleChange(syntheticEvent);
  };

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
          <RichTextEditor
            value={textRecord}
            onChange={handleRichTextChange}
            placeholder="Enter meeting notes with formatting..."
            className="min-h-[300px]"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TextRecordForm;
