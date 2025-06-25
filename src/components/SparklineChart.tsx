
import { Line, LineChart, ResponsiveContainer } from "recharts"

interface SparklineChartProps {
  data: { value: number }[]
  color?: string
}

export function SparklineChart({ data, color = "#9b87f5" }: SparklineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          fill="url(#colorGradient)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
