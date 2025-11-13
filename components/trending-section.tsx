"use client"

import { TrendingUp, MessageCircle, Share2 } from "lucide-react"

interface Trend {
  id: string
  title: string
  category: string
  discussions: number
  engagement: number
}

export default function TrendingSection() {
  // TODO: Obtener tendencias del backend cuando esté disponible
  const trends: Trend[] = []

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          Tendencias Legales
        </h2>
        <p className="text-neutral-400">Lo que está siendo discutido ahora</p>
      </div>

      <div className="space-y-3">
        {trends.length === 0 ? (
          <div className="card-modern text-center py-12">
            <p className="text-neutral-400">No hay tendencias disponibles</p>
            <p className="text-neutral-500 text-sm mt-2">
              Las tendencias legales estarán disponibles próximamente
            </p>
          </div>
        ) : (
          trends.map((trend) => (
          <div
            key={trend.id}
            className="card-modern p-4 hover:border-blue-500/50 cursor-pointer transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 border border-blue-500/30 text-blue-300">
                    {trend.category}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm leading-relaxed line-clamp-2">{trend.title}</h3>
              </div>
              <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-700 text-xs text-neutral-400">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{trend.discussions.toLocaleString()} discusiones</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                <span>{trend.engagement.toLocaleString()} participaciones</span>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  )
}
