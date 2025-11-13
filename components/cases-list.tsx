"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { casesService, authService, type CaseResource } from "@/lib/api"
import { profilesService } from "@/lib/api"

interface Case extends CaseResource {
  type?: string
  priority?: string
  tags?: string[]
}

interface CasesListProps {
  status: string
  type: string
  searchQuery: string
  showAllCases?: boolean
}

export default function CasesList({ status, type, searchQuery, showAllCases = false }: CasesListProps) {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [specialtyMap, setSpecialtyMap] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true)
        const currentUser = authService.getCurrentUser()
        let data: CaseResource[] = []
        
        if (currentUser) {
          const userRole = currentUser.roles?.[0] || 'ROLE_CLIENT'
          
          if (showAllCases && (userRole === 'ROLE_LAWYER' || userRole === 'ROLE_ADMIN')) {
            data = await casesService.getAllCases()
          } else if (userRole === 'ROLE_LAWYER') {
            data = await casesService.getCasesByLawyer(currentUser.id)
          } else if (userRole === 'ROLE_CLIENT') {
            data = await casesService.getCasesByClient(currentUser.id)
          } else if (userRole === 'ROLE_ADMIN' && !showAllCases) {
            data = await casesService.getAllCases()
          }
        }
        
        setCases(data)

        // Cargar especialidades para mapear specialtyId
        try {
          const specialties = await profilesService.getAllSpecialties()
          const map: { [key: number]: string } = {}
          specialties.forEach(spec => {
            map[spec.id] = spec.name
          })
          setSpecialtyMap(map)
        } catch (error) {
          console.error("Error loading specialties:", error)
        }
      } catch (error) {
        console.error("Error loading cases:", error)
        setCases([])
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [showAllCases])

  const getSpecialtyDisplayName = (specialtyId?: number): string => {
    if (!specialtyId) return "General"
    
    // Primero intentar obtener del mapa de especialidades cargadas
    if (specialtyMap[specialtyId]) {
      const specialtyName = specialtyMap[specialtyId]
      
      // Mapear nombres de backend a español
      const specialtyDisplayMap: { [key: string]: string } = {
        'CRIMINAL_LAW': 'Derecho Penal',
        'CIVIL_LAW': 'Derecho Civil',
        'LABOR_LAW': 'Derecho Laboral',
        'FAMILY_LAW': 'Derecho de Familia',
        'CORPORATE_LAW': 'Derecho Corporativo',
        'TAX_LAW': 'Derecho Tributario',
        'IMMIGRATION_LAW': 'Derecho Migratorio',
        'REAL_ESTATE_LAW': 'Derecho Inmobiliario',
        'INTELLECTUAL_PROPERTY': 'Propiedad Intelectual',
        'ENVIRONMENTAL_LAW': 'Derecho Ambiental',
        'CONSUMER_PROTECTION': 'Protección al Consumidor',
        'ESTATE_PLANNING': 'Planificación Patrimonial',
        'CYBER_LAW': 'Derecho Cibernético',
      }
      
      return specialtyDisplayMap[specialtyName] || specialtyName || "General"
    }
    
    return "General"
  }

  const filteredCases = cases.filter((caseItem) => {
    // Filtrar por estado
    let matchesStatus = true
    if (status !== "all") {
      const statusUpper = caseItem.status?.toUpperCase() || ""
      if (status === "active") {
        matchesStatus = statusUpper === "ACCEPTED" || statusUpper === "EVALUATION" || statusUpper === "IN_EVALUATION"
      } else if (status === "closed") {
        matchesStatus = statusUpper === "CLOSED"
      } else if (status === "appealing") {
        matchesStatus = statusUpper === "APPEALING"
      } else {
        matchesStatus = statusUpper === status.toUpperCase()
      }
    }
    
    // Filtrar por tipo
    let matchesType = true
    if (type !== "all") {
      const specialtyDisplay = getSpecialtyDisplayName(caseItem.specialtyId).toLowerCase()
      matchesType = specialtyDisplay.includes(type.toLowerCase())
    }
    
    // Filtrar por búsqueda
    const matchesSearch =
      !searchQuery ||
      caseItem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesType && matchesSearch
  })

  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase() || ""
    switch (statusUpper) {
      case "OPEN":
        return "bg-slate-100 text-slate-700 border-slate-200"
      case "EVALUATION":
      case "IN_EVALUATION":
      case "ACCEPTED":
        return "bg-slate-100 text-slate-700 border-slate-200"
      case "CLOSED":
        return "bg-green-100 text-green-700 border-green-200"
      case "APPEALING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "CANCELED":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    const statusUpper = status?.toUpperCase() || ""
    switch (statusUpper) {
      case "OPEN":
        return "Abierto"
      case "EVALUATION":
      case "IN_EVALUATION":
      case "ACCEPTED":
        return "En progreso"
      case "CLOSED":
        return "Cerrado"
      case "APPEALING":
        return "En apelación"
      case "CANCELED":
        return "Cancelado"
      default:
        return status || "Desconocido"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600 text-lg">No se encontraron casos</p>
        </div>
      ) : (
        filteredCases.map((caseItem) => (
          <div key={caseItem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <p className="text-gray-900 text-base leading-relaxed">{caseItem.description || caseItem.title}</p>
              </div>
              <Badge className={`${getStatusColor(caseItem.status)} border font-medium flex-shrink-0`}>
                {getStatusLabel(caseItem.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Tipo de Derecho</p>
                <p className="text-sm text-gray-700">{caseItem.specialtyId ? getSpecialtyDisplayName(caseItem.specialtyId) : 'General'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Fecha de Creación</p>
                <p className="text-sm text-gray-700">
                  {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString("es-ES", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No disponible'}
                </p>
              </div>
            </div>

            <div>
              <Link href={`/cases/${caseItem.id}`}>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg py-2.5">
                  Ver Detalles
                </Button>
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
