"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function LawyerProfileRedirect() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  useEffect(() => {
    // Redirigir a la nueva página de perfil público con casos
    if (userId) {
      router.replace(`/profile/${userId}`)
    }
  }, [userId, router])

  // Mostrar loading mientras se redirecciona
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Redirigiendo al perfil...</p>
      </div>
    </div>
  )
}
