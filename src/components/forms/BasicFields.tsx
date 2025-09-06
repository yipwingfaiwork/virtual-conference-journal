
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ConferenceRecord } from '@/lib/types';

interface BasicFieldsProps {
  record: Partial<ConferenceRecord>;
  setRecord: (record: Partial<ConferenceRecord>) => void;
  departments: Array<{ id: string; name: string }>;
}

const BasicFields = ({ record, setRecord, departments }: BasicFieldsProps) => {
  console.log('=== BASIC FIELDS DEBUG ===');
  console.log('Record in BasicFields:', record);
  console.log('Departments:', departments);
  console.log('Department ID:', record.departmentId);
  console.log('=== END BASIC FIELDS DEBUG ===');
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const formatted = date.toISOString().slice(0, 16);
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  console.log('BasicFields render - record:', {
    title: record.title,
    date: record.date,
    duration: record.duration,
    departmentId: record.departmentId,
    videoLink: record.videoLink,
    accessLevel: record.accessLevel,
    aiTranslate: record.aiTranslate
  });

  return (
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
          value={record.departmentId ? String(record.departmentId) : ''} 
          onValueChange={(value) => {
            console.log('Department selected:', value);
            setRecord({ ...record, departmentId: value });
          }}
        >
          <SelectTrigger id="record-department">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={String(dept.id)}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="record-ai-translate"
            name="aiTranslate"
            checked={record.aiTranslate === true}
            onCheckedChange={(checked) => setRecord({ ...record, aiTranslate: checked })}
          />
          <Label htmlFor="record-ai-translate">AI Translate?</Label>
        </div>
      </div>
    </div>
  );
};

export default BasicFields;
