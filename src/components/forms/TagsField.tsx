
import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { ConferenceRecord, Tag } from '@/lib/types';
import apiClient from '@/services/api-service';

interface TagsFieldProps {
  record: Partial<ConferenceRecord>;
  setRecord: (record: Partial<ConferenceRecord>) => void;
}

const TagsField = ({ record, setRecord }: TagsFieldProps) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (record.tags && Array.isArray(record.tags)) {
      console.log('TagsField updating selected tags:', record.tags);
      setSelectedTags(record.tags);
    } else {
      console.log('TagsField: no tags or not array:', record.tags);
      setSelectedTags([]);
    }
  }, [record.tags]);

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

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      
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
  );
};

export default TagsField;
