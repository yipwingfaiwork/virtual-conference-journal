
import { Calendar, Clock, Building, Users, Video, FileText, MessageSquare } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ConferenceRecord } from '@/lib/types';

interface BasicInformationFormProps {
  record: Partial<ConferenceRecord>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleParticipantsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRadioChange: (name: string, value: string) => void;
  participantsInput: string;
}

const BasicInformationForm = ({
  record,
  handleChange,
  handleSelectChange,
  handleParticipantsChange,
  handleRadioChange,
  participantsInput
}: BasicInformationFormProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="title"
              name="title"
              placeholder="Meeting title"
              className="pl-8"
              value={record.title}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">
            Date and Time <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="date"
              name="date"
              type="datetime-local"
              className="pl-8"
              value={record.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">
            Department <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Select 
              name="department"
              value={record.department} 
              onValueChange={(value) => handleSelectChange('department', value)}
            >
              <SelectTrigger id="department" className="pl-8">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">
            Duration <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="duration"
              name="duration"
              placeholder="e.g., 1 hour, 30 minutes"
              className="pl-8"
              value={record.duration}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="participants">
            Participants <span className="text-muted-foreground text-sm">(comma separated)</span>
          </Label>
          <div className="relative">
            <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="participants"
              name="participants"
              placeholder="John Doe, Jane Smith"
              className="pl-8"
              value={participantsInput}
              onChange={handleParticipantsChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="importFromAI">Import from AI generated</Label>
          <RadioGroup 
            id="importFromAI" 
            className="flex flex-row space-x-4"
            value={record.importFromAI ? "yes" : "no"}
            onValueChange={(value) => handleRadioChange('importFromAI', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="ai-yes" />
              <Label htmlFor="ai-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="ai-no" />
              <Label htmlFor="ai-no">No</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="videoLink">Video Link</Label>
          <div className="relative">
            <Video className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="videoLink"
              name="videoLink"
              placeholder="https://example.com/video"
              className="pl-8"
              value={record.videoLink}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remark">Remark</Label>
          <div className="relative">
            <MessageSquare className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="remark"
              name="remark"
              placeholder="Additional notes"
              className="pl-8"
              value={record.remark || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInformationForm;
