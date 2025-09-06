
import { AlignLeft } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface OutlineFormProps {
  outline: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const OutlineForm = ({ outline, handleChange }: OutlineFormProps) => {
  console.log('=== OUTLINE FORM DEBUG ===');
  console.log('Outline value:', outline);
  console.log('=== END OUTLINE FORM DEBUG ===');

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
          <Textarea
            name="MeetingOutline"
            value={outline}
            onChange={handleChange}
            placeholder="Enter meeting outline..."
            className="min-h-[200px] resize-y"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OutlineForm;
