"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Search, Briefcase, TrendingUp, Users, FileText, MessageSquare, Clock, Plus } from "lucide-react"
import { casesService, authService, type CaseResource } from "@/lib/api"

function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const [recentCases, setRecentCases] = useState<CaseResource[]>([])
  const [loadingCases, setLoadingCases] = useState(true)

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
      
      setRecentCases(cases.slice(0, 3)) // Mostrar solo los 3 más recientes
    } catch (error) {
      console.error("Error loading cases:", error)
      setRecentCases([])
    } finally {
      setLoadingCases(false)
    }
  }


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
                  <Button
                    onClick={() => router.push("/cases/create")}
                    className="w-full bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Nuevo Caso
                  </Button>
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
              ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Encuentra Abogados</h3>
                    <Users className="w-5 h-5 text-slate-700" />
                </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Busca especialistas para tu caso legal
                  </p>
                  <Button
                    onClick={() => router.push("/search")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm"
                  >
                    Buscar abogados
                  </Button>
                </div>
              )}

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
