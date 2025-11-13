"use client"

import { Heart, MessageCircle, Star, CheckCircle } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface LawyerCardProps {
  lawyer: {
    id: number
    name: string
    specialization: string
    experience: number
    rating: number
    cases: number
    image: string
    verified: boolean
  }
}

export default function LawyerCard({ lawyer }: LawyerCardProps) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="card-modern overflow-hidden group hover:shadow-xl hover:shadow-primary-light/10 cursor-pointer">
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-lg mb-4 bg-neutral-700">
        <Image
          src={lawyer.image || "/placeholder.svg"}
          alt={lawyer.name}
          fill
          className="object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Verified Badge */}
        {lawyer.verified && (
          <div className="absolute top-3 right-3 bg-accent text-neutral-900 rounded-full p-1.5 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-neutral-900/80 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-1">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span className="text-sm font-semibold">{lawyer.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">{lawyer.name}</h3>
          <p className="text-sm text-accent font-semibold">{lawyer.specialization}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 pb-3 border-t border-b border-neutral-700">
          <div>
            <p className="text-xs text-neutral-400">Experiencia</p>
            <p className="text-sm font-bold">{lawyer.experience} años</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Casos</p>
            <p className="text-sm font-bold">{lawyer.cases}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setLiked(!liked)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-700/50 hover:bg-blue-500/20 rounded-lg transition group/btn"
          >
            <Heart
              className={`w-4 h-4 transition ${liked ? "fill-accent text-accent" : "text-neutral-400 group-hover/btn:text-accent"}`}
            />
            <span className="text-xs font-medium">Seguir</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-700/50 hover:bg-blue-500/20 rounded-lg transition group/btn">
            <MessageCircle className="w-4 h-4 text-neutral-400 group-hover/btn:text-accent" />
            <span className="text-xs font-medium">Chat</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-accent text-neutral-900 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition">
            <span className="text-xs font-semibold">Ver Perfil</span>
          </button>
        </div>
      </div>
    </div>
  )
}
