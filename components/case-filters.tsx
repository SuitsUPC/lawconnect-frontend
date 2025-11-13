"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface CaseFiltersProps {
  selectedStatus: string
  selectedType: string
  searchQuery: string
  onStatusChange: (status: string) => void
  onTypeChange: (type: string) => void
  onSearchChange: (query: string) => void
}

export default function CaseFilters({
  selectedStatus,
  selectedType,
  searchQuery,
  onStatusChange,
  onTypeChange,
  onSearchChange,
}: CaseFiltersProps) {
  const statuses = [
    { id: "all", label: "Todos los estados" },
    { id: "active", label: "En progreso" },
    { id: "closed", label: "Cerrado" },
    { id: "appealing", label: "En apelación" },
  ]

  const types = [
    { id: "all", label: "Todos los tipos" },
    { id: "civil", label: "Derecho Civil" },
    { id: "criminal", label: "Derecho Penal" },
    { id: "labor", label: "Derecho Laboral" },
    { id: "corporate", label: "Derecho Corporativo" },
    { id: "real-estate", label: "Derecho Inmobiliario" },
  ]

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Estado del Caso</label>
        <div className="space-y-2">
          {statuses.map((status) => (
            <button
              key={status.id}
              onClick={() => onStatusChange(status.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors font-medium ${
                selectedStatus === status.id
                  ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Tipo de Derecho</label>
        <div className="space-y-2">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => onTypeChange(type.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors font-medium ${
                selectedType === type.id
                  ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
