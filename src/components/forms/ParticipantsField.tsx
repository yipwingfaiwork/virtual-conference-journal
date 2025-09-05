import { useState, useEffect, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Users } from 'lucide-react';
import { ConferenceRecord } from '@/lib/types';
import apiClient from '@/services/api-service';
import { useToast } from '@/hooks/use-toast';

interface ParticipantsFieldProps {
  record: Partial<ConferenceRecord>;
  setRecord: (record: Partial<ConferenceRecord>) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  departmentName: string;
}

const ParticipantsField = ({ record, setRecord }: ParticipantsFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const participants = Array.isArray(record.participants) ? record.participants : [];

  useEffect(() => {
    if (inputValue.trim().length > 1) {
      searchUsers(inputValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const searchUsers = async (searchTerm: string) => {
    try {
      const response = await apiClient.get('/users');
      const filteredUsers = response.data.filter((user: User) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filteredUsers);
      setShowSuggestions(filteredUsers.length > 0);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    }
  };

  const addParticipant = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName && !participants.includes(trimmedName)) {
      const newParticipants = [...participants, trimmedName];
      setRecord({ ...record, participants: newParticipants });
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeParticipant = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    setRecord({ ...record, participants: newParticipants });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addParticipant(inputValue);
      }
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(participants[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const newParticipants = [...participants];
      newParticipants[editingIndex] = editingValue.trim();
      setRecord({ ...record, participants: newParticipants });
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
        <Label htmlFor="record-participants">Participants</Label>
      </div>
      
      <div className="relative">
        <Input
          ref={inputRef}
          id="record-participants"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type participant name and press comma or enter..."
          className="pr-4"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((user) => (
              <div
                key={user.id}
                className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                onClick={() => addParticipant(user.name)}
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.departmentName}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {participants.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {participants.map((participant, index) => (
            <div key={index} className="relative">
              {editingIndex === index ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveEdit();
                      } else if (e.key === 'Escape') {
                        cancelEdit();
                      }
                    }}
                    className="h-8 text-sm w-32"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      saveEdit();
                    }}
                    className="h-6 w-6 p-0"
                  >
                    ✓
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      cancelEdit();
                    }}
                    className="h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 pl-3 pr-1 text-sm group"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    startEditing(index);
                  }}
                  title="Double-click to edit"
                >
                  <span className="mr-2">{participant}</span>
                  <X
                    className="h-3 w-3 hover:text-destructive cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeParticipant(index);
                    }}
                  />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Type names and press comma/enter to add. Double-click names to edit.
      </p>
    </div>
  );
};

export default ParticipantsField;