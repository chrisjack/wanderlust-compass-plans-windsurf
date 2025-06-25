
import { Badge } from "@/components/ui/badge";
import { TripStatusBadgeProps } from "@/types/trips";

export function TripStatusBadge({ status }: TripStatusBadgeProps) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Active</Badge>;
    case 'draft':
      return <Badge variant="outline" className="text-gray-500">Draft</Badge>;
    case 'completed':
      return <Badge variant="secondary">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
