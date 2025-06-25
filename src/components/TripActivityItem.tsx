
import { Plane, Hotel, CalendarDays, Bus, Ship, Clock, ArrowRight, LogIn, LogOut } from "lucide-react"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

type ActivityType = "flight" | "accommodation" | "event" | "transport" | "cruise"

interface ActivityItemProps {
  id: string
  type: ActivityType
  title: string
  subtitle?: string
  time?: string
  date: Date
  location?: string
  
  // Added specific fields for each activity type
  // Flight specific fields
  flight_airline?: string
  flight_number?: string
  flight_departure_city?: string
  flight_arrival_city?: string
  flight_departure_airport_code?: string
  flight_arrival_airport_code?: string
  flight_departure_terminal?: string
  flight_departure_gate?: string
  flight_departure_boarding_time?: string

  // Accommodation specific fields
  accommodation_name?: string
  accommodation_address?: string
  accommodation_nights_stay?: number
  accommodation_checkin_time?: string
  accommodation_checkout_time?: string
  isCheckout?: boolean

  // Event specific fields
  description?: string
  start_time?: string

  // Transport specific fields
  provider?: string
  pickup_location?: string
  dropoff_location?: string

  // Cruise specific fields
  cruise_line?: string
  cruise_ship_name?: string
  cruise_description?: string
  cruise_departure_port?: string
  cruise_arrival_port?: string
  cruise_boarding_time?: string
  cruise_start_date?: string
  cruise_end_date?: string
  isArrival?: boolean
}

const getIcon = (type: ActivityType) => {
  switch (type) {
    case "flight":
      return <Plane className="h-4 w-4 text-blue-500" />
    case "accommodation":
      return <Hotel className="h-4 w-4 text-purple-500" />
    case "event":
      return <CalendarDays className="h-4 w-4 text-green-500" />
    case "transport":
      return <Bus className="h-4 w-4 text-orange-500" />
    case "cruise":
      return <Ship className="h-4 w-4 text-cyan-500" />
  }
}

export function TripActivityItem(props: ActivityItemProps) {
  const {
    type,
    title,
    location,
    flight_airline,
    flight_number,
    flight_departure_city,
    flight_arrival_city,
    flight_departure_airport_code,
    flight_arrival_airport_code,
    flight_departure_terminal,
    flight_departure_gate,
    flight_departure_boarding_time,
    accommodation_address,
    accommodation_nights_stay,
    accommodation_checkin_time,
    accommodation_checkout_time,
    isCheckout,
    description,
    start_time,
    provider,
    pickup_location,
    dropoff_location,
    cruise_line,
    cruise_ship_name,
    cruise_description,
    cruise_departure_port,
    cruise_arrival_port,
    cruise_boarding_time,
    cruise_start_date,
    cruise_end_date,
    isArrival
  } = props;

  const renderContent = () => {
    switch (type) {
      case "flight":
        return (
          <>
            <div className="font-medium text-sm">{flight_airline} {flight_number}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <span>{flight_departure_city} ({flight_departure_airport_code})</span>
              <ArrowRight className="h-3 w-3" />
              <span>{flight_arrival_city} ({flight_arrival_airport_code})</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {props.time} 
              {flight_departure_terminal && ` · Terminal ${flight_departure_terminal}`}
              {flight_departure_gate && ` · Gate ${flight_departure_gate}`}
            </div>
            {flight_departure_boarding_time && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  <Clock className="h-3 w-3 mr-1" /> Board: {flight_departure_boarding_time}
                </Badge>
              </div>
            )}
          </>
        );
      
      case "accommodation":
        return (
          <>
            <div className="font-medium text-sm flex items-center gap-2">
              {title}
              {isCheckout ? 
                <Badge variant="outline" className="border-orange-500 text-orange-600">
                  <LogOut className="h-3 w-3 mr-1" /> Check-out
                </Badge> : 
                <Badge variant="outline" className="border-green-500 text-green-600">
                  <LogIn className="h-3 w-3 mr-1" /> Check-in
                </Badge>
              }
            </div>
            {accommodation_address && (
              <div className="text-sm text-muted-foreground mt-1">{accommodation_address}</div>
            )}
            {accommodation_nights_stay && !isCheckout && (
              <div className="text-xs text-muted-foreground mt-1">
                {accommodation_nights_stay} night{accommodation_nights_stay !== 1 ? 's' : ''} stay
              </div>
            )}
            {(accommodation_checkin_time && !isCheckout) && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  <Clock className="h-3 w-3 mr-1" /> Check-in: {accommodation_checkin_time}
                </Badge>
              </div>
            )}
            {(accommodation_checkout_time && isCheckout) && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  <Clock className="h-3 w-3 mr-1" /> Check-out: {accommodation_checkout_time}
                </Badge>
              </div>
            )}
          </>
        );
      
      case "event":
        return (
          <>
            <div className="font-medium text-sm">{title}</div>
            {location && (
              <div className="text-sm text-muted-foreground mt-1">{location}</div>
            )}
            {description && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</div>
            )}
            {start_time && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                  <Clock className="h-3 w-3 mr-1" /> {start_time}
                </Badge>
              </div>
            )}
          </>
        );
      
      case "transport":
        return (
          <>
            <div className="font-medium text-sm">
              {title} {provider && `- ${provider}`}
            </div>
            {description && (
              <div className="text-xs text-muted-foreground mt-1">{description}</div>
            )}
            {(pickup_location && dropoff_location) && (
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <span>{pickup_location}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{dropoff_location}</span>
              </div>
            )}
            {start_time && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  <Clock className="h-3 w-3 mr-1" /> {start_time}
                </Badge>
              </div>
            )}
          </>
        );
      
      case "cruise":
        return (
          <>
            <div className="font-medium text-sm flex items-center gap-2">
              {cruise_line && cruise_ship_name ? 
                `${title} - ${cruise_line} - ${cruise_ship_name}` : 
                title
              }
              {isArrival ? 
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  <LogIn className="h-3 w-3 mr-1" /> Arrival
                </Badge> : 
                <Badge variant="outline" className="border-green-500 text-green-600">
                  <LogOut className="h-3 w-3 mr-1" /> Departure
                </Badge>
              }
            </div>
            {cruise_description && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{cruise_description}</div>
            )}
            {(cruise_departure_port && cruise_arrival_port) && (
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <span>{cruise_departure_port}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{cruise_arrival_port}</span>
              </div>
            )}
            {(cruise_start_date && cruise_end_date) && (
              <div className="text-xs text-muted-foreground mt-1">
                {cruise_start_date} to {cruise_end_date}
              </div>
            )}
            {cruise_boarding_time && !isArrival && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200">
                  <Clock className="h-3 w-3 mr-1" /> Board: {cruise_boarding_time}
                </Badge>
              </div>
            )}
          </>
        );

      default:
        return (
          <>
            <h3 className="font-medium text-sm">{title}</h3>
            {props.subtitle && <p className="text-sm text-muted-foreground">{props.subtitle}</p>}
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {props.time && <span>{props.time}</span>}
              {location && <span>{location}</span>}
            </div>
          </>
        );
    }
  };

  return (
    <div className={cn(
      "flex items-start gap-4 p-4 rounded-lg border bg-card relative",
      (isCheckout || isArrival) && "border-dashed"
    )}>
      <div className="flex-shrink-0">
        {getIcon(type)}
      </div>
      <div className="flex-1 min-w-0">
        {renderContent()}
      </div>
    </div>
  )
}
