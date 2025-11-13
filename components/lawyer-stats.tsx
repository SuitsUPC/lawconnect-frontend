"use client"

import { Briefcase, Users, TrendingUp } from "lucide-react"

interface LawyerStatsProps {
  casesWon: number
  clientsServed: number
  successRate: number
}

export default function LawyerStats({ casesWon, clientsServed, successRate }: LawyerStatsProps) {
  const stats = [
    {
      icon: Briefcase,
      label: "Casos Ganados",
      value: casesWon,
      color: "blue",
    },
    {
      icon: Users,
      label: "Clientes Atendidos",
      value: clientsServed,
      color: "green",
    },
    {
      icon: TrendingUp,
      label: "Tasa de Éxito",
      value: `${successRate}%`,
      color: "purple",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        const colorMap = {
          blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
          green: "bg-green-500/10 border-green-500/30 text-green-400",
          purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
        }

        return (
          <div key={idx} className={`card-modern p-4 border ${colorMap[stat.color as keyof typeof colorMap]}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <Icon className="w-6 h-6 opacity-50" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
