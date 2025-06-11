
import { Calendar, Clock, Building, Users, Video, MessageSquare, Tag } from 'lucide-react';
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
import { ConferenceRecord, Tag as TagType } from '@/lib/types';
import { useState, useEffect } from 'react';
import apiClient from '@/services/api-service';

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
  participantsInput
}: BasicInformationFormProps) => {
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    // Load available tags
    const loadTags = async () => {
      try {
        const response = await apiClient.get('/tags');
        setAvailableTags(response.data);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    // Update tags input when record tags change
    if (record.tags && Array.isArray(record.tags)) {
      setTagsInput(record.tags.map(tag => tag.name).join(', '));
    }
  }, [record.tags]);

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagsInput(value);
    
    // Convert comma-separated tags to tag objects
    const tagNames = value.split(',').map(name => name.trim()).filter(name => name);
    const tags = tagNames.map(name => {
      const existingTag = availableTags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
      return existingTag || { id: '', name, color: '#3B82F6', description: '' };
    });
    
    // Update record tags
    handleSelectChange('tags', JSON.stringify(tags));
  };

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
            <Input
              id="title"
              name="title"
              placeholder="Meeting title"
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
          <Label htmlFor="departmentId">
            Department <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Select 
              name="departmentId"
              value={record.departmentId?.toString() || record.department} 
              onValueChange={(value) => handleSelectChange('departmentId', value)}
            >
              <SelectTrigger id="departmentId" className="pl-8">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Operations</SelectItem>
                <SelectItem value="2">Finance</SelectItem>
                <SelectItem value="3">Management</SelectItem>
                <SelectItem value="4">Administration</SelectItem>
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
          <Label htmlFor="tags">
            Tags <span className="text-muted-foreground text-sm">(comma separated)</span>
          </Label>
          <div className="relative">
            <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="tags"
              name="tags"
              placeholder="meeting, finance, planning"
              className="pl-8"
              value={tagsInput}
              onChange={handleTagsChange}
            />
          </div>
          {availableTags.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Available tags: {availableTags.map(tag => tag.name).join(', ')}
            </div>
          )}
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
