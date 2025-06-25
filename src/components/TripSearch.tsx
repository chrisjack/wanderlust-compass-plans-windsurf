
import React from "react"
import { Search } from "lucide-react"
import { Input } from "./ui/input"

interface TripSearchProps {
  onSearch: (query: string) => void
}

export function TripSearch({ onSearch }: TripSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search trips by name, destination, traveler, or organization..."
        className="w-full pl-9"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
}
