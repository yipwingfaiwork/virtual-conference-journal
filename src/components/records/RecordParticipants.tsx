
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecordParticipantsProps {
  participants: string[];
}

const RecordParticipants = ({ participants }: RecordParticipantsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {participants.map((participant, index) => (
            <Badge key={index} variant="secondary">
              {participant}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordParticipants;
