
import { useState } from "react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

const passengerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  loyalty_number: z.string().optional(),
  seat: z.string().optional(),
  class: z.string().optional(),
  passenger_notes: z.string().optional(),
  flight_passengers_documents: z.any().optional(),
})

interface PassengerDetailsProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  passenger?: {
    id: string
    name: string
    loyalty_number?: string
    seat?: string
    class?: string
    passenger_notes?: string
    flight_passengers_documents?: any
  } | null
  flightId: string
  mode: 'add' | 'edit'
}

export function PassengerDetails({
  isOpen,
  onClose,
  onSave,
  passenger,
  flightId,
  mode
}: PassengerDetailsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<string[]>(
    passenger?.flight_passengers_documents || []
  )

  const form = useForm<z.infer<typeof passengerSchema>>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      name: passenger?.name || "",
      loyalty_number: passenger?.loyalty_number || "",
      seat: passenger?.seat || "",
      class: passenger?.class || "",
      passenger_notes: passenger?.passenger_notes || "",
      flight_passengers_documents: passenger?.flight_passengers_documents || [],
    }
  })

  const handleSubmit = async (values: z.infer<typeof passengerSchema>) => {
    setIsLoading(true)
    try {
      // Include documents in the submission
      const submissionData = {
        ...values,
        flight_passengers_documents: documents
      }

      if (mode === 'add') {
        const { error } = await supabase
          .from('flights_passengers')
          .insert([
            {
              ...submissionData,
              flight_id: flightId
            }
          ])
        
        if (error) throw error
        
        toast({
          title: "Success",
          description: "Passenger added successfully",
        })
      } else {
        const { error } = await supabase
          .from('flights_passengers')
          .update(submissionData)
          .eq('id', passenger?.id)
        
        if (error) throw error
        
        toast({
          title: "Success",
          description: "Passenger updated successfully",
        })
      }
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!passenger?.id) return
    
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('flights_passengers')
        .delete()
        .eq('id', passenger.id)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Passenger deleted successfully",
      })
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDocument = () => {
    // Here you would typically implement a file upload
    // For now, we're just adding a placeholder URL
    const newDocument = `https://example.com/document-${Math.floor(Math.random() * 1000)}.pdf`
    setDocuments([...(documents || []), newDocument])
    toast({
      title: "Document Added",
      description: "Document has been added to this passenger",
    })
  }

  const handleRemoveDocument = (index: number) => {
    const updatedDocuments = [...documents]
    updatedDocuments.splice(index, 1)
    setDocuments(updatedDocuments)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{mode === 'add' ? 'Add Passenger' : 'Edit Passenger'}</SheetTitle>
        </SheetHeader>
        
        <div className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="loyalty_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loyalty Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="seat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seat</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="passenger_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Documents Section */}
              <div>
                <FormLabel>Documents</FormLabel>
                <div className="space-y-2 mt-2">
                  {documents && documents.length > 0 ? (
                    <div className="space-y-2">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex justify-between items-center bg-muted p-2 rounded-md">
                          <a 
                            href={doc} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Document {index + 1}
                          </a>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveDocument(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents attached</p>
                  )}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddDocument}
                  >
                    Add Document
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button type="submit" disabled={isLoading}>
                    {mode === 'add' ? 'Add Passenger' : 'Update Passenger'}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
                
                {mode === 'edit' && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    Delete Passenger
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
