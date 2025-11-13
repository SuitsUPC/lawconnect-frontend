"use client"

import { Star } from "lucide-react"

export default function LawyerReviews() {
  // TODO: Obtener reseñas del backend cuando esté disponible
  const reviews: any[] = []

  return (
    <div className="card-modern">
      <h2 className="text-2xl font-bold text-white mb-6">Reseñas de Clientes</h2>
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            No hay reseñas disponibles
          </div>
        ) : (
          reviews.map((review) => (
          <div key={review.id} className="pb-4 border-b border-neutral-700 last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <img
                src={review.avatar || "/placeholder.svg"}
                alt={review.author}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-white">{review.author}</h4>
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mb-2">{review.date}</p>
                <p className="text-sm text-neutral-300 leading-relaxed">{review.text}</p>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  )
}
