"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { casesService, authService, profilesService, type LawyerSpecialtyResource } from "@/lib/api"
import { FileText, FileCheck, ArrowLeft, Briefcase, Upload, X } from "lucide-react"

function CreateCasePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [specialties, setSpecialties] = useState<LawyerSpecialtyResource[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    specialtyId: "",
  })

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      router.push("/auth/login")
      return
    }

    // Verificar que solo clientes puedan crear casos
    const currentUser = authService.getCurrentUser()
    if (currentUser?.roles?.[0] === 'ROLE_LAWYER') {
      toast({
        title: "Acceso denegado",
        description: "Los abogados no pueden crear casos. Los clientes crean casos y los abogados postulan a ellos.",
        variant: "destructive",
      })
      router.push("/cases/available")
      return
    }

    // Load specialties
    const loadSpecialties = async () => {
      try {
        const data = await profilesService.getAllSpecialties()
        setSpecialties(data)
      } catch (error) {
        console.error("Error loading specialties:", error)
      }
    }

    loadSpecialties()
  }, [router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const validFiles = files.filter(file => {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
        const maxSize = 10 * 1024 * 1024 // 10MB
        return validTypes.includes(file.type) && file.size <= maxSize
      })

      if (validFiles.length !== files.length) {
        toast({
          title: "Archivos inválidos",
          description: "Algunos archivos no son válidos. Solo se aceptan PDF, Word e imágenes (máx. 10MB)",
          variant: "destructive",
        })
      }

      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Función para traducir especialidades
  const getSpecialtyDisplayName = (specialtyName: string): string => {
    const specialtyMap: { [key: string]: string } = {
      'CRIMINAL_LAW': 'Derecho Penal',
      'CIVIL_LITIGATION': 'Derecho Civil',
      'LABOR_LAW': 'Derecho Laboral',
      'FAMILY_LAW': 'Derecho de Familia',
      'CORPORATE_LAW': 'Derecho Corporativo',
      'TAX_LAW': 'Derecho Tributario',
      'IMMIGRATION_LAW': 'Derecho Migratorio',
      'REAL_ESTATE_LAW': 'Derecho Inmobiliario',
      'INTELLECTUAL_PROPERTY': 'Propiedad Intelectual',
      'ENVIRONMENTAL_LAW': 'Derecho Ambiental',
      'EMPLOYMENT_LAW': 'Derecho Laboral',
      'BANKRUPTCY_LAW': 'Derecho Concursal',
      'PERSONAL_INJURY': 'Daños Personales',
      'MEDICAL_MALPRACTICE': 'Mala Praxis Médica',
      'ESTATE_PLANNING': 'Planificación Patrimonial',
      'ELDER_LAW': 'Derecho de la Tercera Edad',
      'CONSTITUTIONAL_LAW': 'Derecho Constitucional',
      'INTERNATIONAL_LAW': 'Derecho Internacional',
      'SECURITIES_LAW': 'Derecho de Valores',
      'CONSUMER_PROTECTION': 'Protección al Consumidor',
      'CONTRACT_LAW': 'Derecho Contractual',
      'EDUCATION_LAW': 'Derecho Educativo',
      'ENTERTAINMENT_LAW': 'Derecho del Entretenimiento',
      'SPORTS_LAW': 'Derecho Deportivo',
      'MILITARY_LAW': 'Derecho Militar',
      'ADMINISTRATIVE_LAW': 'Derecho Administrativo',
      'HEALTHCARE_LAW': 'Derecho Sanitario',
      'INSURANCE_LAW': 'Derecho de Seguros',
      'CONSTRUCTION_LAW': 'Derecho de la Construcción',
      'MARITIME_LAW': 'Derecho Marítimo',
      'HUMAN_RIGHTS_LAW': 'Derechos Humanos',
      'SOCIAL_SECURITY_LAW': 'Derecho de la Seguridad Social',
      'PRODUCT_LIABILITY': 'Responsabilidad de Productos',
      'MUNICIPAL_LAW': 'Derecho Municipal',
      'AGRICULTURAL_LAW': 'Derecho Agrario',
      'CYBER_LAW': 'Derecho Cibernético',
      'DATA_PRIVACY_LAW': 'Derecho de Protección de Datos',
      'AVIATION_LAW': 'Derecho Aeronáutico',
      'ANIMAL_LAW': 'Derecho Animal',
    }
    return specialtyMap[specialtyName] || specialtyName
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      if (!formData.specialtyId) {
        toast({
          title: "Especialidad requerida",
          description: "Por favor selecciona una especialidad legal para tu caso",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Crear el caso
      const caseData = await casesService.createCase({
        title: formData.title,
        description: formData.description,
        clientId: user.id,
        specialtyId: Number(formData.specialtyId),
      })

      // Subir archivos si hay alguno
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          try {
            // Intentar subir archivo real usando el nuevo endpoint
            await casesService.uploadDocumentFile(caseData.id, user.id, file)
          } catch (uploadError: any) {
            // Si falla, intentar con el método antiguo (JSON con metadatos)
            console.warn("Error uploading file directly, trying with metadata:", uploadError)
            
            // Convertir a base64 como fallback
            return new Promise<void>((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = async () => {
                try {
                  const base64String = reader.result as string
                  await casesService.uploadDocument(
                    caseData.id,
                    user.id,
                    {
                      filename: file.name,
                      fileUrl: base64String,
                      fileSize: file.size,
                      fileType: file.type,
                    }
                  )
                  resolve()
                } catch (error) {
                  console.error("Error uploading file with metadata:", error)
                  reject(error)
                }
              }
              reader.onerror = () => reject(new Error("Error reading file"))
              reader.readAsDataURL(file)
            })
          }
        })
        
        try {
          await Promise.all(uploadPromises)
        } catch (uploadError) {
          console.error("Error uploading some files:", uploadError)
          // El caso ya fue creado, así que continuamos
        }
      }

      toast({
        title: "Caso creado",
        description: "Tu caso ha sido creado exitosamente",
      })
      router.push(`/cases/${caseData.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear caso",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-20">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-slate-900 mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Volver</span>
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-slate-900 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Crear Nuevo Caso
                </h1>
                <p className="text-gray-600 mt-1">
                  Proporciona los detalles de tu caso legal para encontrar el abogado perfecto
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-slate-900 px-8 py-6">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-white" />
                <h2 className="text-lg font-semibold text-white">
                  Información del Caso
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Título del Caso */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileText className="w-4 h-4 text-slate-900" />
                  Título del Caso
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ej: Disputa Contractual, Divorcio, Accidente de Tránsito..."
                  className="w-full h-12 px-4 text-base bg-white border-gray-300 text-slate-900 placeholder-gray-400 focus:border-slate-900 focus:ring-slate-900 rounded-lg transition-all"
                  required
                />
                <p className="text-xs text-gray-500">
                  Proporciona un título claro y descriptivo para tu caso
                </p>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileCheck className="w-4 h-4 text-slate-900" />
                  Descripción Detallada
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe los detalles de tu caso legal. Incluye información relevante como fechas, personas involucradas, documentos, y cualquier otro detalle importante que pueda ayudar al abogado a entender tu situación..."
                  className="w-full min-h-[160px] px-4 py-3 text-base bg-white border-gray-300 text-slate-900 placeholder-gray-400 focus:border-slate-900 focus:ring-slate-900 rounded-lg resize-y transition-all"
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500">
                  Cuanta más información proporciones, mejor podrán los abogados entender tu caso
                </p>
              </div>

              {/* Especialidad Legal */}
              <div className="space-y-2">
                <label htmlFor="specialtyId" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Briefcase className="w-4 h-4 text-slate-900" />
                  Especialidad Legal Requerida
                </label>
                <div className="relative">
                  <select
                    id="specialtyId"
                    name="specialtyId"
                    value={formData.specialtyId}
                    onChange={handleChange}
                    className="w-full h-12 pl-4 pr-10 text-base bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition-all appearance-none cursor-pointer hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="" disabled hidden>
                      Selecciona una especialidad legal
                    </option>
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {getSpecialtyDisplayName(specialty.name)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Selecciona el área legal que mejor se adapte a tu caso
                </p>
              </div>

              {/* Subida de Archivos */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Upload className="w-4 h-4 text-slate-900" />
                  Documentos Adjuntos (Opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">
                      Haz clic para subir documentos
                    </span>
                    <span className="text-xs text-gray-500">
                      PDF, Word, imágenes (máx. 10MB)
                    </span>
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Puedes adjuntar documentos relevantes como contratos, imágenes, o archivos PDF
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creando caso...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5" />
                      Crear Caso
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 h-12 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold rounded-lg transition-all duration-200"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateCasePage
