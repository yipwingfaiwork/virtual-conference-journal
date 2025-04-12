
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ConferenceRecord } from '@/lib/types';
import { Badge } from "@/components/ui/badge";

interface DepartmentStatsProps {
  isLoading: boolean;
  error: unknown;
  records: ConferenceRecord[] | undefined;
}

const DashboardDepartmentStats = ({ isLoading, error, records }: DepartmentStatsProps) => {
  // Get department stats
  const departmentStats = records 
    ? ['Operations', 'Finance', 'Management', 'Administration'].map(dept => ({
        name: dept,
        count: records.filter(record => record.department === dept).length
      }))
    : [];
    
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Department Stats</CardTitle>
        <CardDescription>Records by department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-muted-foreground">Loading stats...</p>
          ) : error ? (
            <p className="text-destructive">Error loading stats</p>
          ) : (
            departmentStats.map(dept => (
              <div key={dept.name} className="flex justify-between items-center">
                <span>{dept.name}</span>
                <Badge variant="success">
                  {dept.count} records
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardDepartmentStats;
