
import { AlignLeft } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OutlineFormProps {
  outline: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const OutlineForm = ({ outline, handleChange }: OutlineFormProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Meeting Outline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center">
            <AlignLeft className="h-4 w-4 mr-2 text-muted-foreground" />
            <Label htmlFor="outline">Outline (one item per line)</Label>
          </div>
          <Textarea
            id="outline"
            name="outline"
            placeholder="1. Introduction&#10;2. Agenda Review&#10;3. Discussion Points"
            rows={5}
            value={outline}
            onChange={handleChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OutlineForm;
