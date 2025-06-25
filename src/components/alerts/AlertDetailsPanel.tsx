import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Alert {
  id: string
  alert_title: string
  content: string
  created_at: string
  priority: string
  read: boolean
  alert_type: string | null
  expires_at: string | null
  trip_id: string | null
  user_id: string
}

interface AlertDetailsPanelProps {
  alert: Alert | null
  isOpen: boolean
  onClose: () => void
}

export function AlertDetailsPanel({ alert, isOpen, onClose }: AlertDetailsPanelProps) {
  const queryClient = useQueryClient()

  const { data: trip } = useQuery({
    queryKey: ['trip', alert?.trip_id],
    queryFn: async () => {
      if (!alert?.trip_id) return null
      const { data, error } = await supabase
        .from('trips')
        .select('trip_name')
        .eq('id', alert.trip_id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!alert?.trip_id
  })

  useEffect(() => {
    const updateAlertReadStatus = async () => {
      if (alert && !alert.read && isOpen) {
        const { error } = await supabase
          .from('alerts')
          .update({ read: true })
          .eq('id', alert.id)

        if (!error) {
          queryClient.invalidateQueries({ queryKey: ['alerts'] })
        }
      }
    }

    updateAlertReadStatus()
  }, [alert, isOpen, queryClient])

  if (!alert) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{alert.alert_title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                </span>
                {alert.priority === 'high' && (
                  <Badge variant="destructive">High Priority</Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Content</h3>
                <p className="text-sm text-gray-600">{alert.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {alert.alert_type && (
                  <div>
                    <h4 className="text-sm font-medium">Type</h4>
                    <p className="text-sm text-gray-600">{alert.alert_type}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <p className="text-sm text-gray-600">{alert.read ? 'Read' : 'Unread'}</p>
                </div>

                {alert.expires_at && (
                  <div>
                    <h4 className="text-sm font-medium">Expires</h4>
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(alert.expires_at), { addSuffix: true })}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium">Priority</h4>
                  <p className="text-sm text-gray-600 capitalize">{alert.priority}</p>
                </div>
              </div>

              {alert.trip_id && trip && (
                <div>
                  <h4 className="text-sm font-medium">Related Trip</h4>
                  <Link 
                    to={`/trips/${alert.trip_id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {trip.trip_name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
