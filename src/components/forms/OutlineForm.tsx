
import { AlignLeft } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/ui/rich-text-editor";

interface OutlineFormProps {
  outline: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const OutlineForm = ({ outline, handleChange }: OutlineFormProps) => {
  const handleRichTextChange = (value: string) => {
    // Create a synthetic event to match the expected interface
        const syntheticEvent = {
        target: {
          name: 'MeetingOutline',
          value: value
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleChange(syntheticEvent);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Meeting Outline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center">
            <AlignLeft className="h-4 w-4 mr-2 text-muted-foreground" />
            <Label htmlFor="outline">Meeting Outline</Label>
          </div>
          <RichTextEditor
            value={outline}
            onChange={handleRichTextChange}
            placeholder="Enter meeting outline with formatting..."
            className="min-h-[200px]"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OutlineForm;
