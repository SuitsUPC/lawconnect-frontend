"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { profilesService, type LawyerSpecialtyResource } from "@/lib/api"
import SearchResults from "@/components/search-results"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [specializations, setSpecializations] = useState<LawyerSpecialtyResource[]>([])
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/auth/login")
      return
    }

    const fetchSpecializations = async () => {
      try {
        const data = await profilesService.getAllSpecialties()
        setSpecializations(data)
      } catch (error) {
        console.error("Error fetching specializations:", error)
      }
    }

    fetchSpecializations()
  }, [router])

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

  const locations = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Málaga", "Alicante", "Online"]

  const filters = {
    specialization: selectedSpecialization,
    location: selectedLocation,
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-24">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 py-12 mb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h1 className="text-4xl font-bold text-white mb-2">Encuentra tu Abogado Ideal</h1>
            <p className="text-gray-300 mb-6">Busca y conecta con profesionales legales especializados</p>
            
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, especialidad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white border-gray-300 text-gray-900 placeholder-gray-500 text-base rounded-lg"
                />
              </div>
              <div className="relative md:w-64">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Ubicación..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="pl-12 h-12 bg-white border-gray-300 text-gray-900 placeholder-gray-500 text-base rounded-lg"
                />
              </div>
              <Button
                onClick={() => {}}
                className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Specialization Filter */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Especialidad</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="specialization"
                        value="all"
                        checked={selectedSpecialization === "all"}
                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                        className="w-4 h-4 rounded-full border-gray-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-slate-900 transition-colors font-medium">Todas</span>
                    </label>

                    {specializations.map((spec) => (
                      <label key={spec.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="specialization"
                          value={spec.name}
                          checked={selectedSpecialization === spec.name}
                          onChange={(e) => setSelectedSpecialization(e.target.value)}
                          className="w-4 h-4 rounded-full border-gray-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-slate-900 transition-colors">
                          {getSpecialtyDisplayName(spec.name)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-slate-700" />
                    Ubicación
                  </h3>
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <label key={location} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="location"
                          value={location}
                          checked={selectedLocation === location}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="w-4 h-4 rounded-full border-gray-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-slate-900 transition-colors">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Search Results */}
            <div className="lg:col-span-3">
              <SearchResults searchQuery={searchQuery} filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
