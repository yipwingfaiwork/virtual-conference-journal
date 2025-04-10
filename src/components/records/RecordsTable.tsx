
import { Video } from 'lucide-react';
import { ConferenceRecord } from '@/lib/types';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RecordTableRow from './RecordTableRow';

interface RecordsTableProps {
  records: ConferenceRecord[];
  isLoading: boolean;
  error: any;
  getCreatorName: (userId: string) => string;
}

const RecordsTable = ({ 
  records, 
  isLoading, 
  error, 
  getCreatorName 
}: RecordsTableProps) => {
  if (isLoading) {
    return <div className="text-center p-8">Loading records...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-destructive">Error loading records</div>;
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Department</TableHead>
            <TableHead className="hidden sm:table-cell">Created By</TableHead>
            <TableHead className="hidden lg:table-cell">Duration</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length > 0 ? (
            records.map((record) => (
              <RecordTableRow
                key={record.id}
                record={record}
                getCreatorName={getCreatorName}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordsTable;
