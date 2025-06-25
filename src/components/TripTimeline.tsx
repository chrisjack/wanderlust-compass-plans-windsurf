import React, { useState } from "react"
import { format, addDays } from "date-fns"
import { TripActivityItem } from "@/components/TripActivityItem"
import { FlightDetails } from "@/components/activities/FlightDetails"
import { AccommodationDetails } from "@/components/activities/AccommodationDetails"
import { EventDetails } from "@/components/activities/EventDetails"
import { TransportDetails } from "@/components/activities/TransportDetails"
import { CruiseDetails } from "@/components/activities/CruiseDetails"
import { ActivitySideDrawer } from "@/components/ActivitySideDrawer"
import { MobileActivityView } from "@/components/activities/MobileActivityView"
import { 
  ActivityType, 
  Activity 
} from "@/types/activity"

interface TripTimelineProps {
  activities: Activity[]
  tripId: string
  onActivityAdded: () => void
  onActivityUpdated: () => void
}

export function TripTimeline({ 
  activities, 
  tripId, 
  onActivityAdded, 
  onActivityUpdated 
}: TripTimelineProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [activityTypeToAdd, setActivityTypeToAdd] = useState<ActivityType | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  
  // Process activities to include checkout and arrival cards
  const processedActivities = React.useMemo(() => {
    const result: Activity[] = [...activities];
    
    // Add checkout cards for accommodations
    const accommodations = activities.filter(a => a.type === "accommodation" && a.accommodation_departure_date);
    accommodations.forEach(acc => {
      if (acc.accommodation_departure_date) {
        const checkoutDate = new Date(acc.accommodation_departure_date);
        result.push({
          ...acc,
          id: `${acc.id}-checkout`,
          title: acc.title,
          date: checkoutDate,
          isCheckout: true
        });
      }
    });
    
    // Add arrival cards for cruises
    const cruises = activities.filter(c => c.type === "cruise" && c.cruise_end_date);
    cruises.forEach(cruise => {
      if (cruise.cruise_end_date) {
        const arrivalDate = new Date(cruise.cruise_end_date);
        result.push({
          ...cruise,
          id: `${cruise.id}-arrival`,
          title: cruise.title,
          date: arrivalDate,
          isArrival: true
        });
      }
    });
    
    return result;
  }, [activities]);

  const groupedActivities = processedActivities.reduce((groups, activity) => {
    const date = format(activity.date, 'MMM dd, yyyy')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {} as Record<string, typeof activities>)

  function handleActivityClick(activity: Activity) {
    // For derived activities (checkout/arrival) find the original activity and select it
    if (activity.id.includes('-checkout') || activity.id.includes('-arrival')) {
      const originalId = activity.id.split('-')[0];
      const originalActivity = activities.find(a => a.id === originalId);
      
      if (originalActivity) {
        setSelectedActivity(originalActivity);
        setIsEditDrawerOpen(true); // Open the edit drawer automatically
        return; // Add return to ensure we exit the function here
      }
    }
    
    if (selectedActivity?.id === activity.id) {
      setSelectedActivity(null);
      setIsMobileView(false);
    } else {
      setSelectedActivity(activity);
      // Check if we're on mobile
      if (window.innerWidth < 768) {
        setIsMobileView(true);
      }
    }
  }

  function renderActivityDetails(activity: Activity) {
    if (!activity) return null;

    switch (activity.type) {
      case "flight":
        return <FlightDetails flight={{
          id: activity.id,
          flight_airline: activity.flight_airline || '',
          flight_number: activity.flight_number || '',
          flight_departure_city: activity.flight_departure_city || '',
          flight_arrival_city: activity.flight_arrival_city || '',
          flight_departure_date: activity.flight_departure_date || '',
          flight_departure_time: activity.flight_departure_time || null,
          flight_arrival_date: activity.flight_arrival_date || '',
          flight_arrival_time: activity.flight_arrival_time || null,
          flight_departure_terminal: activity.flight_departure_terminal,
          flight_arrival_terminal: activity.flight_arrival_terminal,
          flight_departure_gate: activity.flight_departure_gate,
          flight_departure_airport_code: activity.flight_departure_airport_code,
          flight_arrival_airport_code: activity.flight_arrival_airport_code,
          flight_confirmation_number: activity.flight_confirmation_number,
          flight_time: activity.flight_time,
          flight_notes: activity.flight_notes,
          flight_documents: activity.flight_documents,
          flight_departure_boarding_time: activity.flight_departure_boarding_time,
          trip_id: activity.trip_id,
          flight_aerodata_subscription_id: activity.flight_aerodata_subscription_id,
          flight_aerodata_status: activity.flight_aerodata_status,
          flight_aerodata_last_checked: activity.flight_aerodata_last_checked
        }} />
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

  function handleActivitySaved() {
    if (isAddDrawerOpen) {
      setIsAddDrawerOpen(false)
      setActivityTypeToAdd(null)
      onActivityAdded()
    } else {
      setIsEditDrawerOpen(false)
      onActivityUpdated()
    }
  }

  function handleCloseDrawer() {
    setIsAddDrawerOpen(false)
    setActivityTypeToAdd(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Trip Timeline</h2>
      </div>

      <div className="flex gap-6">
        <div className={`space-y-8 ${selectedActivity && !isMobileView ? 'w-2/5' : 'w-full'}`}>
          {Object.entries(groupedActivities).map(([date, activities]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-4">{date}</h2>
              <div className="space-y-4">
                {activities
                  .sort((a, b) => {
                    // Sort by time if both have times
                    if (a.time && b.time) {
                      return a.time.localeCompare(b.time);
                    }
                    // Put check-ins and departures before check-outs and arrivals
                    if (a.isCheckout && !b.isCheckout) return 1;
                    if (!a.isCheckout && b.isCheckout) return -1;
                    if (a.isArrival && !b.isArrival) return 1;
                    if (!a.isArrival && b.isArrival) return -1;
                    return 0;
                  })
                  .map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className={`cursor-pointer transition-colors ${
                        selectedActivity?.id === activity.id || 
                        (selectedActivity && activity.id.startsWith(selectedActivity.id))
                          ? 'ring-2 ring-primary' 
                          : ''
                      }`}
                    >
                      <TripActivityItem {...activity} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        
        {selectedActivity && !isMobileView && (
          <div className="w-3/5">
            {renderActivityDetails(selectedActivity)}
          </div>
        )}
      </div>

      {isMobileView && selectedActivity && (
        <MobileActivityView 
          activity={selectedActivity}
          onBack={() => {
            setSelectedActivity(null);
            setIsMobileView(false);
          }}
        />
      )}

      {isAddDrawerOpen && activityTypeToAdd && (
        <ActivitySideDrawer 
          isOpen={isAddDrawerOpen} 
          onClose={handleCloseDrawer}
          onSave={handleActivitySaved}
          activityType={activityTypeToAdd}
          tripId={tripId}
          activity={null}
          mode="add"
        />
      )}

      {isEditDrawerOpen && selectedActivity && (
        <ActivitySideDrawer 
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          onSave={handleActivitySaved}
          activityType={selectedActivity.type}
          tripId={tripId}
          activity={selectedActivity}
          mode="edit"
        />
      )}
    </div>
  )
}
