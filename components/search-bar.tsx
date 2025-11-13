"use client"

import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <Input
          type="text"
          placeholder="Buscar por nombre, especialidad..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 text-base"
        />
      </div>
      <div className="relative md:w-48">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <Input
          type="text"
          placeholder="Ubicación..."
          className="pl-12 h-12 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 text-base"
        />
      </div>
      <button className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors">
        Buscar
      </button>
    </div>
  )
}

export { SearchBar }
export default SearchBar
