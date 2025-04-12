
import { FileText } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TextRecordFormProps {
  textRecord: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const TextRecordForm = ({ textRecord, handleChange }: TextRecordFormProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Text Record</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <Label htmlFor="textRecord">Meeting Notes</Label>
          </div>
          <Textarea
            id="textRecord"
            name="textRecord"
            placeholder="Enter the text record or meeting minutes here..."
            rows={10}
            value={textRecord}
            onChange={handleChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TextRecordForm;
