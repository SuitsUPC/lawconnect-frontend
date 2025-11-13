"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  FileText, Clock, User, Upload, MessageSquare, Send, 
  History, CheckCircle, AlertCircle, Download, X 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Navbar from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import { casesService, authService, profilesService, type CaseResource, type CommentResource } from "@/lib/api"
import { API_BASE_URL } from "@/lib/api/config"

type Tab = 'overview' | 'documents' | 'messages' | 'activity'

function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const caseId = params.id as string

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [caseData, setCaseData] = useState<CaseResource | null>(null)
  const [comments, setComments] = useState<CommentResource[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [applicationsWithNames, setApplicationsWithNames] = useState<any[]>([])
  const [clientName, setClientName] = useState<string>("")
  const [lawyerName, setLawyerName] = useState<string>("")
  const [uploaderNames, setUploaderNames] = useState<{ [key: string]: string }>({})
  const [commentAuthorNames, setCommentAuthorNames] = useState<{ [key: string]: string }>({})
  const [newMessage, setNewMessage] = useState("")
  const [applicationMessage, setApplicationMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'documents' | 'comments'>('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/login")
      return
    }

    const fetchCase = async () => {
      try {
        const data = await casesService.getCaseById(caseId)
        
        // Validar permisos de acceso
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          const userRole = currentUser.roles?.[0] || 'ROLE_CLIENT'
          
          // Clientes solo pueden ver sus propios casos
          if (userRole === 'ROLE_CLIENT' && data.clientId !== currentUser.id) {
            toast({
              title: "Acceso Denegado",
              description: "No tienes permiso para ver este caso",
              variant: "destructive"
            })
            router.push("/cases")
            return
          }
          
          // Abogados solo pueden ver casos asignados a ellos o casos OPEN
          if (userRole === 'ROLE_LAWYER') {
            const isAssignedToLawyer = data.assignedLawyerId === currentUser.id
            const isOpenCase = data.status === 'OPEN'
            
            if (!isAssignedToLawyer && !isOpenCase) {
              toast({
                title: "Acceso Denegado",
                description: "Este caso está asignado a otro abogado",
                variant: "destructive"
              })
              router.push("/cases")
              return
            }
          }
        }
        
        setCaseData(data)

        // Cargar nombre del cliente
        if (data.clientId) {
          try {
            const clientProfile = await profilesService.getClientByUserId(data.clientId)
            setClientName(`${clientProfile.fullName.firstname} ${clientProfile.fullName.lastname}`)
          } catch (error) {
            console.log("Client profile not found, usando ID")
            setClientName(`Cliente (${data.clientId.substring(0, 8)}...)`)
          }
        }

        // Cargar nombre del abogado si está asignado
        if (data.assignedLawyerId) {
          try {
            const lawyerProfile = await profilesService.getLawyerByUserId(data.assignedLawyerId)
            setLawyerName(`${lawyerProfile.fullName.firstname} ${lawyerProfile.fullName.lastname}`)
          } catch (error) {
            console.log("Lawyer profile not found, usando ID")
            setLawyerName(`Abogado (${data.assignedLawyerId.substring(0, 8)}...)`)
          }
        }

        // Fetch comments
        try {
          const commentsData = await casesService.getCommentsByCase(caseId)
          setComments(commentsData)
          
          // Obtener nombres de los autores de comentarios
          const commentNamesMap: { [key: string]: string } = {}
          const uniqueCommentAuthorIds = [...new Set(commentsData.map((comment: any) => comment.authorId))]
          
          for (const authorId of uniqueCommentAuthorIds) {
            try {
              // Intentar obtener como abogado primero
              try {
                const lawyerProfile = await profilesService.getLawyerByUserId(authorId)
                commentNamesMap[authorId] = `${lawyerProfile.fullName.firstname} ${lawyerProfile.fullName.lastname}`
              } catch (lawyerError) {
                // Si no es abogado, intentar como cliente
                try {
                  const clientProfile = await profilesService.getClientByUserId(authorId)
                  commentNamesMap[authorId] = `${clientProfile.fullName.firstname} ${clientProfile.fullName.lastname}`
                } catch (clientError) {
                  // Si no se encuentra, usar el ID
                  commentNamesMap[authorId] = `Usuario (${authorId.substring(0, 8)}...)`
                }
              }
            } catch (error) {
              console.error(`Error loading profile for comment author ${authorId}:`, error)
              commentNamesMap[authorId] = `Usuario (${authorId.substring(0, 8)}...)`
            }
          }
          
          setCommentAuthorNames(commentNamesMap)
        } catch (error) {
          console.log("No comments found for this case")
        }
      } catch (error) {
        console.error("Error:", error)
        router.push("/cases")
      } finally {
        setLoading(false)
      }
    }

    fetchCase()
  }, [caseId, router])

  // Cargar documentos cuando se selecciona el tab
  useEffect(() => {
    if (activeTab === 'documents' && !loadingDocuments && documents.length === 0) {
      const fetchDocuments = async () => {
        try {
          setLoadingDocuments(true)
          const docs = await casesService.getDocumentsByCase(caseId)
          setDocuments(docs)
          
          // Obtener nombres de los usuarios que subieron los documentos
          const namesMap: { [key: string]: string } = {}
          const uniqueUploaderIds = [...new Set(docs.map((doc: any) => doc.uploadedBy))]
          
          for (const uploaderId of uniqueUploaderIds) {
            try {
              // Intentar obtener como abogado primero
              try {
                const lawyerProfile = await profilesService.getLawyerByUserId(uploaderId)
                namesMap[uploaderId] = `${lawyerProfile.fullName.firstname} ${lawyerProfile.fullName.lastname}`
              } catch (lawyerError) {
                // Si no es abogado, intentar como cliente
                try {
                  const clientProfile = await profilesService.getClientByUserId(uploaderId)
                  namesMap[uploaderId] = `${clientProfile.fullName.firstname} ${clientProfile.fullName.lastname}`
                } catch (clientError) {
                  // Si no se encuentra, usar el ID
                  namesMap[uploaderId] = `Usuario (${uploaderId.substring(0, 8)}...)`
                }
              }
            } catch (error) {
              console.error(`Error loading profile for ${uploaderId}:`, error)
              namesMap[uploaderId] = `Usuario (${uploaderId.substring(0, 8)}...)`
            }
          }
          
          setUploaderNames(namesMap)
        } catch (error) {
          console.error("Error loading documents:", error)
        } finally {
          setLoadingDocuments(false)
        }
      }
      fetchDocuments()
    }
  }, [activeTab, caseId])

  // Cargar mensajes cuando se selecciona el tab
  useEffect(() => {
    if (activeTab === 'messages' && !loadingMessages && messages.length === 0) {
      const fetchMessages = async () => {
        try {
          setLoadingMessages(true)
          const msgs = await casesService.getMessagesByCase(caseId)
          setMessages(msgs)
        } catch (error) {
          console.error("Error loading messages:", error)
        } finally {
          setLoadingMessages(false)
        }
      }
      fetchMessages()
    }
  }, [activeTab, caseId])

  // Cargar aplicaciones cuando el caso se carga (para clientes)
  useEffect(() => {
    if (caseData && caseData.status === 'EVALUATION') {
      const fetchApplications = async () => {
        try {
          setLoadingApplications(true)
          const apps = await casesService.getApplicationsByCase(caseId)
          setApplications(apps)
          
          // Cargar nombres de abogados
          const lawyers = await profilesService.getAllLawyers()
          const appsWithNames = apps.map((app: any) => {
            const lawyer = lawyers.find((l: any) => l.userId === app.lawyerId)
            return {
              ...app,
              lawyerFullName: lawyer ? `${lawyer.fullName.firstname} ${lawyer.fullName.lastname}` : 'Abogado',
              lawyerProfile: lawyer
            }
          })
          setApplicationsWithNames(appsWithNames)
        } catch (error) {
          console.error("Error loading applications:", error)
        } finally {
          setLoadingApplications(false)
        }
      }
      fetchApplications()
    }
  }, [caseData, caseId])

  const handleSubmitApplication = async () => {
    if (!applicationMessage.trim()) {
      toast({
        title: "Mensaje requerido",
        description: "Por favor escribe una carta de presentación",
        variant: "destructive",
      })
      return
    }

    const currentUser = authService.getCurrentUser()
    if (!currentUser) return

    try {
      setSubmitting(true)
      await casesService.submitApplication({
        caseId,
        lawyerId: currentUser.id,
        message: applicationMessage,
      })

      toast({
        title: "Postulación enviada",
        description: "Tu postulación ha sido enviada al cliente",
      })

      setShowApplicationForm(false)
      setApplicationMessage("")
      
      // Recargar el caso
      const updatedCase = await casesService.getCaseById(caseId)
      setCaseData(updatedCase)
    } catch (error: any) {
      toast({
        title: "Error al postular",
        description: error.response?.data?.message || "No se pudo enviar la postulación",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptApplication = async (applicationId: number) => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) return

    try {
      await casesService.acceptApplication(applicationId, currentUser.id)

      toast({
        title: "Abogado aceptado",
        description: "Has aceptado al abogado para tu caso",
      })

      // Recargar el caso y las aplicaciones
      const updatedCase = await casesService.getCaseById(caseId)
      setCaseData(updatedCase)
      const apps = await casesService.getApplicationsByCase(caseId)
      setApplications(apps)
      
      // Actualizar aplicaciones con nombres
      const lawyers = await profilesService.getAllLawyers()
      const appsWithNames = apps.map((app: any) => {
        const lawyer = lawyers.find((l: any) => l.userId === app.lawyerId)
        return {
          ...app,
          lawyerFullName: lawyer ? `${lawyer.fullName.firstname} ${lawyer.fullName.lastname}` : 'Abogado',
          lawyerProfile: lawyer
        }
      })
      setApplicationsWithNames(appsWithNames)
    } catch (error: any) {
      toast({
        title: "Error al aceptar",
        description: error.response?.data?.message || "No se pudo aceptar la postulación",
        variant: "destructive",
      })
    }
  }

  const handleRejectApplication = async (applicationId: number) => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) return

    try {
      await casesService.rejectApplication(applicationId, currentUser.id)

      toast({
        title: "Postulación rechazada",
        description: "Has rechazado esta postulación",
      })

      // Recargar las aplicaciones
      const apps = await casesService.getApplicationsByCase(caseId)
      setApplications(apps)
      
      // Actualizar aplicaciones con nombres
      const lawyers = await profilesService.getAllLawyers()
      const appsWithNames = apps.map((app: any) => {
        const lawyer = lawyers.find((l: any) => l.userId === app.lawyerId)
        return {
          ...app,
          lawyerFullName: lawyer ? `${lawyer.fullName.firstname} ${lawyer.fullName.lastname}` : 'Abogado',
          lawyerProfile: lawyer
        }
      })
      setApplicationsWithNames(appsWithNames)
    } catch (error: any) {
      toast({
        title: "Error al rechazar",
        description: error.response?.data?.message || "No se pudo rechazar la postulación",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    
    const currentUser = authService.getCurrentUser()
    if (!currentUser) return

    try {
      setSubmitting(true)
      await casesService.sendMessage(caseId, currentUser.id, newMessage)
      
      // Recargar mensajes
      const msgs = await casesService.getMessagesByCase(caseId)
      setMessages(msgs)
      setNewMessage("")
      
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    // Validar que el caso permite subir archivos
    // Solo bloquear si está CLOSED o CANCELED
    // ACCEPTED permite subir archivos porque aún se hace seguimiento del caso
    if (caseData && (caseData.status === 'CLOSED' || caseData.status === 'CANCELED')) {
      toast({
        title: "No se pueden subir archivos",
        description: caseData.status === 'CLOSED' 
          ? "Este caso está cerrado y no permite más modificaciones."
          : "Este caso está cancelado y no permite más modificaciones.",
        variant: "destructive",
      })
      e.target.value = ''
      return
    }

    const file = e.target.files[0]
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se aceptan archivos PDF, Word e imágenes (JPEG, PNG)",
        variant: "destructive",
      })
      return
    }

    if (file.size > maxSize) {
      toast({
        title: "Archivo demasiado grande",
        description: "El archivo no puede exceder 10MB",
        variant: "destructive",
      })
      return
    }

    const currentUser = authService.getCurrentUser()
    if (!currentUser) return

    try {
      setLoadingDocuments(true)
      
      // Intentar subir archivo real usando el nuevo endpoint
      try {
        await casesService.uploadDocumentFile(caseId, currentUser.id, file)
        
        toast({
          title: "Documento subido",
          description: "El documento ha sido subido exitosamente",
        })

        // Recargar documentos
        const docs = await casesService.getDocumentsByCase(caseId)
        setDocuments(docs)
        
        // Obtener nombres de los usuarios que subieron los documentos
        const namesMap: { [key: string]: string } = { ...uploaderNames }
        const uniqueUploaderIds = [...new Set(docs.map((doc: any) => doc.uploadedBy))]
        
        for (const uploaderId of uniqueUploaderIds) {
          if (!namesMap[uploaderId]) {
            try {
              // Intentar obtener como abogado primero
              try {
                const lawyerProfile = await profilesService.getLawyerByUserId(uploaderId)
                namesMap[uploaderId] = `${lawyerProfile.fullName.firstname} ${lawyerProfile.fullName.lastname}`
              } catch (lawyerError) {
                // Si no es abogado, intentar como cliente
                try {
                  const clientProfile = await profilesService.getClientByUserId(uploaderId)
                  namesMap[uploaderId] = `${clientProfile.fullName.firstname} ${clientProfile.fullName.lastname}`
                } catch (clientError) {
                  // Si no se encuentra, usar el ID
                  namesMap[uploaderId] = `Usuario (${uploaderId.substring(0, 8)}...)`
                }
              }
            } catch (error) {
              console.error(`Error loading profile for ${uploaderId}:`, error)
              namesMap[uploaderId] = `Usuario (${uploaderId.substring(0, 8)}...)`
            }
          }
        }
        
        setUploaderNames(namesMap)
      } catch (uploadError: any) {
        console.error("Error uploading file:", uploadError)
        
        // Verificar si el error es por estado del caso
        if (uploadError.response?.status === 403) {
          toast({
            title: "No se pueden subir archivos",
            description: uploadError.response?.headers?.['x-error-message'] || "Este caso no permite más modificaciones",
            variant: "destructive",
          })
          setLoadingDocuments(false)
          e.target.value = ''
          return
        }
        
        // Si es 404, el endpoint no existe, intentar con el método JSON
        if (uploadError.response?.status === 404) {
          console.warn("Upload endpoint not found (404), trying with JSON metadata:", uploadError)
          
          // Convertir a base64 como fallback
          const reader = new FileReader()
          reader.onloadend = async () => {
            try {
              const base64String = reader.result as string
              
              await casesService.uploadDocument(
                caseId,
                currentUser.id,
                {
                  filename: file.name,
                  fileUrl: base64String,
                  fileSize: file.size,
                  fileType: file.type,
                }
              )

              toast({
                title: "Documento subido",
                description: "El documento ha sido subido exitosamente",
              })

              // Recargar documentos
              const docs = await casesService.getDocumentsByCase(caseId)
              setDocuments(docs)
              
              // Obtener nombres de los usuarios que subieron los documentos
              const namesMap: { [key: string]: string } = { ...uploaderNames }
              const uniqueUploaderIds = [...new Set(docs.map((doc: any) => doc.uploadedBy))]
              
              for (const uploaderId of uniqueUploaderIds) {
                if (!namesMap[uploaderId]) {
                  try {
                    // Intentar obtener como abogado primero
                    try {
                      const lawyerProfile = await profilesService.getLawyerByUserId(uploaderId)
                      namesMap[uploaderId] = `${lawyerProfile.fullName.firstname} ${lawyerProfile.fullName.lastname}`
                    } catch (lawyerError) {
                      // Si no es abogado, intentar como cliente
                      try {
                        const clientProfile = await profilesService.getClientByUserId(uploaderId)
                        namesMap[uploaderId] = `${clientProfile.fullName.firstname} ${clientProfile.fullName.lastname}`
                      } catch (clientError) {
                        // Si no se encuentra, usar el ID
                        namesMap[uploaderId] = `Usuario (${uploaderId.substring(0, 8)}...)`
                      }
                    }
                  } catch (error) {
                    console.error(`Error loading profile for ${uploaderId}:`, error)
                    namesMap[uploaderId] = `Usuario (${uploaderId.substring(0, 8)}...)`
                  }
                }
              }
              
              setUploaderNames(namesMap)
            } catch (error: any) {
              console.error("Error uploading file with metadata:", error)
              if (error.response?.status === 403) {
                toast({
                  title: "No se pueden subir archivos",
                  description: error.response?.headers?.['x-error-message'] || "Este caso no permite más modificaciones",
                  variant: "destructive",
                })
              } else if (error.response?.status === 500) {
                toast({
                  title: "Error al subir documento",
                  description: "El archivo es demasiado grande o hay un error en el servidor. Intenta con un archivo más pequeño.",
                  variant: "destructive",
                })
              } else {
                toast({
                  title: "Error al subir documento",
                  description: error.response?.data?.message || "No se pudo subir el documento",
                  variant: "destructive",
                })
              }
            } finally {
              setLoadingDocuments(false)
              e.target.value = ''
            }
          }
          reader.onerror = () => {
            toast({
              title: "Error al leer archivo",
              description: "No se pudo leer el archivo",
              variant: "destructive",
            })
            setLoadingDocuments(false)
            e.target.value = ''
          }
          reader.readAsDataURL(file)
          return
        }
        
        // Para otros errores, mostrar mensaje genérico
        toast({
          title: "Error al subir documento",
          description: uploadError.response?.data?.message || uploadError.message || "No se pudo subir el documento. Verifica que el archivo sea válido.",
          variant: "destructive",
        })
        setLoadingDocuments(false)
        e.target.value = ''
        return
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast({
          title: "No se pueden subir archivos",
          description: "Este caso no permite más modificaciones",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "No se pudo subir el documento",
          variant: "destructive",
        })
      }
    } finally {
      setLoadingDocuments(false)
      // Resetear el input
      e.target.value = ''
    }
  }

  const handleUploadDocument = () => {
    const fileInput = document.getElementById('document-upload-input') as HTMLInputElement
    if (fileInput) {
      fileInput.click()
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
        <div className="pt-20 flex items-center justify-center py-12">
          <p className="text-gray-600">Cargando caso...</p>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="pt-20 flex items-center justify-center py-12">
          <p className="text-gray-600">Caso no encontrado</p>
        </div>
      </div>
    )
  }

  const currentUser = authService.getCurrentUser()
  const isOwner = currentUser?.id === caseData.clientId

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{caseData.title}</h1>
                <p className="text-gray-600">{caseData.description}</p>
              </div>
              <span className={`px-4 py-2 rounded-lg border font-medium text-sm ${getStatusColor(caseData.status)}`}>
                {getStatusLabel(caseData.status)}
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {clientName || 'Cliente: Cargando...'}
              </span>
              {caseData.assignedLawyerId && lawyerName && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Abogado: {lawyerName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Creado: {new Date(caseData.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>

            {/* Botón de Postulación para Abogados */}
            {authService.getCurrentUser()?.roles?.[0] === 'ROLE_LAWYER' && 
             caseData.status === 'OPEN' && 
             !showApplicationForm && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowApplicationForm(true)}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  Postular a este Caso
                </Button>
              </div>
            )}

            {/* Formulario de Postulación */}
            {showApplicationForm && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Carta de Presentación</h3>
                <Textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Escribe una carta de presentación explicando por qué eres el abogado ideal para este caso..."
                  rows={6}
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitApplication}
                    disabled={submitting || !applicationMessage.trim()}
                    className="bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {submitting ? "Enviando..." : "Enviar Postulación"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowApplicationForm(false)
                      setApplicationMessage("")
                    }}
                    variant="secondary"
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <div className="flex gap-1 p-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'overview'
                      ? 'bg-slate-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Resumen</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'documents'
                      ? 'bg-slate-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Documentos</span>
                  {documents.length > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {documents.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'messages'
                      ? 'bg-slate-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Mensajes</span>
                  {messages.length > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {messages.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'activity'
                      ? 'bg-slate-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span className="text-sm font-medium">Timeline</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Estadísticas del Caso */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Actividad</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <p className="text-sm text-gray-600">Documentos</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">{documents.length}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-5 h-5 text-purple-600" />
                          <p className="text-sm text-gray-600">Comentarios</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-900">{comments.length}</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5 text-yellow-600" />
                          <p className="text-sm text-gray-600">Postulaciones</p>
                        </div>
                        <p className="text-2xl font-bold text-yellow-900">{applications.length}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-gray-600">Días activo</p>
                        </div>
                        <p className="text-2xl font-bold text-green-900">
                          {Math.floor((new Date().getTime() - new Date(caseData.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Caso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Estado</p>
                        <p className="font-semibold text-gray-900">{getStatusLabel(caseData.status)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Fecha de Creación</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(caseData.createdAt).toLocaleDateString('es-ES', { 
                            year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Última Actualización</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(caseData.updatedAt).toLocaleDateString('es-ES', { 
                            year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">ID del Caso</p>
                        <p className="font-mono text-sm text-gray-900">{caseData.id.substring(0, 13)}...</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción Completa</h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {caseData.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Participantes</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{clientName || 'Cargando...'}</p>
                          <p className="text-sm text-gray-600">Cliente</p>
                        </div>
                      </div>
                      {caseData.assignedLawyerId && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lawyerName || 'Cargando...'}</p>
                            <p className="text-sm text-gray-600">Abogado Asignado</p>
                          </div>
                        </div>
                      )}
                      {!caseData.assignedLawyerId && caseData.status === 'OPEN' && (
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-yellow-900">Sin abogado asignado</p>
                            <p className="text-sm text-yellow-700">Esperando postulaciones de abogados</p>
                          </div>
                        </div>
                      )}
                      {!caseData.assignedLawyerId && caseData.status === 'EVALUATION' && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">En evaluación</p>
                            <p className="text-sm text-blue-700">Revisando postulaciones de abogados</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Postulaciones (solo para clientes en EVALUATION) */}
                  {authService.getCurrentUser()?.id === caseData.clientId && 
                   caseData.status === 'EVALUATION' && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Postulaciones de Abogados ({applications.length})
                      </h3>
                      {loadingApplications ? (
                        <div className="text-center py-8 text-gray-500">
                          Cargando postulaciones...
                        </div>
                      ) : applicationsWithNames.length > 0 ? (
                        <div className="space-y-3">
                          {applicationsWithNames.map((app: any) => (
                            <div key={app.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{app.lawyerFullName}</p>
                                    {app.lawyerProfile?.specialties && app.lawyerProfile.specialties.length > 0 && (
                                      <p className="text-xs text-gray-500">
                                        {app.lawyerProfile.specialties.map((s: string) => getSpecialtyDisplayName(s)).join(', ')}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    onClick={() => router.push(`/profile/${app.lawyerId}`)}
                                    size="sm"
                                    variant="secondary"
                                    className="ml-auto"
                                  >
                                    Ver Perfil
                                  </Button>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  app.status === 'SUBMITTED' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                  app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border border-green-200' :
                                  'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                  {app.status === 'SUBMITTED' ? 'Pendiente' : 
                                   app.status === 'ACCEPTED' ? 'Aceptado' : 'Rechazado'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{app.message}</p>
                              {app.status === 'SUBMITTED' && (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleAcceptApplication(app.id)}
                                    size="sm"
                                    className="bg-green-600 text-white hover:bg-green-700"
                                  >
                                    Aceptar
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectApplication(app.id)}
                                    size="sm"
                                    variant="secondary"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    Rechazar
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No hay postulaciones aún
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* Upload Area */}
                  {(isOwner || currentUser?.id === caseData.assignedLawyerId) && (
                    <>
                      {/* Solo permitir subir archivos si el caso NO está CLOSED o CANCELED */}
                      {/* ACCEPTED permite subir archivos porque aún se hace seguimiento del caso */}
                      {(caseData.status !== 'CLOSED' && caseData.status !== 'CANCELED') ? (
                        <>
                          <input
                            type="file"
                            id="document-upload-input"
                            className="hidden"
                            accept=".pdf,.doc,.docx,image/*"
                            onChange={handleFileInputChange}
                            disabled={loadingDocuments}
                          />
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                            onClick={handleUploadDocument}
                          >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-700 font-medium mb-1">Haz clic para subir documentos</p>
                            <p className="text-sm text-gray-500">PDF, Word, imágenes (máx. 10MB)</p>
                          </div>
                        </>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium mb-1">
                            No se pueden subir documentos
                          </p>
                          <p className="text-sm text-gray-500">
                            {caseData.status === 'CLOSED' && 'Este caso está cerrado y no permite más modificaciones.'}
                            {caseData.status === 'CANCELED' && 'Este caso está cancelado y no permite más modificaciones.'}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Documents List */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos ({documents.length})</h3>
                    {loadingDocuments ? (
                      <div className="text-center py-8 text-gray-500">
                        Cargando documentos...
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No hay documentos cargados</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Group by date - Ordenar por fecha más reciente primero */}
                        {Object.entries(
                          documents
                            .sort((a: any, b: any) => {
                              // Ordenar todos los documentos por fecha, más reciente primero
                              return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
                            })
                            .reduce((acc: { [key: string]: any[] }, doc: any) => {
                              const date = new Date(doc.uploadedAt).toLocaleDateString('es-ES', { 
                                year: 'numeric', month: 'long', day: 'numeric' 
                              })
                              if (!acc[date]) acc[date] = []
                              acc[date].push(doc)
                              return acc
                            }, {} as { [key: string]: any[] })
                        )
                        .sort(([dateA, docsA], [dateB, docsB]) => {
                          // Ordenar por la fecha del primer documento de cada grupo (más reciente primero)
                          const dateAObj = new Date(docsA[0].uploadedAt)
                          const dateBObj = new Date(docsB[0].uploadedAt)
                          return dateBObj.getTime() - dateAObj.getTime()
                        })
                        .map(([date, docs]) => (
                          <div key={date}>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {date}
                            </h4>
                            <div className="space-y-2">
                              {docs.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-gray-900 truncate">{doc.filename}</p>
                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <p className="text-xs text-gray-500">
                                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.fileType}
                                        </p>
                                        <span className="text-xs text-gray-400">•</span>
                                        <p className="text-xs text-gray-600 font-medium">
                                          Subido por: <span className="text-gray-700">{uploaderNames[doc.uploadedBy] || `Usuario (${doc.uploadedBy?.substring(0, 8)}...)`}</span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <a 
                                      href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `${API_BASE_URL}${doc.fileUrl}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <Button size="sm" variant="secondary">
                                        <Download className="w-4 h-4" />
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Chat privado</strong> entre cliente y abogado asignado
                    </p>
                  </div>

                  {/* Messages List */}
                  <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                    {loadingMessages ? (
                      <div className="text-center py-8 text-gray-500">
                        Cargando mensajes...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No hay mensajes aún. Sé el primero en escribir!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isCurrentUser = currentUser?.id === msg.senderId
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-md ${isCurrentUser ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200'} rounded-lg p-4 shadow-sm`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-2 ${isCurrentUser ? 'text-gray-400' : 'text-gray-500'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !submitting && handleSendMessage()}
                      disabled={submitting}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={submitting || !newMessage.trim()}
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Activity Timeline Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Historial de Actividad</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        Documentos
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        Comentarios
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        Estados
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        Postulaciones
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Crear timeline unificado con todos los eventos */}
                    {(() => {
                      const timelineEvents: Array<{
                        id: string;
                        type: 'document' | 'comment' | 'status' | 'application' | 'creation';
                        timestamp: Date;
                        title: string;
                        description: string;
                        icon: React.ReactNode;
                        color: string;
                      }> = [];

                      // Agregar creación del caso
                      timelineEvents.push({
                        id: `case-${caseData.id}`,
                        type: 'creation',
                        timestamp: new Date(caseData.createdAt),
                        title: 'Caso creado',
                        description: `Caso "${caseData.title}" fue creado por ${clientName || 'el cliente'}`,
                        icon: <CheckCircle className="w-5 h-5" />,
                        color: 'bg-slate-500'
                      });

                      // Agregar cambios de estado basados en el estado actual
                      if (caseData.status === 'EVALUATION') {
                        timelineEvents.push({
                          id: `status-evaluation`,
                          type: 'status',
                          timestamp: new Date(caseData.updatedAt), // Usar updatedAt como aproximación
                          title: 'Estado cambiado a EVALUACIÓN',
                          description: 'El caso fue marcado para evaluación de postulaciones',
                          icon: <AlertCircle className="w-5 h-5" />,
                          color: 'bg-yellow-500'
                        });
                      }

                      if (caseData.status === 'ACCEPTED' && caseData.assignedLawyerId) {
                        timelineEvents.push({
                          id: `status-accepted`,
                          type: 'status',
                          timestamp: new Date(caseData.updatedAt),
                          title: 'Abogado asignado',
                          description: `El abogado ${lawyerName || 'asignado'} fue asignado al caso`,
                          icon: <User className="w-5 h-5" />,
                          color: 'bg-green-500'
                        });
                      }

                      if (caseData.status === 'CLOSED') {
                        timelineEvents.push({
                          id: `status-closed`,
                          type: 'status',
                          timestamp: new Date(caseData.updatedAt),
                          title: 'Caso cerrado',
                          description: 'El caso fue cerrado exitosamente',
                          icon: <CheckCircle className="w-5 h-5" />,
                          color: 'bg-gray-500'
                        });
                      }

                      if (caseData.status === 'CANCELED') {
                        timelineEvents.push({
                          id: `status-canceled`,
                          type: 'status',
                          timestamp: new Date(caseData.updatedAt),
                          title: 'Caso cancelado',
                          description: 'El caso fue cancelado',
                          icon: <X className="w-5 h-5" />,
                          color: 'bg-red-500'
                        });
                      }

                      // Agregar postulaciones aceptadas
                      applicationsWithNames
                        .filter((app: any) => app.status === 'ACCEPTED')
                        .forEach((app: any) => {
                          timelineEvents.push({
                            id: `app-accepted-${app.id}`,
                            type: 'application',
                            timestamp: new Date(app.createdAt || caseData.createdAt),
                            title: 'Postulación aceptada',
                            description: `El abogado ${app.lawyerFullName} fue aceptado para el caso`,
                            icon: <CheckCircle className="w-5 h-5" />,
                            color: 'bg-green-500'
                          });
                        });

                      // Agregar documentos
                      documents.forEach((doc: any) => {
                        timelineEvents.push({
                          id: `doc-${doc.id}`,
                          type: 'document',
                          timestamp: new Date(doc.uploadedAt),
                          title: 'Documento subido',
                          description: `"${doc.filename}" subido por ${uploaderNames[doc.uploadedBy] || 'usuario'}`,
                          icon: <FileText className="w-5 h-5" />,
                          color: 'bg-blue-500'
                        });
                      });

                      // Agregar comentarios
                      comments.forEach((comment: any) => {
                        timelineEvents.push({
                          id: `comment-${comment.id}`,
                          type: 'comment',
                          timestamp: new Date(comment.createdAt),
                          title: comment.type === 'FINAL' ? 'Comentario final' : 'Comentario general',
                          description: `${commentAuthorNames[comment.authorId] || 'Usuario'}: ${comment.content.length > 80 
                            ? `${comment.content.substring(0, 80)}...` 
                            : comment.content}`,
                          icon: <MessageSquare className="w-5 h-5" />,
                          color: 'bg-purple-500'
                        });
                      });

                      // Ordenar por fecha (más reciente primero)
                      timelineEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

                      if (timelineEvents.length === 0) {
                        return (
                          <div className="text-center py-12 text-gray-500">
                            <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>El historial de actividad se irá construyendo con el uso del caso</p>
                          </div>
                        );
                      }

                      return timelineEvents.map((event, idx) => (
                        <div key={event.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full ${event.color} flex items-center justify-center text-white`}>
                              {event.icon}
                            </div>
                            {idx !== timelineEvents.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <p className="text-gray-900 font-medium">{event.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {event.timestamp.toLocaleDateString('es-ES', { 
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section - Always Visible */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comentarios ({comments.length})
            </h3>
            
            {/* Búsqueda y filtros */}
            {comments.length > 0 && (
              <div className="mb-4 flex items-center gap-4">
                <Input
                  type="text"
                  placeholder="Buscar en comentarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'documents' | 'comments')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="comments">Solo comentarios</option>
                </select>
              </div>
            )}
            
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No hay comentarios aún</p>
              ) : (
                comments
                  .filter((comment: any) => {
                    if (filterType === 'comments') return true
                    if (searchQuery) {
                      return comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             commentAuthorNames[comment.authorId]?.toLowerCase().includes(searchQuery.toLowerCase())
                    }
                    return true
                  })
                  .map((comment: any) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {commentAuthorNames[comment.authorId] || `Usuario (${comment.authorId?.substring(0, 8)}...)`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {comment.type === 'FINAL' ? 'Comentario Final' : 'Comentario General'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          comment.type === 'FINAL' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {comment.type === 'FINAL' ? 'Final' : 'General'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(comment.createdAt).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaseDetailPage
