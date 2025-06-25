
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeRangeSelect } from "@/components/TimeRangeSelect";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ClientGrowthChartProps {
  clients: any[];
  timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export function ClientGrowthChart({ clients, timeRange }: ClientGrowthChartProps) {
  const chartData = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    
    // Sort clients by creation date
    const sortedClients = [...clients].sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    
    const data: Record<string, any>[] = [];
    
    // Function to format date based on timeRange
    const formatDate = (date: Date): string => {
      if (timeRange === 'daily') {
        return `${date.getDate()}/${date.getMonth() + 1}`;
      } else if (timeRange === 'weekly') {
        // Get the week number
        const weekNumber = Math.ceil((date.getDate() + (new Date(date.getFullYear(), date.getMonth(), 1).getDay())) / 7);
        return `W${weekNumber} ${date.getMonth() + 1}/${date.getFullYear()}`;
      } else if (timeRange === 'monthly') {
        // Get month abbreviation
        return new Date(date).toLocaleString('default', { month: 'short' });
      } else {
        return date.getFullYear().toString();
      }
    };
    
    // Prepare data points
    let cumulativeCount = 0;
    const dateMap = new Map<string, number>();
    
    sortedClients.forEach(client => {
      const creationDate = new Date(client.created_at);
      const dateKey = formatDate(creationDate);
      
      cumulativeCount++;
      dateMap.set(dateKey, cumulativeCount);
    });
    
    // Convert map to array
    dateMap.forEach((count, date) => {
      data.push({
        date,
        count
      });
    });
    
    // If no data exists, create some default values
    if (data.length === 0) {
      const today = new Date();
      data.push({ date: formatDate(today), count: 0 });
    }
    
    return data;
  }, [clients, timeRange]);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Client Growth</CardTitle>
        <TimeRangeSelect />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#9b87f5" 
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
