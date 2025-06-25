
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { create } from 'zustand'

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface TimeRangeStore {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
}

export const useTimeRange = create<TimeRangeStore>((set) => ({
  timeRange: 'monthly',
  setTimeRange: (range) => set({ timeRange: range }),
}))

export function TimeRangeSelect() {
  const { timeRange, setTimeRange } = useTimeRange();

  return (
    <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
      <SelectTrigger className="w-[180px] bg-white shadow-sm border border-gray-200">
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Daily</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
        <SelectItem value="yearly">Yearly</SelectItem>
      </SelectContent>
    </Select>
  )
}
