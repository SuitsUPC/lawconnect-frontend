"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { authService, profilesService, casesService, type LawyerResource, type ClientResource, type LawyerSpecialtyResource, type CaseResource } from "@/lib/api"
import { User, Edit2, Save, X, Briefcase, Phone, MapPin, FileText, IdCard, Calendar, CheckCircle, Clock, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lawyerProfile, setLawyerProfile] = useState<LawyerResource | null>(null)
  const [clientProfile, setClientProfile] = useState<ClientResource | null>(null)
  const [cases, setCases] = useState<CaseResource[]>([])
  const [loadingCases, setLoadingCases] = useState(false)
  const [availableSpecialties, setAvailableSpecialties] = useState<LawyerSpecialtyResource[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [editForm, setEditForm] = useState({
    firstname: "",
    lastname: "",
    dni: "",
    phoneNumber: "",
    address: "",
    description: "",
  })

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/login")
      return
    }

    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      
      // Si es abogado, cargar su perfil y especialidades
      if (currentUser.roles?.[0] === 'ROLE_LAWYER') {
        loadLawyerProfile(currentUser.id)
        loadSpecialties()
        loadLawyerCases(currentUser.id)
      } else if (currentUser.roles?.[0] === 'ROLE_CLIENT') {
        loadClientProfile(currentUser.id)
        loadClientCases(currentUser.id)
      }
    }
    setLoading(false)
  }, [router])

  const loadLawyerProfile = async (userId: string) => {
    try {
      const lawyers = await profilesService.getAllLawyers()
      const profile = lawyers.find(l => l.userId === userId)
      
      if (profile) {
        setLawyerProfile(profile)
        setSelectedSpecialties(profile.specialties || [])
        setEditForm({
          firstname: profile.fullName.firstname,
          lastname: profile.fullName.lastname,
          dni: profile.dni,
          phoneNumber: profile.contactInfo.phone,
          address: profile.contactInfo.address,
          description: profile.description || "",
        })
      }
    } catch (error) {
      console.error("Error loading lawyer profile:", error)
    }
  }

  const loadClientProfile = async (userId: string) => {
    try {
      const clients = await profilesService.getAllClients()
      const profile = clients.find(c => c.userId === userId)
      
      if (profile) {
        setClientProfile(profile)
        setEditForm({
          firstname: profile.fullName.firstname,
          lastname: profile.fullName.lastname,
          dni: profile.dni,
          phoneNumber: profile.contactInfo.phoneNumber,
          address: profile.contactInfo.address,
          description: "",
        })
      }
    } catch (error) {
      console.error("Error loading client profile:", error)
    }
  }

  const loadSpecialties = async () => {
    try {
      const specialties = await profilesService.getAllSpecialties()
      setAvailableSpecialties(specialties)
    } catch (error) {
      console.error("Error loading specialties:", error)
    }
  }

  const loadLawyerCases = async (userId: string) => {
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

  const loadClientCases = async (userId: string) => {
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

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Restaurar datos originales
    if (user?.roles?.[0] === 'ROLE_LAWYER' && lawyerProfile) {
      setEditForm({
        firstname: lawyerProfile.fullName.firstname,
        lastname: lawyerProfile.fullName.lastname,
        dni: lawyerProfile.dni,
        phoneNumber: lawyerProfile.contactInfo.phone,
        address: lawyerProfile.contactInfo.address,
        description: lawyerProfile.description || "",
      })
      setSelectedSpecialties(lawyerProfile.specialties || [])
    } else if (user?.roles?.[0] === 'ROLE_CLIENT' && clientProfile) {
      setEditForm({
        firstname: clientProfile.fullName.firstname,
        lastname: clientProfile.fullName.lastname,
        dni: clientProfile.dni,
        phoneNumber: clientProfile.contactInfo.phoneNumber,
        address: clientProfile.contactInfo.address,
        description: "",
      })
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      
      // Validaciones básicas
      if (!editForm.firstname || !editForm.lastname || !editForm.dni) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa nombre, apellido y DNI",
          variant: "destructive",
        })
        return
      }
      
      // Si es abogado, actualizar perfil y especialidades
      if (user.roles?.[0] === 'ROLE_LAWYER') {
        // TODO: Crear endpoint para actualizar perfil completo de abogado
        await profilesService.updateLawyerSpecialties(user.id, selectedSpecialties)
        await loadLawyerProfile(user.id)
        
        toast({
          title: "Perfil actualizado",
          description: "Tu información ha sido actualizada correctamente",
        })
      } else if (user.roles?.[0] === 'ROLE_CLIENT') {
        // TODO: Crear endpoint para actualizar perfil de cliente
        toast({
          title: "Función en desarrollo",
          description: "La actualización de perfil de cliente estará disponible próximamente",
          variant: "destructive",
        })
      }
      
      setIsEditing(false)
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.response?.data?.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialty)) {
        return prev.filter(s => s !== specialty)
      } else {
        return [...prev, specialty]
      }
    })
  }

  const getSpecialtyDisplayName = (specialty: string) => {
    const nameMap: { [key: string]: string } = {
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
    return nameMap[specialty] || specialty
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

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="pt-20">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="text-center text-gray-500">Cargando perfil...</div>
          </div>
        </div>
      </div>
    )
  }

  const profile = lawyerProfile || clientProfile
  const isLawyer = !!lawyerProfile

  if (!profile || !user) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="pt-20">
          <div className="max-w-5xl mx-auto px-4 py-8">
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
                    {editForm.firstname[0]}{editForm.lastname[0]}
                  </div>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={handleEdit}
                    className="bg-slate-900 text-white hover:bg-slate-800 mb-2"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <div className="flex gap-2 mb-2">
                    <Button
                      onClick={handleCancel}
                      variant="secondary"
                      disabled={saving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Name & Role */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={editForm.firstname}
                        onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
                        className="text-4xl font-bold border-0 border-b-2 border-gray-300 focus:border-slate-900 rounded-none px-0"
                        placeholder="Nombre"
                      />
                      <Input
                        type="text"
                        value={editForm.lastname}
                        onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                        className="text-4xl font-bold border-0 border-b-2 border-gray-300 focus:border-slate-900 rounded-none px-0"
                        placeholder="Apellido"
                      />
                    </div>
                  ) : (
                    `${editForm.firstname} ${editForm.lastname}`
                  )}
                </h1>
                <p className="text-xl text-gray-600 font-medium mb-3">
                  {isLawyer ? 'Abogado Profesional' : 'Cliente'}
                </p>
                
                {/* Specialties Tags */}
                {isLawyer && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {!isEditing ? (
                      selectedSpecialties.length > 0 ? (
                        selectedSpecialties.map((specialty: string) => (
                          <span key={specialty} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">
                            {getSpecialtyDisplayName(specialty)}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No hay especialidades seleccionadas</span>
                      )
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium">Especialidades:</p>
                        <div className="flex flex-wrap gap-2">
                          {availableSpecialties.map((specialty) => (
                            <button
                              key={specialty.name}
                              onClick={() => toggleSpecialty(specialty.name)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                selectedSpecialties.includes(specialty.name)
                                  ? "bg-slate-900 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {getSpecialtyDisplayName(specialty.name)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {isLawyer && (
                  <div className="mt-3">
                    {isEditing ? (
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full border-gray-300 focus:border-slate-900"
                        placeholder="Describe tu experiencia y áreas de especialización"
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-700 text-base leading-relaxed">
                        {editForm.description || "Sin descripción"}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <IdCard className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium uppercase">DNI</p>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editForm.dni}
                        onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                        className="border-gray-300 focus:border-slate-900 mt-1"
                        placeholder="12345678A"
                      />
                    ) : (
                      <p className="text-base font-semibold text-gray-900">{editForm.dni}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium uppercase">Teléfono</p>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="border-gray-300 focus:border-slate-900 mt-1"
                        placeholder="+51 987654321"
                      />
                    ) : (
                      <p className="text-base font-semibold text-gray-900">{editForm.phoneNumber}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium uppercase">Dirección</p>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="border-gray-300 focus:border-slate-900 mt-1"
                        placeholder="Tu dirección completa"
                      />
                    ) : (
                      <p className="text-base font-semibold text-gray-900">{editForm.address}</p>
                    )}
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
                    ? 'Aún no has sido asignado a ningún caso.' 
                    : 'Aún no has creado ningún caso.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
