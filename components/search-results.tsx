"use client"

import { useEffect, useState } from "react"
import { MapPin, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { profilesService, type LawyerResource } from "@/lib/api"

interface SearchResultsProps {
  searchQuery: string
  filters?: {
    specialization?: string
    location?: string
  }
}

export default function SearchResults({ searchQuery, filters }: SearchResultsProps) {
  const [lawyers, setLawyers] = useState<LawyerResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getSpecialtyDisplayName = (specialty: string): string => {
    const specialtyMap: { [key: string]: string } = {
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
      'HUMAN_RIGHTS_LAW': 'Derechos Humanos',
      'AGRICULTURAL_LAW': 'Derecho Agrario',
      'HEALTHCARE_LAW': 'Derecho de la Salud',
      'MUNICIPAL_LAW': 'Derecho Municipal',
      'SPORTS_LAW': 'Derecho Deportivo',
    }
    return specialtyMap[specialty] || specialty
  }

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await profilesService.getAllLawyers()
        let filteredLawyers = data

        // Filtrar por búsqueda de texto
        if (searchQuery) {
          filteredLawyers = filteredLawyers.filter(
            (lawyer: LawyerResource) => {
              const fullName = `${lawyer.fullName.firstname} ${lawyer.fullName.lastname}`.toLowerCase()
              const specialtiesTranslated = lawyer.specialties.map(s => getSpecialtyDisplayName(s)).join(' ').toLowerCase()
              const description = (lawyer.description || '').toLowerCase()
              return (
                fullName.includes(searchQuery.toLowerCase()) ||
                specialtiesTranslated.includes(searchQuery.toLowerCase()) ||
                description.includes(searchQuery.toLowerCase())
              )
            }
          )
        }

        // Filtrar por especialización
        if (filters?.specialization && filters.specialization !== "all") {
          filteredLawyers = filteredLawyers.filter(
            (lawyer: LawyerResource) => lawyer.specialties.includes(filters.specialization!)
          )
        }

        // Filtrar por ubicación (por dirección)
        if (filters?.location) {
          filteredLawyers = filteredLawyers.filter(
            (lawyer: LawyerResource) => {
              const address = (lawyer.contactInfo.address || '').toLowerCase()
              return address.includes(filters.location!.toLowerCase())
            }
          )
        }

        setLawyers(filteredLawyers)
      } catch (err) {
        console.error("Error loading lawyers:", err)
        setError("Error al cargar abogados. Verifica que el backend esté funcionando.")
        setLawyers([])
      } finally {
        setLoading(false)
      }
    }

    fetchLawyers()
  }, [searchQuery, filters?.specialization, filters?.location])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resultados</h2>
        </div>
        <div className="px-4 py-2 bg-gray-100 rounded-lg">
          <span className="text-lg font-bold text-gray-900">{lawyers.length}</span>
          <span className="text-sm text-gray-600 ml-1">abogados encontrados</span>
        </div>
      </div>

      {lawyers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600 text-lg">No se encontraron abogados</p>
          <p className="text-gray-500 text-sm mt-2">Intenta ajustar tus filtros de búsqueda</p>
        </div>
      ) : (
        lawyers.map((lawyer) => {
          const fullName = `${lawyer.fullName.firstname} ${lawyer.fullName.lastname}`
          const initials = `${lawyer.fullName.firstname[0]}${lawyer.fullName.lastname[0]}`.toUpperCase()
          const specialtyDisplay = lawyer.specialties.length > 0 
            ? lawyer.specialties.map(s => getSpecialtyDisplayName(s)).join(', ')
            : "Sin especialidad"
          
          return (
            <div key={lawyer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm">
                    {initials}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        {fullName}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-slate-600" />
                        <p className="text-sm text-gray-600">{specialtyDisplay}</p>
                      </div>
                    </div>
                    {/* Etiqueta de disponibilidad eliminada hasta tener dato real */}
                  </div>

                  {lawyer.description && (
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {lawyer.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700">{lawyer.contactInfo.address || lawyer.contactInfo.phoneNumber || 'No disponible'}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <Link href={`/profile/${lawyer.userId}`}>
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg py-2.5">
                        Ver Perfil
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
