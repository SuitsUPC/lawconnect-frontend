"use client"

import { Star, DollarSign, MapPin } from "lucide-react"

interface SearchFiltersProps {
  specializations?: Array<{ id: number; name: string }>
  filters: {
    specialization: string
    location: string
    rating: number
    priceRange: [number, number]
    availability: string
  }
  onFiltersChange: (filters: any) => void
}

function SearchFilters({ specializations = [], filters, onFiltersChange }: SearchFiltersProps) {
  const locations = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Málaga", "Alicante", "Online"]

  const availabilityOptions = [
    { id: "all", label: "Cualquier disponibilidad" },
    { id: "immediate", label: "Disponible inmediatamente" },
    { id: "week", label: "En esta semana" },
    { id: "soon", label: "Próximamente" },
  ]

  return (
    <div className="space-y-6">
      {/* Specialization Filter */}
      <div className="card-modern">
        <h3 className="text-lg font-bold text-white mb-4">Especialidad</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="specialization"
              value="all"
              checked={filters.specialization === "all"}
              onChange={(e) => onFiltersChange({ ...filters, specialization: e.target.value })}
              className="w-4 h-4 rounded-full border-neutral-600 bg-neutral-800 text-slate-900 accent-slate-900 cursor-pointer"
            />
            <span className="text-neutral-300 group-hover:text-white transition-colors text-sm">Todas</span>
          </label>

          {specializations.map((spec) => (
            <label key={spec.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="specialization"
                value={spec.name}
                checked={filters.specialization === spec.name}
                onChange={(e) => onFiltersChange({ ...filters, specialization: e.target.value })}
                className="w-4 h-4 rounded-full border-neutral-600 bg-neutral-800 text-slate-900 accent-slate-900 cursor-pointer"
              />
              <span className="text-neutral-300 group-hover:text-white transition-colors text-sm">{spec.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div className="card-modern">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          Ubicación
        </h3>
        <div className="space-y-2">
          {locations.map((location) => (
            <label key={location} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="location"
                value={location}
                className="w-4 h-4 rounded-full border-neutral-600 bg-neutral-800 text-slate-900 accent-slate-900 cursor-pointer"
              />
              <span className="text-neutral-300 group-hover:text-white transition-colors text-sm">{location}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="card-modern">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Calificación Mínima
        </h3>
        <div className="space-y-3">
          {[5, 4, 3].map((rating) => (
            <label key={rating} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                value={rating}
                className="w-4 h-4 rounded-full border-neutral-600 bg-neutral-800 text-slate-900 accent-slate-900 cursor-pointer"
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-neutral-300 group-hover:text-white transition-colors text-sm ml-1">
                  {rating}+ Estrellas
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="card-modern">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Rango de Precio
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Mínimo: €{filters.priceRange[0]}</label>
            <input
              type="range"
              min="0"
              max="500"
              value={filters.priceRange[0]}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priceRange: [Number.parseInt(e.target.value), filters.priceRange[1]],
                })
              }
              className="w-full accent-slate-900"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Máximo: €{filters.priceRange[1]}</label>
            <input
              type="range"
              min="0"
              max="500"
              value={filters.priceRange[1]}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priceRange: [filters.priceRange[0], Number.parseInt(e.target.value)],
                })
              }
              className="w-full accent-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Availability Filter */}
      <div className="card-modern">
        <h3 className="text-lg font-bold text-white mb-4">Disponibilidad</h3>
        <div className="space-y-2">
          {availabilityOptions.map((option) => (
            <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="availability"
                value={option.id}
                className="w-4 h-4 rounded-full border-neutral-600 bg-neutral-800 text-slate-900 accent-slate-900 cursor-pointer"
              />
              <span className="text-neutral-300 group-hover:text-white transition-colors text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => onFiltersChange({ specialization: "all" })}
        className="w-full py-2 border border-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors font-medium"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

export { SearchFilters }
export default SearchFilters
