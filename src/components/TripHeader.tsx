import { format } from "date-fns"
import { MoreHorizontal, MessageSquare, Plus, Download, Share2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"
import { ActivityType } from "@/types/activity"
import { TripForm } from "@/components/TripForm"
import { ActivitySideDrawer } from "@/components/ActivitySideDrawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TripComponentBadges } from "@/components/trips/TripComponentBadges"
import { useNavigate } from "react-router-dom"

interface TripHeaderProps {
  trip: {
    trip_image_url?: string
    trip_name: string
    trip_destination?: string
    trip_start_date?: string
    trip_end_date?: string
    trip_organisation?: string
    trip_status?: string
    trip_description?: string
    trip_notes?: string
    id: string
  }
  flightsCount: number
  accommodationsCount: number
  eventsCount: number
  transportsCount: number
  cruisesCount: number
}

export function TripHeader({ trip, flightsCount, accommodationsCount, eventsCount, transportsCount, cruisesCount }: TripHeaderProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false)
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | null>(null)
  const navigate = useNavigate()

  const handleActivityTypeSelect = (type: ActivityType) => {
    setSelectedActivityType(type)
  }

  const handleDownload = () => {
    // TODO: Implement PDF download functionality
    console.log("Downloading trip itinerary")
  }

  const handleShare = () => {
    setIsShareDrawerOpen(true)
  }

  const handleChatClick = () => {
    navigate(`/messages?trip=${trip.id}`)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {trip.trip_image_url && (
        <div className="w-full h-64 bg-muted mb-6">
          <img 
            src={trip.trip_image_url} 
            alt={trip.trip_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1 w-full">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-semibold">{trip.trip_name}</h1>
              <div className="flex items-center gap-2 md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleActivityTypeSelect('flight')}>
                      Flight
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActivityTypeSelect('accommodation')}>
                      Accommodation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActivityTypeSelect('event')}>
                      Event
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActivityTypeSelect('transport')}>
                      Transport
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActivityTypeSelect('cruise')}>
                      Cruise
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleChatClick}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Itinerary
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Trip
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-muted-foreground">
              <span>{trip.trip_destination}</span>
              <span className="hidden md:inline">•</span>
              <span>
                {trip.trip_start_date && format(new Date(trip.trip_start_date), 'MMM dd, yyyy')}
                {trip.trip_end_date && ` to ${format(new Date(trip.trip_end_date), 'MMM dd, yyyy')}`}
              </span>
              <span className="hidden md:inline">•</span>
              <span>{trip.trip_organisation}</span>
            </div>
            <Badge variant="secondary" className="mt-2">
              {trip.trip_status}
            </Badge>
            <div className="mt-4">
              <TripComponentBadges
                flights={{ count: flightsCount }}
                accommodation={{ count: accommodationsCount }}
                events={{ count: eventsCount }}
                transports={{ count: transportsCount }}
                cruises={{ count: cruisesCount }}
              />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleActivityTypeSelect('flight')}>
                  Flight
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleActivityTypeSelect('accommodation')}>
                  Accommodation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleActivityTypeSelect('event')}>
                  Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleActivityTypeSelect('transport')}>
                  Transport
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleActivityTypeSelect('cruise')}>
                  Cruise
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" onClick={() => setIsEditDrawerOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <Button variant="outline" onClick={handleChatClick}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Itinerary
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Trip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      <Sheet open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-hidden">
          <SheetHeader>
            <SheetTitle>Edit Trip</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="mt-6">
              <TripForm
                initialData={trip}
                onSubmit={(data) => {
                  console.log('Updated trip:', data)
                  setIsEditDrawerOpen(false)
                }}
                onCancel={() => setIsEditDrawerOpen(false)}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {selectedActivityType && (
        <ActivitySideDrawer
          isOpen={!!selectedActivityType}
          onClose={() => setSelectedActivityType(null)}
          activityType={selectedActivityType}
          tripId={trip.id}
          mode="add"
          activity={null}
          onSave={() => {
            setSelectedActivityType(null)
            // TODO: Trigger refresh of activities
          }}
        />
      )}

      {isShareDrawerOpen && (
        <Sheet open={isShareDrawerOpen} onOpenChange={setIsShareDrawerOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Share Trip</SheetTitle>
            </SheetHeader>
            {/* TODO: Add email sharing functionality */}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
