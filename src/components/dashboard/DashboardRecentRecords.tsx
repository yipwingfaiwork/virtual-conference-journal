
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConferenceRecord } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardRecentRecordsProps {
  records: ConferenceRecord[] | undefined;
  isLoading: boolean;
  error: unknown;
}

const DashboardRecentRecords = ({ records, isLoading, error }: DashboardRecentRecordsProps) => {
  const navigate = useNavigate();
  
  // Sort and slice to get recent records once data is loaded
  const recentRecords = records 
    ? [...records]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    : [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Conference Records</CardTitle>
        <CardDescription>The latest conference records in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-8">Error loading records</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRecords && recentRecords.length > 0 ? (
                recentRecords.map((record) => (
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
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {record.duration}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/records/${record.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/records')}
        >
          View All Records
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DashboardRecentRecords;
