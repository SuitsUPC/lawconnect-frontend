"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Search as SearchIcon, Briefcase, Filter, ArrowUpDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { casesService, authService, profilesService, type CaseResource } from "@/lib/api"
import { Input } from "@/components/ui/input"
import type { ClientResource } from "@/lib/api"

function AvailableCasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<CaseResource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "relevance">("newest")
  const [specialties, setSpecialties] = useState<{ id: number; name: string }[]>([])
  const [clientMap, setClientMap] = useState<{ [key: string]: ClientResource }>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    const userRole = currentUser.roles?.[0]
    if (userRole !== 'ROLE_LAWYER' && userRole !== 'ROLE_ADMIN') {
      router.push("/")
      return
    }

    fetchAvailableCases()
    fetchSpecialties()
  }, [router])

  const fetchAvailableCases = async () => {
    try {
      setLoading(true)
      const allCases = await casesService.getAllCases()
      const openCases = allCases.filter(c => c.status === 'OPEN')
      setCases(openCases)

      // Obtener información de clientes
      const clientIds = [...new Set(openCases.map(c => c.clientId))]
      const clients = await Promise.all(
        clientIds.map(id => 
          profilesService.getClientByUserId(id).catch(() => null)
        )
      )
      const clientMap: { [key: string]: ClientResource } = {}
      clients.forEach((client, index) => {
        if (client) {
          clientMap[clientIds[index]] = client
        }
      })
      setClientMap(clientMap)
    } catch (error) {
      console.error("Error loading available cases:", error)
      setCases([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const specialtiesData = await profilesService.getAllSpecialties()
      setSpecialties(specialtiesData)
    } catch (error) {
      console.error("Error loading specialties:", error)
    }
  }

  const getSpecialtyDisplayName = (specialtyId?: number): string => {
    if (!specialtyId) return "General"
    
    const specialty = specialties.find(s => s.id === specialtyId)
    if (!specialty) return "General"
    
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
    
    return specialtyDisplayMap[specialty.name] || specialty.name || "General"
  }

  const filteredCases = cases.filter((caseItem) => {
    // Filtrar por búsqueda
    const matchesSearch = !searchQuery || 
      caseItem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase())

    // Filtrar por especialidad
    const matchesSpecialty = selectedSpecialty === "all" || 
      (caseItem.specialtyId && getSpecialtyDisplayName(caseItem.specialtyId).toLowerCase().includes(selectedSpecialty.toLowerCase()))

    return matchesSearch && matchesSpecialty
  })

  // Ordenar casos
  const sortedCases = [...filteredCases].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "relevance":
        // Ordenar por relevancia de búsqueda (casos que coinciden con la búsqueda primero)
        if (searchQuery) {
          const aMatches = (a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0) +
                          (a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0)
          const bMatches = (b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0) +
                          (b.description?.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0)
          return bMatches - aMatches
        }
        return 0
      default:
        return 0
    }
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <Briefcase className="w-8 h-8 text-slate-700 mt-1" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Casos Abiertos</h1>
                <p className="text-gray-600 text-sm">Casos abiertos esperando ser asignados - Postula y amplía tu cartera</p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar casos disponibles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "relevance")}
                  className="h-12 px-4 pr-10 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 appearance-none cursor-pointer"
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="relevance">Relevancia</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                className="h-12 px-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Specialty Filter */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Especialidad Legal</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  <button
                    onClick={() => setSelectedSpecialty("all")}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                      selectedSpecialty === "all"
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Todas
                  </button>
                  {specialties.map((specialty) => {
                    const displayName = getSpecialtyDisplayName(specialty.id)
                    return (
                      <button
                        key={specialty.id}
                        onClick={() => setSelectedSpecialty(displayName.toLowerCase())}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                          selectedSpecialty === displayName.toLowerCase()
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {displayName}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cases Count and Stats */}
          {!loading && filteredCases.length > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-600 text-sm">
                Mostrando <span className="font-semibold text-gray-900">{sortedCases.length}</span> caso{sortedCases.length !== 1 ? 's' : ''} disponible{sortedCases.length !== 1 ? 's' : ''}
              </div>
              {(searchQuery || selectedSpecialty !== "all") && (
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedSpecialty("all")
                  }}
                  variant="secondary"
                  className="text-xs px-3 py-1 h-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}

          {/* Cases Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : sortedCases.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay casos disponibles
              </h3>
              <p className="text-gray-600">
                {searchQuery || selectedSpecialty !== "all"
                  ? "No se encontraron casos con esos criterios de búsqueda"
                  : "Todos los casos están asignados o cerrados"}
              </p>
              {(searchQuery || selectedSpecialty !== "all") && (
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedSpecialty("all")
                  }}
                  className="mt-4 bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedCases.map((caseItem) => {
                const client = clientMap[caseItem.clientId]
                const clientName = client 
                  ? `${client.fullName.firstname} ${client.fullName.lastname}`
                  : "Cliente"

                return (
                  <div
                    key={caseItem.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                  >
                    {/* Header with Icon and Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                          <Badge className="bg-green-100 text-green-700 border-green-200 font-medium pointer-events-none">
                            Disponible
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Case Description */}
                    <h3 className="text-gray-900 text-base font-semibold mb-3 leading-relaxed line-clamp-2">
                      {caseItem.description || caseItem.title}
                    </h3>

                    {/* Case Info */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      {caseItem.specialtyId && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{getSpecialtyDisplayName(caseItem.specialtyId)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Publicado {new Date(caseItem.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{clientName}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link href={`/cases/${caseItem.id}`}>
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg py-2.5">
                        Ver detalles y postular
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AvailableCasesPage
