
import { Plane, Bed, CalendarDays, Ship, Bus } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface TripComponentConfig {
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
}

export const tripComponentIcons: Record<string, TripComponentConfig> = {
  flights: {
    icon: Plane,
    bgColor: "bg-blue-100",
    textColor: "text-blue-800"
  },
  accommodation: {
    icon: Bed,
    bgColor: "bg-purple-100",
    textColor: "text-purple-800"
  },
  events: {
    icon: CalendarDays,
    bgColor: "bg-green-100",
    textColor: "text-green-800"
  },
  cruises: {
    icon: Ship,
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-800"
  },
  transports: {
    icon: Bus,
    bgColor: "bg-orange-100",
    textColor: "text-orange-800"
  }
};
