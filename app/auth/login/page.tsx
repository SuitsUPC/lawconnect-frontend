"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/api"

function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await authService.signIn({
        username: formData.username,
        password: formData.password,
      })

      toast({
        title: "Sesión iniciada",
        description: `Bienvenido ${user.username}!`,
      })

      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.response?.data?.message || "Credenciales inválidas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Info section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-16 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">LawConnect</h1>
          <p className="text-slate-300 text-lg">Plataforma profesional para servicios legales</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-2">Red de abogados verificados</h3>
            <p className="text-slate-400 text-sm">
              Conecta con profesionales del derecho certificados y amplía tu red de contactos
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Gestión eficiente de casos</h3>
            <p className="text-slate-400 text-sm">
              Administra y colabora en todos tus asuntos legales desde una plataforma centralizada
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Acceso a especialistas</h3>
            <p className="text-slate-400 text-sm">
              Encuentra abogados expertos en diferentes áreas del derecho según tus necesidades
            </p>
          </div>
        </div>

        <div className="text-slate-500 text-sm">
          © 2024 LawConnect. Todos los derechos reservados.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600">Accede a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-slate-700 hover:text-slate-900">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 text-base font-medium hover:bg-slate-800 transition-colors"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/signup" className="text-slate-900 font-medium hover:text-slate-700">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
