import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Activity } from "@/types/activity"
import { FlightDetails } from "@/components/activities/FlightDetails"
import { AccommodationDetails } from "@/components/activities/AccommodationDetails"
import { EventDetails } from "@/components/activities/EventDetails"
import { TransportDetails } from "@/components/activities/TransportDetails"
import { CruiseDetails } from "@/components/activities/CruiseDetails"

interface MobileActivityViewProps {
  activity: Activity
  onBack: () => void
}

export function MobileActivityView({ activity, onBack }: MobileActivityViewProps) {
  function renderActivityDetails() {
    switch (activity.type) {
      case "flight":
        return <FlightDetails flight={activity as any} />
      case "accommodation":
        return <AccommodationDetails accommodation={activity as any} />
      case "event":
        return <EventDetails event={activity as any} />
      case "transport":
        return <TransportDetails transport={activity as any} />
      case "cruise":
        return <CruiseDetails cruise={activity as any} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-4 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">{activity.title}</h2>
        </div>
      </div>
      <div className="p-4">
        {renderActivityDetails()}
      </div>
    </div>
  )
} 