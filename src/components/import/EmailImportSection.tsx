import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Check } from "lucide-react"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

interface EmailAddress {
  type: string
  address: string
  description: string
}

const emailAddresses: EmailAddress[] = [
  {
    type: "flights",
    address: "flights@wanderlustcompass.com",
    description: "Forward flight confirmations, e-tickets, and airline itineraries"
  },
  {
    type: "accommodation",
    address: "hotels@wanderlustcompass.com",
    description: "Forward hotel confirmations, resort bookings, and accommodation details"
  },
  {
    type: "events",
    address: "events@wanderlustcompass.com",
    description: "Forward event tickets, show confirmations, and activity bookings"
  },
  {
    type: "transport",
    address: "transport@wanderlustcompass.com",
    description: "Forward car rental confirmations, train tickets, and other transport bookings"
  },
  {
    type: "cruise",
    address: "cruise@wanderlustcompass.com",
    description: "Forward cruise confirmations, ship itineraries, and onboard activity details"
  }
]

export function EmailImportSection() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const handleCopyEmail = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      toast.success("Email address copied to clipboard")
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      toast.error("Failed to copy email address")
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="h-4 w-4" />
          Email Import
        </CardTitle>
        <CardDescription className="text-xs">
          Forward travel documents to the appropriate email address below. Our system will automatically parse and import them.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {emailAddresses.map((email) => (
            <TooltipProvider key={email.type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-start gap-2 p-2 border rounded-md text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleCopyEmail(email.address)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{email.type}</span>
                        <Badge 
                          variant="outline" 
                          className="text-xs flex items-center gap-1"
                        >
                          {copiedAddress === email.address ? (
                            <>
                              <Check className="h-3 w-3" />
                              Copied
                            </>
                          ) : (
                            email.address
                          )}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{email.description}</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">{email.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 