
import { Badge } from "@/components/ui/badge";

interface AccessLevelBadgeProps {
  isAdmin: boolean;
  showLabel?: boolean;
  className?: string;
}

const AccessLevelBadge = ({ isAdmin, showLabel = true, className }: AccessLevelBadgeProps) => {
  let badgeColor = '';
  let badgeVariant: 'default' | 'secondary' | 'outline' = 'default';
  let label = '';

  if (isAdmin) {
    badgeColor = 'bg-terracotta/30 text-terracotta-foreground border-terracotta hover:bg-terracotta/40';
    badgeVariant = 'outline';
    label = 'Admin';
  } else {
    badgeColor = 'bg-teal/30 text-teal-foreground border-teal hover:bg-teal/40';
    badgeVariant = 'outline';
    label = 'User';
  }

  return (
    <Badge variant={badgeVariant} className={`${badgeColor} ${className || ''}`}>
      {showLabel ? label : (isAdmin ? 'A' : 'U')}
    </Badge>
  );
};

export default AccessLevelBadge;
