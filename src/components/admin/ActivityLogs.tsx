import { useEffect, useState } from 'react';
import { Calendar, User, Activity, FileText, Eye, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from "@/components/ui/table";
import { ActivityLogsAPI, badgeVariants } from '@/services/api-service';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  recordId: string | null;
  timestamp: string;
}

const ActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetchActivityLogs();
  }, [limit]);

  const fetchActivityLogs = async () => {
    try {
      setIsLoading(true);
      const data = await ActivityLogsAPI.getAll({ limit });
      setLogs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const sortedLogs = [...logs].sort((a: any, b: any) => {
    if (sortField === 'timestamp') {
      return sortDirection === 'asc'
        ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
        : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
    } else {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
  });

  const getActionBadgeVariant = (action: string) => {
    switch (true) {
      case action.includes('CREATE'):
        return badgeVariants.success;
      case action.includes('UPDATE'):
        return badgeVariants.warning;
      case action.includes('DELETE'):
        return badgeVariants.destructive;
      case action.includes('VIEW'):
        return badgeVariants.secondary;
      case action.includes('LOGIN'):
      case action.includes('LOGOUT'):
        return badgeVariants.default;
      default:
        return badgeVariants.outline;
    }
  };

  const loadMore = () => {
    setLimit(prev => prev + 50);
  };

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading activity logs...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
        <CardDescription>
          User activity history across the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] cursor-pointer" onClick={() => handleSort('timestamp')}>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Timestamp
                    {renderSortIcon('timestamp')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('userName')}>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    User
                    {renderSortIcon('userName')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('action')}>
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Action
                    {renderSortIcon('action')}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Details
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLogs.length > 0 ? (
                sortedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{log.userName || 'Unknown User'}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {log.recordId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 mr-2"
                            asChild
                          >
                            <a href={`/records/${log.recordId}`}>
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {log.details}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No activity logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {logs.length >= limit && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLogs;
