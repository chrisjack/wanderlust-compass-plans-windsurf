import { Card, CardContent } from "@/components/ui/card";
import { Users, Plane } from "lucide-react";

interface ClientStatsCardsProps {
  totalClients: number;
  upcomingClients: number;
}

export function ClientStatsCards({ 
  totalClients, 
  upcomingClients 
}: ClientStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 mb-6">
      <StatsCard 
        title="Total Clients" 
        value={totalClients} 
        icon={<Users className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />}
        iconBackground="bg-blue-100"
        className="p-3 md:p-6"
      />
      
      <StatsCard 
        title="Traveling Clients" 
        value={upcomingClients} 
        icon={<Plane className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />} 
        iconBackground="bg-yellow-100"
        className="p-3 md:p-6"
      />
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  iconBackground,
  className = ""
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  iconBackground: string;
  className?: string;
}) {
  return (
    <Card className={`border shadow-sm ${className}`}>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm font-medium text-gray-500">{title}</p>
          <h2 className="text-xl md:text-2xl font-bold mt-1">{value}</h2>
        </div>
        <div className={`h-8 w-8 md:h-10 md:w-10 ${iconBackground} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
