"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Search, Briefcase, TrendingUp, Users, FileText, MessageSquare, Clock, Plus, MapPin, Phone } from "lucide-react"
import { casesService, authService, profilesService, type CaseResource, type LawyerResource } from "@/lib/api"

function Home() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const [recentCases, setRecentCases] = useState<CaseResource[]>([])
  const [userCases, setUserCases] = useState<CaseResource[]>([])
  const [loadingCases, setLoadingCases] = useState(true)
  const [recommendations, setRecommendations] = useState<(CaseResource | LawyerResource)[]>([])
  const [recommendationType, setRecommendationType] = useState<"cases" | "lawyers" | null>(null)
  const [recommendationCase, setRecommendationCase] = useState<CaseResource | null>(null)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [recommendationActionLoading, setRecommendationActionLoading] = useState(false)
  const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/auth/login")
    } else {
      setIsLoggedIn(true)
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        loadUserCases(currentUser)
      }
    }
  }, [router])

  const loadUserCases = async (currentUser: any) => {
    try {
      setLoadingCases(true)
      let cases: any[] = []
      
      // Determinar el rol del usuario y cargar sus casos correspondientes
      const userRole = currentUser.roles?.[0] || currentUser.role || 'ROLE_CLIENT'
      
      if (userRole === 'ROLE_LAWYER') {
        // Si es abogado, obtener casos donde es el abogado asignado
        cases = await casesService.getCasesByLawyer(currentUser.id)
      } else if (userRole === 'ROLE_CLIENT') {
        // Si es cliente, obtener sus propios casos
        cases = await casesService.getCasesByClient(currentUser.id)
      } else if (userRole === 'ROLE_ADMIN') {
        // Si es admin, puede ver todos los casos
        cases = await casesService.getAllCases()
      }
      
      setUserCases(cases)
      setRecentCases(cases.slice(0, 3)) // Mostrar solo los 3 más recientes
      await loadRecommendations(currentUser, cases)
    } catch (error) {
      console.error("Error loading cases:", error)
      setRecentCases([])
      setUserCases([])
      setRecommendations([])
    } finally {
      setLoadingCases(false)
    }
  }

  const loadRecommendations = async (currentUser: any, cachedCases?: CaseResource[]) => {
    const userRole = currentUser.roles?.[0] || currentUser.role || "ROLE_CLIENT"
    setLoadingRecommendations(true)
    setCurrentRecommendationIndex(0)
    try {
      if (userRole === "ROLE_LAWYER") {
        const suggestedCases = await casesService.getSuggestedCases(currentUser.id)
        setRecommendations(suggestedCases)
        setRecommendationType("cases")
        setRecommendationCase(null)
      } else if (userRole === "ROLE_CLIENT") {
        const cases = cachedCases ?? (await casesService.getCasesByClient(currentUser.id))
        const activeCase =
          cases.find((caseItem) => caseItem.status === "OPEN" || caseItem.status === "EVALUATION") || cases[0] || null
        setRecommendationCase(activeCase)
        if (!activeCase) {
          setRecommendations([])
          setRecommendationType("lawyers")
          return
        }

        const [lawyers, invitations] = await Promise.all([
          profilesService.getAllLawyers(),
          casesService.getInvitationsByCase(activeCase.id),
        ])

        const invitedLawyerIds = new Set(invitations.map((invitation) => invitation.lawyerId))
        const availableLawyers = lawyers.filter((lawyer) => !invitedLawyerIds.has(lawyer.userId))

        setRecommendations(availableLawyers)
        setRecommendationType("lawyers")
      } else {
        setRecommendations([])
        setRecommendationType(null)
        setRecommendationCase(null)
      }
    } catch (error) {
      console.error("Error loading recommendations:", error)
      setRecommendations([])
      setRecommendationCase(null)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const currentRecommendation = useMemo(() => {
    if (recommendations.length === 0) return null
    return recommendations[Math.min(currentRecommendationIndex, recommendations.length - 1)]
  }, [currentRecommendationIndex, recommendations])

  const userRole = user?.roles?.[0] || user?.role || "ROLE_CLIENT"

  const goToNextRecommendation = () => {
    setRecommendations((prev) => {
      const updated = prev.filter((_, idx) => idx !== currentRecommendationIndex)
      return updated
    })
    setCurrentRecommendationIndex(0)
  }

  const handleRecommendationSkip = () => {
    goToNextRecommendation()
  }

  const handleRecommendationAccept = async () => {
    if (!user || !currentRecommendation) return
    setRecommendationActionLoading(true)
    try {
      if (recommendationType === "cases" && "id" in currentRecommendation) {
        await casesService.submitApplication({
          caseId: currentRecommendation.id,
          lawyerId: user.id,
          message: "Estoy interesado en este caso",
        })
        toast({
          title: "Postulación enviada",
          description: "El cliente recibirá tu interés.",
        })
      } else if (recommendationType === "lawyers" && recommendationCase && "userId" in currentRecommendation) {
        await casesService.inviteLawyer({
          caseId: recommendationCase.id,
          lawyerId: currentRecommendation.userId,
          message: `Nos gustaría que revises el caso "${recommendationCase.title}".`,
        })
        toast({
          title: "Invitación enviada",
          description: `${currentRecommendation.fullName.firstname} recibirá tu invitación.`,
        })
      }
      goToNextRecommendation()
    } catch (error) {
      console.error("Error performing recommendation action:", error)
      toast({
        title: "Error",
        description: "No pudimos completar la acción. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setRecommendationActionLoading(false)
    }
  }

  const renderCaseRecommendation = (caseItem: CaseResource) => (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Caso sugerido para ti</p>
        <h3 className="text-2xl font-semibold text-gray-900">{caseItem.title}</h3>
        <p className="text-sm text-gray-500">Publicado el {new Date(caseItem.createdAt).toLocaleDateString()}</p>
      </div>
      <p className="text-gray-600">{caseItem.description}</p>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Briefcase className="w-4 h-4 text-slate-700" />
          {caseItem.status}
        </span>
        {caseItem.specialtyId && (
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4 text-slate-700" />
            Especialidad #{caseItem.specialtyId}
          </span>
        )}
      </div>
    </div>
  )

  const renderLawyerRecommendation = (lawyer: LawyerResource) => (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Abogado recomendado</p>
        <h3 className="text-2xl font-semibold text-gray-900">
          {lawyer.fullName.firstname} {lawyer.fullName.lastname}
        </h3>
        <p className="text-sm text-gray-500">{lawyer.specialties?.join(", ") || "Generalista"}</p>
      </div>
      <p className="text-gray-600">{lawyer.description || "Este abogado aún no ha completado su descripción."}</p>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Phone className="w-4 h-4 text-slate-700" />
          {lawyer.contactInfo.phoneNumber || "Sin teléfono"}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-slate-700" />
          {lawyer.contactInfo.address || "Sin dirección"}
        </span>
      </div>
    </div>
  )

  const profileCompleteness = user?.roles?.[0] === 'ROLE_LAWYER' ? 75 : 80

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }


  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-24">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Content - Feed */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Create Post Card - LinkedIn Style (Solo para Clientes) */}
              {user?.roles?.[0] !== 'ROLE_LAWYER' && (
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-sm text-white font-semibold flex-shrink-0">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  <button
                    onClick={() => router.push("/cases/create")}
                      className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors border border-gray-200"
                    >
                      ¿Necesitas ayuda legal? Crea un caso
                  </button>
                </div>
                </div>
              )}


              {/* Smart Recommendations */}
              {user && (
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {userRole === "ROLE_LAWYER" ? "Casos para ti" : "Abogados sugeridos"}
                      </p>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {userRole === "ROLE_LAWYER" ? "Recomendaciones inteligentes" : "Conecta con especialistas"}
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => user && loadRecommendations(user, userCases)}
                      className="text-sm"
                    >
                      Actualizar
                    </Button>
                  </div>
                  <div className="p-6">
                    {loadingRecommendations ? (
                      <div className="text-center text-gray-500">Buscando recomendaciones...</div>
                    ) : recommendations.length === 0 || !currentRecommendation ? (
                      <div className="text-center text-gray-500 text-sm">
                        {userRole === "ROLE_LAWYER"
                          ? "No hay casos sugeridos en este momento."
                          : recommendationCase
                          ? "No tenemos abogados disponibles para tu caso ahora mismo."
                          : "Crea un caso para recibir sugerencias de abogados."}
                      </div>
                    ) : (
                      <>
                        {recommendationType === "cases" && "clientId" in currentRecommendation
                          ? renderCaseRecommendation(currentRecommendation)
                          : recommendationType === "lawyers" && "userId" in currentRecommendation
                          ? renderLawyerRecommendation(currentRecommendation)
                          : null}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                          <Button variant="secondary" className="flex-1" onClick={handleRecommendationSkip}>
                            Omitir
                          </Button>
                          <Button
                            className="flex-1 bg-slate-900 hover:bg-slate-800"
                            onClick={handleRecommendationAccept}
                            disabled={recommendationActionLoading}
                          >
                            {recommendationType === "cases" ? "Me interesa" : "Invitar"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {currentRecommendationIndex + 1} de {recommendations.length}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* My Cases Preview */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Mis Casos Recientes</h2>
                  <Link href="/cases" className="text-sm text-slate-900 font-medium hover:text-slate-700">
                    Ver todos mis casos
                  </Link>
                </div>
                <div className="divide-y divide-gray-200">
                  {loadingCases ? (
                    <div className="p-6 text-center text-gray-500">
                      Cargando casos...
                    </div>
                  ) : recentCases.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No tienes casos activos
                    </div>
                  ) : (
                    recentCases.map((caseItem) => (
                      <Link
                        key={caseItem.id}
                        href={`/cases/${caseItem.id}`}
                        className="block p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{caseItem.title}</h3>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                            {caseItem.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{caseItem.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(caseItem.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                {user?.roles?.[0] !== 'ROLE_LAWYER' && (
                <div className="p-4 bg-gray-50">
                  <Link href="/cases/create" aria-label="Crear nuevo caso" className="block">
                    <Button className="w-full bg-slate-900 text-white h-12 text-sm font-semibold hover:bg-slate-800 transition-colors rounded-lg flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>Crear Nuevo Caso</span>
                    </Button>
                  </Link>
                </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile Summary with Progress */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-2xl text-white font-bold mx-auto mb-3">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <h3 className="font-semibold text-gray-900">{user?.username || 'Usuario'}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {user?.roles?.[0] === "ROLE_LAWYER" 
                      ? "Abogado Profesional" 
                      : user?.roles?.[0] === "ROLE_ADMIN" 
                      ? "Administrador" 
                      : "Cliente"}
                  </p>
                  
                  {/* Profile Completeness */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Perfil completo</span>
                      <span>{profileCompleteness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-slate-900 h-2 rounded-full transition-all"
                        style={{ width: `${profileCompleteness}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {profileCompleteness < 100 ? 'Completa tu perfil para destacar' : '¡Perfil completo!'}
                    </p>
                  </div>

                  <Button
                    onClick={() => router.push("/profile")}
                    className="w-full bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    Ver mi perfil
                  </Button>
                </div>
              </div>

              {/* Quick Access based on Role */}
              {user?.roles?.[0] === 'ROLE_LAWYER' ? (
              <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Casos Abiertos</h3>
                    <Briefcase className="w-5 h-5 text-slate-700" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Postula a casos disponibles y amplía tu cartera
                  </p>
                  <Button
                    onClick={() => router.push("/cases/available")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm"
                  >
                    Ver casos disponibles
                  </Button>
                </div>
              ) : null}

              {/* Footer Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Recursos</h3>
                <div className="space-y-2 text-sm">
                  <Link href="/help" className="block text-gray-600 hover:text-slate-900">Centro de ayuda</Link>
                  <Link href="/about" className="block text-gray-600 hover:text-slate-900">Acerca de</Link>
                  <Link href="/terms" className="block text-gray-600 hover:text-slate-900">Términos de uso</Link>
                  <Link href="/privacy" className="block text-gray-600 hover:text-slate-900">Privacidad</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Home
