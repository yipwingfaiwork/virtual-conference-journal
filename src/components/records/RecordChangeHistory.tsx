
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecordChange } from '@/lib/types';
import { History, User, Edit, Plus, Trash } from 'lucide-react';

interface RecordChangeHistoryProps {
  changes: RecordChange[];
}

const RecordChangeHistory = ({ changes }: RecordChangeHistoryProps) => {
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'CREATE':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'DELETE':
        return <Trash className="h-4 w-4 text-red-600" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getChangeVariant = (changeType: string) => {
    switch (changeType) {
      case 'CREATE':
        return 'success' as const;
      case 'UPDATE':
        return 'default' as const;
      case 'DELETE':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <History className="h-5 w-5" />
          Change History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {changes.length > 0 ? (
          <div className="space-y-4">
            {changes.map((change) => (
              <div key={change.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getChangeIcon(change.changeType)}
                    <Badge variant={getChangeVariant(change.changeType)}>
                      {change.changeType}
                    </Badge>
                    {change.fieldChanged && (
                      <span className="text-sm text-muted-foreground">
                        {change.fieldChanged}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(change.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3" />
                    <span className="font-medium">{change.changedByName}</span>
                  </div>
                  
                  {change.changeDescription && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {change.changeDescription}
                    </p>
                  )}
                  
                  {change.oldValue && change.newValue && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs">
                        <span className="text-red-600">- {change.oldValue}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-green-600">+ {change.newValue}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No changes recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecordChangeHistory;
