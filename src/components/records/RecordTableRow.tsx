
import { Calendar, Clock, User, FileText, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConferenceRecord } from '@/lib/types';
import { Button } from "@/components/ui/button";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface RecordTableRowProps {
  record: ConferenceRecord;
  getCreatorName: (userId: string) => string;
}

const RecordTableRow = ({ record, getCreatorName }: RecordTableRowProps) => {
  const navigate = useNavigate();

  return (
    <TableRow key={record.id}>
      <TableCell className="font-medium">
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          {new Date(record.date).toLocaleDateString()}
        </div>
      </TableCell>
      <TableCell>{record.title}</TableCell>
      <TableCell className="hidden md:table-cell">{record.department}</TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          {getCreatorName(record.createdBy)}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          {record.duration}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/records/${record.id}`)}
          >
            View
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="hidden sm:flex"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle className="text-terracotta">{record.title}</DialogTitle>
                <DialogDescription>
                  {record.department} • {new Date(record.date).toLocaleDateString()} • {record.duration}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Participants</h3>
                  <p className="text-sm">{record.participants.join(', ')}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-1">Meeting Outline</h3>
                  <p className="text-sm whitespace-pre-line">{record.outline}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-1">Text Record Preview</h3>
                  <p className="text-sm line-clamp-4">{record.textRecord}</p>
                </div>
                {record.remark && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-1">Remarks</h3>
                      <p className="text-sm">{record.remark}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate(`/records/${record.id}`)}>
                  View Full Record
                </Button>
                {record.videoLink && (
                  <Button variant="outline" className="gap-2" asChild>
                    <a href={record.videoLink} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4" />
                      Video
                    </a>
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RecordTableRow;
