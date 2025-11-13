"use client"

import Link from "next/link"
import { ChevronRight, Heart, TrendingUp } from "lucide-react"

interface SidebarProps {
  open: boolean
}

export default function Sidebar({ open }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-neutral-900 border-r border-neutral-800 transition-all duration-300 overflow-y-auto ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-6 space-y-8">
        {/* Featured Section */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">Destacado</h3>
          <div className="space-y-2">
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Tendencias
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Heart className="w-4 h-4" />
              Guardados
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </Link>
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">Categorías</h3>
          <div className="space-y-2">
            {[
              { label: "Derecho Civil", icon: "📋" },
              { label: "Derecho Penal", icon: "⚖️" },
              { label: "Derecho Laboral", icon: "💼" },
              { label: "Derecho Corporativo", icon: "🏢" },
              { label: "Derecho Inmobiliario", icon: "🏠" },
            ].map((category) => (
              <Link
                key={category.label}
                href={`/categories/${category.label.toLowerCase()}`}
                className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <span>{category.icon}</span>
                {category.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links Section */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">Links Rápidos</h3>
          <div className="space-y-2">
            <Link
              href="/about"
              className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Acerca de
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Ayuda
            </Link>
            <Link
              href="/terms"
              className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Términos
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="card-modern">
          <h4 className="font-semibold text-white mb-2">¿Eres abogado?</h4>
          <p className="text-sm text-neutral-400 mb-4">Crea tu perfil profesional y conecta con clientes.</p>
          <Link href="/signup-lawyer" className="button-primary text-sm w-full flex items-center justify-center gap-2">
            Regístrate Ahora
          </Link>
        </div>
      </div>
    </aside>
  )
}
