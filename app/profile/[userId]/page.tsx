"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { authService, profilesService, casesService, type LawyerResource, type ClientResource, type CaseResource } from "@/lib/api"
import { User, Mail, Briefcase, Phone, MapPin, FileText, IdCard, Edit2, Calendar, CheckCircle, Clock, XCircle, FileText as FileIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const userId = params.userId as string
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lawyerProfile, setLawyerProfile] = useState<LawyerResource | null>(null)
  const [clientProfile, setClientProfile] = useState<ClientResource | null>(null)
  const [cases, setCases] = useState<CaseResource[]>([])
  const [loadingCases, setLoadingCases] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/login")
      return
    }

    const user = authService.getCurrentUser()
    if (user) {
      setCurrentUser(user)
      setIsOwner(user.id === userId)
    }

    loadProfile()
  }, [userId, router])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Intentar cargar como abogado primero
      const lawyers = await profilesService.getAllLawyers()
      const lawyer = lawyers.find((l: any) => l.userId === userId)
      
      if (lawyer) {
        setLawyerProfile(lawyer)
        await loadLawyerCases()
      } else {
        // Si no es abogado, cargar como cliente
        const clients = await profilesService.getAllClients()
        const client = clients.find((c: any) => c.userId === userId)
        
        if (client) {
          setClientProfile(client)
          await loadClientCases()
        } else {
          toast({
            title: "Perfil no encontrado",
            description: "No se pudo encontrar el perfil del usuario",
            variant: "destructive",
          })
          router.push("/")
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadLawyerCases = async () => {
    try {
      setLoadingCases(true)
      const allCases = await casesService.getAllCases()
      // Filtrar casos donde el abogado está asignado (casos atendidos)
      const lawyerCases = allCases.filter((c: CaseResource) => c.assignedLawyerId === userId)
      // Ordenar por fecha más reciente
      const sortedCases = lawyerCases.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setCases(sortedCases)
    } catch (error) {
      console.error("Error loading lawyer cases:", error)
    } finally {
      setLoadingCases(false)
    }
  }

  const loadClientCases = async () => {
    try {
      setLoadingCases(true)
      const allCases = await casesService.getAllCases()
      // Filtrar TODOS los casos del cliente (sin importar el estado)
      const clientCases = allCases.filter((c: CaseResource) => c.clientId === userId)
      // Ordenar por fecha más reciente
      const sortedCases = clientCases.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setCases(sortedCases)
    } catch (error) {
      console.error("Error loading client cases:", error)
    } finally {
      setLoadingCases(false)
    }
  }

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      OPEN: "bg-blue-50 text-blue-700 border-blue-200",
      EVALUATION: "bg-yellow-50 text-yellow-700 border-yellow-200",
      ACCEPTED: "bg-green-50 text-green-700 border-green-200",
      CLOSED: "bg-gray-50 text-gray-700 border-gray-200",
      CANCELED: "bg-red-50 text-red-700 border-red-200",
    }
    return statusMap[status] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  const getStatusLabel = (status: string) => {
    const labelMap: { [key: string]: string } = {
      OPEN: "Abierto",
      EVALUATION: "En Evaluación",
      ACCEPTED: "Aceptado",
      CLOSED: "Cerrado",
      CANCELED: "Cancelado",
    }
    return labelMap[status] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Clock className="w-4 h-4" />
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4" />
      case 'CLOSED':
        return <CheckCircle className="w-4 h-4" />
      case 'CANCELED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

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
    }
    return specialtyMap[specialty] || specialty
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center text-gray-500">Cargando perfil...</div>
          </div>
        </div>
      </div>
    )
  }

  const profile = lawyerProfile || clientProfile
  const isLawyer = !!lawyerProfile

  if (!profile) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center text-gray-500">Perfil no encontrado</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Cover Banner */}
            <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900"></div>
            
            {/* Profile Content */}
            <div className="px-8 pb-8">
              {/* Avatar & Edit Button Row */}
              <div className="flex items-end justify-between -mt-16 mb-6">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white text-4xl font-bold">
                    {profile.fullName.firstname[0]}{profile.fullName.lastname[0]}
                  </div>
                </div>
                {isOwner && (
                  <Button
                    onClick={() => router.push("/profile")}
                    className="bg-slate-900 text-white hover:bg-slate-800 mb-2"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                )}
              </div>

              {/* Name & Role */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {profile.fullName.firstname} {profile.fullName.lastname}
                </h1>
                <p className="text-xl text-gray-600 font-medium mb-3">
                  {isLawyer ? 'Abogado Profesional' : 'Cliente'}
                </p>
                
                {/* Specialties Tags */}
                {isLawyer && lawyerProfile.specialties && lawyerProfile.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lawyerProfile.specialties.map((specialty: string) => (
                      <span key={specialty} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">
                        {getSpecialtyDisplayName(specialty)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {isLawyer && lawyerProfile.description && (
                  <p className="text-gray-700 text-base leading-relaxed mt-3">
                    {lawyerProfile.description}
                  </p>
                )}
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <IdCard className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">DNI</p>
                    <p className="text-base font-semibold text-gray-900">{profile.dni}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Teléfono</p>
                    <p className="text-base font-semibold text-gray-900">
                      {isLawyer && lawyerProfile 
                        ? lawyerProfile.contactInfo.phoneNumber 
                        : clientProfile?.contactInfo.phoneNumber || 'No disponible'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Dirección</p>
                    <p className="text-base font-semibold text-gray-900">{profile.contactInfo.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Casos Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLawyer ? 'Casos Atendidos' : 'Historial de Casos'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isLawyer 
                    ? 'Casos donde ha sido asignado como abogado' 
                    : 'Todos los casos creados, abiertos y cerrados'}
                </p>
              </div>
              {cases.length > 0 && (
                <div className="px-4 py-2 bg-slate-100 rounded-lg">
                  <span className="text-2xl font-bold text-slate-900">{cases.length}</span>
                  <span className="text-sm text-gray-600 ml-2">casos</span>
                </div>
              )}
            </div>
            
            {loadingCases ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-gray-500 mt-3">Cargando casos...</p>
              </div>
            ) : cases.length > 0 ? (
              <div className="space-y-3">
                {cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="group p-5 border-2 border-gray-200 rounded-xl hover:border-slate-900 hover:shadow-md transition-all cursor-pointer bg-white"
                    onClick={() => router.push(`/cases/${caseItem.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-slate-900">
                            {caseItem.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(caseItem.status)}`}>
                            {getStatusIcon(caseItem.status)}
                            {getStatusLabel(caseItem.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {caseItem.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-4 h-4" />
                            Creado: {new Date(caseItem.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          {caseItem.updatedAt !== caseItem.createdAt && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="w-4 h-4" />
                              Actualizado: {new Date(caseItem.updatedAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isLawyer ? 'No hay casos atendidos' : 'No hay casos creados'}
                </h3>
                <p className="text-gray-500">
                  {isLawyer 
                    ? 'Este abogado aún no ha sido asignado a ningún caso.' 
                    : 'Este cliente aún no ha creado ningún caso.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

