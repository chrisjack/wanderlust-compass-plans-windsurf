
import { useState } from "react"
import { Filter, Calendar, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar as CalendarComponent } from "./ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TripFiltersProps {
  onFilterChange: (filters: any) => void
  onSortChange: (sort: "asc" | "desc") => void
  onDateRangeChange: (dateRange: { from: Date | undefined; to: Date | undefined }) => void
}

export function TripFilters({ onFilterChange, onSortChange, onDateRangeChange }: TripFiltersProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState({
    status: "",
    traveler: "",
    organization: ""
  })
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  })

  const handleSortChange = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc"
    setSortOrder(newSortOrder)
    onSortChange(newSortOrder)
  }

  const handleFiltersChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    const range = {
      from: !dateRange.from ? selectedDate : dateRange.from,
      to: dateRange.from && !dateRange.to ? selectedDate : dateRange.from
    }
    
    // If both dates are selected or we're resetting
    if (dateRange.from && dateRange.to || !selectedDate) {
      range.from = selectedDate
      range.to = undefined
    }

    setDateRange(range)
    onDateRangeChange(range)
  }

  return (
    <div className="flex gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Trips</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium leading-none">Status</h3>
              <RadioGroup defaultValue={filters.status} onValueChange={(value) => handleFiltersChange("status", value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">All</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft">Draft</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed">Completed</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium leading-none">Travelers</h3>
              <Select value={filters.traveler} onValueChange={(value) => handleFiltersChange("traveler", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select traveler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Travelers</SelectItem>
                  <SelectItem value="client1">Client 1</SelectItem>
                  <SelectItem value="client2">Client 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium leading-none">Organization</h3>
              <Select value={filters.organization} onValueChange={(value) => handleFiltersChange("organization", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  <SelectItem value="org1">Organization 1</SelectItem>
                  <SelectItem value="org2">Organization 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={handleSortChange}
      >
        <Calendar className="h-4 w-4" />
        Date {sortOrder === "asc" ? "Closest" : "Latest"}
        {sortOrder === "asc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
              ) : (
                format(dateRange.from, "MMM d")
              )
            ) : (
              "Select dates"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="range"
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={(range: { from?: Date; to?: Date }) => {
              setDateRange({
                from: range?.from,
                to: range?.to
              });
              onDateRangeChange({
                from: range?.from,
                to: range?.to
              });
            }}
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
