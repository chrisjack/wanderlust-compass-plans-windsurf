
import { Card } from "@/components/ui/card";
import { FileText, Mail, Link } from "lucide-react";

const steps = [
  {
    icon: Mail,
    title: "Step 1: Forward Email",
    description: "Forward your confirmation emails to our import address. Include the original attachments.",
  },
  {
    icon: FileText,
    title: "Step 2: Automatic Processing",
    description: "Our system extracts all relevant details from your confirmation emails automatically.",
  },
  {
    icon: Link,
    title: "Step 3: Assign to Trip",
    description: "Review the imported items and assign them to the appropriate trip.",
  },
];

export function ImportSteps() {
  return (
    <Card className="p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">How to Import</h2>
        <p className="text-muted-foreground">
          Forward your travel confirmations to our system for automatic processing
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {steps.map((step) => (
          <div 
            key={step.title} 
            className="p-6 rounded-lg border bg-card text-card-foreground"
          >
            <step.icon className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
