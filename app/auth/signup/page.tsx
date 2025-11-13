"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/api"

function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    userType: "ROLE_CLIENT", // ROLE_CLIENT o ROLE_LAWYER
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await authService.signUp({
        username: formData.username,
        password: formData.password,
        role: formData.userType, // El backend espera 'role' como string, no 'roles' como array
      })

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Por favor inicia sesión.",
      })

      router.push("/auth/login")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al registrarse",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
            <p className="text-gray-600">Únete a la comunidad legal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="tu_usuario"
                className="w-full bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cuenta
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="ROLE_CLIENT">Cliente - Busco servicios legales</option>
                <option value="ROLE_LAWYER">Abogado - Ofrezco servicios legales</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className="w-full bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 text-base font-medium hover:bg-slate-800 transition-colors"
            >
              {loading ? "Creando tu cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-slate-900 font-medium hover:text-slate-700">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Info section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-16 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">Únete a LawConnect</h1>
          <p className="text-slate-300 text-lg">
            Plataforma integral para profesionales y clientes del sector legal
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-2">Comunidad verificada</h3>
            <p className="text-slate-400 text-sm">
              Accede a una red de abogados certificados y clientes verificados en toda la plataforma
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Gestión centralizada</h3>
            <p className="text-slate-400 text-sm">
              Administra documentos, casos y comunicaciones desde un único panel de control
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Seguridad garantizada</h3>
            <p className="text-slate-400 text-sm">
              Tus datos están protegidos con los más altos estándares de seguridad y confidencialidad
            </p>
          </div>
        </div>

        <div className="text-slate-500 text-sm">
          Al registrarte aceptas los términos y condiciones
        </div>
      </div>
    </div>
  )
}

export default SignupPage
