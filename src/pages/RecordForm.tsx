import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, Building, Users, Video, FileText, AlignLeft, Save, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { canUserModifyRecord, getCurrentUser } from '@/lib/auth';
import { ConferenceRecord, User } from '@/lib/types';
import { useRecord, useRecords } from '@/hooks/use-records';

const RecordForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { record: existingRecord, isLoading: recordLoading } = useRecord(id || '');
  const { createRecord, updateRecord } = useRecords();
  
  const mode = id ? 'edit' : 'create';
  
  const [record, setRecord] = useState<Partial<ConferenceRecord>>({
    date: new Date().toISOString().split('T')[0],
    duration: '',
    department: '',
    title: '',
    participants: [],
    videoLink: '',
    textRecord: '',
    outline: '',
  });
  
  const [participantsInput, setParticipantsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const userData = await getCurrentUser();
      
      if (!userData) {
        navigate('/login');
        return;
      }
      
      setUser(userData);
      setLoading(false);
    };
    
    loadData();
  }, [navigate]);
  
  useEffect(() => {
    if (mode === 'edit' && existingRecord && !recordLoading) {
      if (user && !canUserModifyRecord(user, existingRecord.createdBy)) {
        toast({
          title: "Permission denied",
          description: "You don't have permission to edit this record.",
          variant: "destructive",
        });
        navigate('/records');
        return;
      }
      
      setRecord(existingRecord);
      setParticipantsInput(existingRecord.participants.join(', '));
    }
  }, [existingRecord, mode, navigate, recordLoading, toast, user]);
  
  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (mode === 'edit' && recordLoading) {
    return <div className="flex justify-center items-center h-screen">Loading record...</div>;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecord(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setRecord(prev => ({ ...prev, [name]: value }));
  };
  
  const handleParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParticipantsInput(e.target.value);
    const participants = e.target.value
      .split(',')
      .map(p => p.trim())
      .filter(p => p);
    
    setRecord(prev => ({ ...prev, participants }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!record.title || !record.date || !record.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        createRecord({
          ...record,
          createdBy: user.id
        });
      } else if (mode === 'edit' && id) {
        updateRecord({
          id,
          data: record
        });
      }
      
      const successMessage = mode === 'create'
        ? "Conference record created successfully"
        : "Conference record updated successfully";
      
      toast({
        title: "Success",
        description: successMessage,
      });
      
      navigate('/records');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0 mb-2"
          onClick={() => navigate('/records')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Records
        </Button>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-terracotta">
          {mode === 'create' ? 'Create New Conference Record' : 'Edit Conference Record'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    name="date"
                    type="date"
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
            </CardContent>
          </Card>
          
          <div className="space-y-6">
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
                    value={record.outline}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
            
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
                    value={record.textRecord}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => navigate('/records')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-terracotta hover:bg-terracotta/90"
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Record' : 'Update Record'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RecordForm;
