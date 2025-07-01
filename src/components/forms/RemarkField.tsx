
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConferenceRecord } from '@/lib/types';

interface RemarkFieldProps {
  record: Partial<ConferenceRecord>;
  setRecord: (record: Partial<ConferenceRecord>) => void;
}

const RemarkField = ({ record, setRecord }: RemarkFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="record-remark">Remark</Label>
      <Textarea
        id="record-remark"
        name="remark"
        className="min-h-[80px]"
        value={record.remark || ''}
        onChange={(e) => setRecord({ ...record, remark: e.target.value })}
        placeholder="Additional remarks or notes"
      />
    </div>
  );
};

export default RemarkField;
