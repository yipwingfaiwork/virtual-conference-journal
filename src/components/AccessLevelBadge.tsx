
import { Badge } from "@/components/ui/badge";

interface AccessLevelBadgeProps {
  isAdmin: boolean;
  isManager?: boolean;
  showLabel?: boolean;
  className?: string;
}

const AccessLevelBadge = ({ isAdmin, isManager = false, showLabel = true, className }: AccessLevelBadgeProps) => {
  let badgeColor = '';
  let badgeVariant: 'default' | 'secondary' | 'outline' = 'default';
  let label = '';

  if (isAdmin) {
    badgeColor = 'bg-purple/30 text-purple-foreground border-purple hover:bg-purple/40';
    badgeVariant = 'outline';
    label = 'Administrator';
  } else if (isManager) {
    badgeColor = 'bg-blue/30 text-blue-foreground border-blue hover:bg-blue/40';
    badgeVariant = 'outline';
    label = 'Manager';
  } else {
    badgeColor = 'bg-teal/30 text-teal-foreground border-teal hover:bg-teal/40';
    badgeVariant = 'outline';
    label = 'User';
  }

  return (
    <Badge variant={badgeVariant} className={`${badgeColor} ${className || ''}`}>
      {showLabel ? label : (isAdmin ? 'A' : isManager ? 'M' : 'U')}
    </Badge>
  );
};

export default AccessLevelBadge;
