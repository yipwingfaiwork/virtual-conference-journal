
import { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from 'lucide-react';
import { ConferenceRecord, Tag } from '@/lib/types';
import apiClient from '@/services/api-service';

interface BasicInformationFormProps {
  record: Partial<ConferenceRecord>;
  setRecord: (record: Partial<ConferenceRecord>) => void;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange?: (name: string, value: string) => void;
  handleParticipantsChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRadioChange?: (name: string, value: string) => void;
  participantsInput?: string;
}

interface Department {
  id: string;
  name: string;
}

const BasicInformationForm = ({ 
  record, 
  setRecord,
  handleChange,
  handleSelectChange,
  handleParticipantsChange,
  handleRadioChange,
  participantsInput
}: BasicInformationFormProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  useEffect(() => {
    loadDepartments();
    loadTags();
  }, []);

  useEffect(() => {
    // Initialize selected tags from record
    if (record.tags && Array.isArray(record.tags)) {
      setSelectedTags(record.tags);
    }
  }, [record.tags]);

  const loadDepartments = async () => {
    try {
      const response = await apiClient.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await apiClient.get('/tags');
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleTagClick = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    let newSelectedTags: Tag[];
    
    if (isSelected) {
      newSelectedTags = selectedTags.filter(t => t.id !== tag.id);
    } else {
      newSelectedTags = [...selectedTags, tag];
    }
    
    setSelectedTags(newSelectedTags);
    setRecord({ ...record, tags: newSelectedTags });
  };

  const removeTag = (tagId: string) => {
    const newSelectedTags = selectedTags.filter(t => t.id !== tagId);
    setSelectedTags(newSelectedTags);
    setRecord({ ...record, tags: newSelectedTags });
  };

  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="record-title">Meeting Title</Label>
          <Input
            id="record-title"
            name="title"
            value={record.title || ''}
            onChange={(e) => setRecord({ ...record, title: e.target.value })}
            placeholder="Enter meeting title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="record-date">Date & Time</Label>
          <Input
            id="record-date"
            name="date"
            type="datetime-local"
            value={formatDateForInput(record.date)}
            onChange={(e) => setRecord({ ...record, date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="record-duration">Duration (hours)</Label>
          <Input
            id="record-duration"
            name="duration"
            type="number"
            step="0.5"
            value={record.duration || ''}
            onChange={(e) => setRecord({ ...record, duration: e.target.value })}
            placeholder="e.g., 1.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="record-department">Department</Label>
          <Select 
            value={record.departmentId || ''} 
            onValueChange={(value) => setRecord({ ...record, departmentId: value })}
          >
            <SelectTrigger id="record-department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="record-participants">Participants (one per line)</Label>
          <textarea
            id="record-participants"
            name="participants"
            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={Array.isArray(record.participants) ? record.participants.join('\n') : ''}
            onChange={(e) => {
              const participants = e.target.value.split('\n').filter(p => p.trim() !== '');
              setRecord({ ...record, participants });
            }}
            placeholder="Enter participant names, one per line"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="record-video-link">Video Link</Label>
          <Input
            id="record-video-link"
            name="videoLink"
            type="url"
            value={record.videoLink || ''}
            onChange={(e) => setRecord({ ...record, videoLink: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="record-access-level">Access Level</Label>
          <Select 
            value={record.accessLevel || 'DEPARTMENT'} 
            onValueChange={(value) => setRecord({ ...record, accessLevel: value as any })}
          >
            <SelectTrigger id="record-access-level">
              <SelectValue placeholder="Select access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">Public</SelectItem>
              <SelectItem value="DEPARTMENT">Department</SelectItem>
              <SelectItem value="CONFIDENTIAL">Confidential</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="record-ai-translate"
            name="aiTranslate"
            checked={record.aiTranslate || false}
            onCheckedChange={(checked) => setRecord({ ...record, aiTranslate: checked })}
          />
          <Label htmlFor="record-ai-translate">AI Translate?</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map((tag) => (
              <Badge 
                key={tag.id} 
                variant="default" 
                className="flex items-center gap-1"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeTag(tag.id)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Available Tags */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Available Tags (click to add):</Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.some(t => t.id === tag.id);
              return (
                <Badge
                  key={tag.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ 
                    backgroundColor: isSelected ? tag.color : undefined,
                    borderColor: tag.color 
                  }}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag.name}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="record-remark">Remark</Label>
        <textarea
          id="record-remark"
          name="remark"
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={record.remark || ''}
          onChange={(e) => setRecord({ ...record, remark: e.target.value })}
          placeholder="Additional remarks or notes"
        />
      </div>
    </div>
  );
};

export default BasicInformationForm;
