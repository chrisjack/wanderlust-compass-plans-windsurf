
import { Card } from "@/components/ui/card"
import { BellDot, Plane, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { AlertDetailsPanel } from "./AlertDetailsPanel"
import { Badge } from "@/components/ui/badge"

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

export function AlertList({ alerts }: { alerts: Alert[] }) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  if (alerts.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <BellDot className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2">No alerts to display</p>
      </Card>
    )
  }

  // Get alert icon based on type
  const getAlertIcon = (alertType: string | null) => {
    switch (alertType) {
      case 'flight_update':
        return <Plane className="h-5 w-5 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      default:
        return <BellDot className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card 
            key={alert.id} 
            className={`p-4 ${!alert.read ? 'bg-blue-50' : ''} cursor-pointer hover:bg-gray-50 transition-colors`}
            onClick={() => setSelectedAlert(alert)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getAlertIcon(alert.alert_type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.alert_title}</h3>
                    <p className="mt-1 text-gray-500 line-clamp-2">{alert.content}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-sm text-gray-400">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </p>
                      {alert.alert_type === 'flight_update' && (
                        <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                          Flight Update
                        </Badge>
                      )}
                    </div>
                  </div>
                  {alert.priority === 'high' && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <AlertDetailsPanel 
        alert={selectedAlert} 
        isOpen={!!selectedAlert} 
        onClose={() => setSelectedAlert(null)}
      />
    </>
  )
}
