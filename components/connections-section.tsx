"use client"

import { Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Lawyer {
  id: string
  name: string
  title: string
  specialization: string
  location: string
  rating: number
  reviews: number
  avatar: string
  bio: string
  badge?: string
}

export default function ConnectionsSection() {
  // TODO: Obtener abogados recomendados del backend cuando esté disponible
  const recommendedLawyers: Lawyer[] = []

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Conexiones Recomendadas</h2>
        <p className="text-neutral-400">Descubre abogados expertos en tu área de interés</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendedLawyers.length === 0 ? (
          <div className="col-span-full card-modern text-center py-12">
            <p className="text-neutral-400">No hay conexiones recomendadas disponibles</p>
            <p className="text-neutral-500 text-sm mt-2">
              Usa la búsqueda de abogados para encontrar profesionales
            </p>
          </div>
        ) : (
          recommendedLawyers.map((lawyer) => (
          <div
            key={lawyer.id}
            className="card-modern group hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30 cursor-pointer"
          >
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={lawyer.avatar || "/placeholder.svg"}
                  alt={lawyer.name}
                  className="w-16 h-16 rounded-xl object-cover border border-neutral-700"
                />
                {lawyer.badge && (
                  <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold">
                    {lawyer.badge === "Top Rated" ? "⭐" : "✓"}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{lawyer.name}</h3>
                    <p className="text-sm text-neutral-400 truncate">{lawyer.title}</p>
                  </div>
                  {lawyer.rating && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-white">{lawyer.rating}</span>
                      <span className="text-xs text-neutral-400">({lawyer.reviews})</span>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
                  <MapPin className="w-3 h-3" />
                  {lawyer.location}
                </div>

                {/* Bio */}
                <p className="text-xs text-neutral-500 mt-2 line-clamp-2">{lawyer.bio}</p>

                {/* Specialization Badge */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-700">
                  <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 font-medium">
                    {lawyer.specialization}
                  </span>
                  <Button className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg">
                    Conectar
                  </Button>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* View More Button */}
      {recommendedLawyers.length > 0 && (
        <button className="w-full mt-6 py-3 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors font-medium">
          Ver más conexiones
        </button>
      )}
    </div>
  )
}
