import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/lib/types";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-100',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 hover:bg-red-100',
        };
      case 'completed':
        return {
          label: 'Completed',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
        };
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          className: '',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
