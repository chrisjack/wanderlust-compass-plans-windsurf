import { TripComponentBadgesProps } from "@/types/trips";
import { Plane, Building2, Ticket, Car, Ship } from "lucide-react";

export function TripComponentBadges({
  flights,
  accommodation,
  events,
  transports,
  cruises,
}: TripComponentBadgesProps) {
  // Debug log to see what is being passed in
  console.log('TripComponentBadges props:', { flights, accommodation, events, transports, cruises });

  const components = [
    { count: flights?.count, icon: Plane, color: "text-blue-500 bg-blue-50" },
    { count: accommodation?.count, icon: Building2, color: "text-purple-500 bg-purple-50" },
    { count: events?.count, icon: Ticket, color: "text-green-500 bg-green-50" },
    { count: transports?.count, icon: Car, color: "text-orange-500 bg-orange-50" },
    { count: cruises?.count, icon: Ship, color: "text-sky-500 bg-sky-50" },
  ].filter(component => component.count > 0);

  if (components.length === 0) return null;

  return (
    <div className="flex gap-2">
      {components.map((component, index) => {
        const Icon = component.icon;
        return (
          <div
            key={index}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${component.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{component.count}</span>
          </div>
        );
      })}
    </div>
  );
}
