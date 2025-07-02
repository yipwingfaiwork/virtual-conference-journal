
import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConferenceRecord } from '@/lib/types';

interface ParticipantsFieldProps {
  record: Partial<ConferenceRecord>;
  setRecord: (record: Partial<ConferenceRecord>) => void;
}

const ParticipantsField = ({ record, setRecord }: ParticipantsFieldProps) => {
  const [participantsText, setParticipantsText] = useState('');

  useEffect(() => {
    if (record.participants && Array.isArray(record.participants)) {
      const newText = record.participants.join('\n');
      console.log('ParticipantsField updating text:', newText);
      setParticipantsText(newText);
    } else {
      console.log('ParticipantsField: no participants or not array:', record.participants);
      setParticipantsText('');
    }
  }, [record.participants]);

  const handleParticipantsTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setParticipantsText(text);
    const participants = text.split('\n').map(p => p.trim()).filter(p => p !== '');
    setRecord({ ...record, participants });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="record-participants">Participants (one per line)</Label>
      <Textarea
        id="record-participants"
        name="participants"
        value={participantsText}
        onChange={handleParticipantsTextChange}
        placeholder="Enter participant names, one per line"
        className="min-h-[80px]"
      />
    </div>
  );
};

export default ParticipantsField;
