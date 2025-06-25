
import { DashboardNav } from "@/components/DashboardNav"
import { TopNav } from "@/components/TopNav"
import { TripsTable } from "@/components/TripsTable"
import { TripSearch } from "@/components/TripSearch"
import { TripFilters } from "@/components/TripFilters"
import { useAuth } from "@/lib/auth"
import { Navigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TripForm } from "@/components/TripForm"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function Trips() {
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState<"asc" | "desc">("asc")
  const [dateRange, setDateRange] = useState({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const { toast } = useToast()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleSortChange = (sortDirection: "asc" | "desc") => {
    setSort(sortDirection)
  }

  const handleDateRangeChange = (range: any) => {
    setDateRange(range)
  }

  const handleCreateTrip = async (data: any) => {
    try {
      const { error } = await supabase
        .from('trips')
        .insert([{ ...data, user_id: user.id }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Trip created successfully",
      })
      setIsCreateOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      })
    }
  }

  const handleEditTrip = async (data: any) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update(data)
        .eq('id', selectedTrip.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Trip updated successfully",
      })
      setIsEditOpen(false)
      setSelectedTrip(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Trip deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold">Trips</h1>
              <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Create trip
              </Button>
            </div>
            <div className="space-y-4">
              <TripSearch onSearch={handleSearch} />
              <TripFilters 
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                onDateRangeChange={handleDateRangeChange}
              />
              <TripsTable 
                searchQuery={searchQuery} 
                filters={filters} 
                sort={sort} 
                dateRange={dateRange}
                onEdit={(trip) => {
                  setSelectedTrip(trip)
                  setIsEditOpen(true)
                }}
                onDelete={handleDeleteTrip}
              />
            </div>
          </div>
        </main>
      </div>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="right" className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Create Trip</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <TripForm
              onSubmit={handleCreateTrip}
              onCancel={() => setIsCreateOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Edit Trip</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <TripForm
              initialData={selectedTrip}
              onSubmit={handleEditTrip}
              onCancel={() => {
                setIsEditOpen(false)
                setSelectedTrip(null)
              }}
              onDelete={() => {
                if (selectedTrip) {
                  handleDeleteTrip(selectedTrip.id);
                  setIsEditOpen(false);
                  setSelectedTrip(null);
                }
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
