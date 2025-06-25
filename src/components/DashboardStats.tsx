import { Card, CardContent } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/integrations/supabase/client"
import { Plane, Users, Clock } from "lucide-react"
import { SparklineChart } from "./SparklineChart"
import { useTimeRange } from "./TimeRangeSelect"
import { startOfDay, subDays, startOfWeek, startOfMonth, startOfYear } from "date-fns"

export function DashboardStats() {
  const { user } = useAuth()
  const { timeRange } = useTimeRange()

  const getStartDate = () => {
    const now = new Date()
    switch (timeRange) {
      case 'daily':
        return startOfDay(now)
      case 'weekly':
        return startOfWeek(now)
      case 'monthly':
        return startOfMonth(now)
      case 'yearly':
        return startOfYear(now)
      default:
        return startOfMonth(now)
    }
  }

  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'daily':
        return 'day'
      case 'weekly':
        return 'week'
      case 'monthly':
        return 'month'
      case 'yearly':
        return 'year'
      default:
        return 'month'
    }
  }

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id, timeRange],
    queryFn: async () => {
      console.log("Fetching stats for time range:", timeRange)
      
      if (!user) {
        return {
          totalTrips: 0,
          totalClients: 0,
          activeTrips: 0
        }
      }

      const startDate = getStartDate()
      console.log("Start date for query:", startDate.toISOString())

      try {
        const [totalTripsResult, totalClientsResult, activeTripsResult] = await Promise.all([
          supabase
            .from('trips')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('trips')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('trip_status', 'active')
            .gte('created_at', startDate.toISOString())
        ])

        console.log("Query results:", { 
          totalTripsResult, 
          totalClientsResult, 
          activeTripsResult 
        })

        return {
          totalTrips: totalTripsResult.count || 0,
          totalClients: totalClientsResult.count || 0,
          activeTrips: activeTripsResult.count || 0
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
        return {
          totalTrips: 0,
          totalClients: 0,
          activeTrips: 0
        }
      }
    },
    enabled: !!user
  })

  const tripChartData = [
    { value: 4 },
    { value: 4 },
    { value: 4 },
    { value: 4 },
  ]

  const clientChartData = [
    { value: 4 },
    { value: 4 },
    { value: 4 },
    { value: 4 },
  ]

  const activeTripsChartData = [
    { value: 0 },
    { value: 0 },
    { value: 0 },
    { value: 0 },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Trips</p>
              <h2 className="text-3xl font-bold mt-1">{isLoading ? "..." : stats?.totalTrips ?? 0}</h2>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <span>↑ 0%</span> 
                <span className="text-gray-400 ml-1">in last {getTimeRangeText()}</span>
              </p>
            </div>
            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center">
              <Plane className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="mt-4 h-16">
            <SparklineChart data={tripChartData} color="#9b87f5" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <h2 className="text-3xl font-bold mt-1">{isLoading ? "..." : stats?.totalClients ?? 0}</h2>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <span>↑ 100%</span> 
                <span className="text-gray-400 ml-1">in last {getTimeRangeText()}</span>
              </p>
            </div>
            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="mt-4 h-16">
            <SparklineChart data={clientChartData} color="#9b87f5" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Trips</p>
              <h2 className="text-3xl font-bold mt-1">{isLoading ? "..." : stats?.activeTrips ?? 0}</h2>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <span>↑ 0%</span> 
                <span className="text-gray-400 ml-1">in last {getTimeRangeText()}</span>
              </p>
            </div>
            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="mt-4 h-16">
            <SparklineChart data={activeTripsChartData} color="#9b87f5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
