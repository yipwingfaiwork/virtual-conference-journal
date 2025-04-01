
import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/types";

interface AccessLevelBadgeProps {
  accessLevel: User['accessLevel'];
  showLabel?: boolean;
}

const AccessLevelBadge = ({ accessLevel, showLabel = true }: AccessLevelBadgeProps) => {
  let badgeColor = '';
  let badgeVariant: 'default' | 'secondary' | 'outline' = 'default';
  let label = '';

  switch (accessLevel) {
    case 1:
      badgeColor = 'bg-teal/30 text-teal-foreground border-teal hover:bg-teal/40';
      badgeVariant = 'outline';
      label = 'Level 1';
      break;
    case 2:
      badgeColor = 'bg-gold/30 text-gold-foreground border-gold hover:bg-gold/40';
      badgeVariant = 'outline';
      label = 'Level 2';
      break;
    case 3:
      badgeColor = 'bg-terracotta/30 text-terracotta-foreground border-terracotta hover:bg-terracotta/40';
      badgeVariant = 'outline';
      label = 'Level 3';
      break;
  }

  return (
    <Badge variant={badgeVariant} className={badgeColor}>
      {showLabel ? label : `${accessLevel}`}
    </Badge>
  );
};

export default AccessLevelBadge;
