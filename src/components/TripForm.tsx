import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { format } from "date-fns"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Image as ImageIcon } from "lucide-react"
import { DocumentsSection } from "./documents/DocumentsSection"
import { Separator } from "./ui/separator"

interface TripFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  onDelete?: () => void
}

export function TripForm({ initialData, onSubmit, onCancel, onDelete }: TripFormProps) {
  const [formData, setFormData] = useState({
    trip_name: initialData?.trip_name || "",
    trip_description: initialData?.trip_description || "",
    trip_destination: initialData?.trip_destination || "",
    trip_organisation: initialData?.trip_organisation || "",
    trip_status: initialData?.trip_status || "draft",
    trip_start_date: initialData?.trip_start_date ? new Date(initialData.trip_start_date) : undefined,
    trip_end_date: initialData?.trip_end_date ? new Date(initialData.trip_end_date) : undefined,
    trip_notes: initialData?.trip_notes || "",
    trip_image_url: initialData?.trip_image_url || "",
    trip_documents: initialData?.trip_documents || [],
  })

  const handleDocumentSelect = async (document: any) => {
    setFormData(prev => ({
      ...prev,
      trip_documents: [...(prev.trip_documents || []), document]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Trip Image Section */}
        <div className="space-y-2">
          <Label>Trip Image</Label>
          <div className="flex items-center gap-4">
            {formData.trip_image_url && (
              <img 
                src={formData.trip_image_url} 
                alt="Trip"
                className="h-20 w-20 object-cover rounded-md"
              />
            )}
            <Input
              type="url"
              placeholder="Enter image URL"
              value={formData.trip_image_url}
              onChange={(e) => setFormData({ ...formData, trip_image_url: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        <Separator />

        {/* Basic Trip Information */}
        <div className="space-y-2">
          <Label htmlFor="trip_name">Trip Name</Label>
          <Input
            id="trip_name"
            value={formData.trip_name}
            onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trip_description">Description</Label>
          <Textarea
            id="trip_description"
            value={formData.trip_description}
            onChange={(e) => setFormData({ ...formData, trip_description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trip_destination">Destination</Label>
          <Input
            id="trip_destination"
            value={formData.trip_destination}
            onChange={(e) => setFormData({ ...formData, trip_destination: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trip_organisation">Organization</Label>
          <Input
            id="trip_organisation"
            value={formData.trip_organisation}
            onChange={(e) => setFormData({ ...formData, trip_organisation: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trip_status">Status</Label>
          <Select
            value={formData.trip_status}
            onValueChange={(value) => setFormData({ ...formData, trip_status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.trip_start_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.trip_start_date ? (
                  format(formData.trip_start_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.trip_start_date}
                onSelect={(date) => setFormData({ ...formData, trip_start_date: date })}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.trip_end_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.trip_end_date ? (
                  format(formData.trip_end_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.trip_end_date}
                onSelect={(date) => setFormData({ ...formData, trip_end_date: date })}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Separator />

        {/* Documents Section */}
        <DocumentsSection
          documents={formData.trip_documents}
          title="Documents"
          onDocumentSelect={handleDocumentSelect}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        )}
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
