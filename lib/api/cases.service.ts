import apiClient from './config';

export interface CreateCaseRequest {
  title: string;
  description: string;
  clientId: string;
  specialtyId: number;
}

export interface CaseResource {
  id: string;
  title: string;
  description: string;
  clientId: string;
  assignedLawyerId?: string;
  specialtyId?: number;
  status: 'OPEN' | 'EVALUATION' | 'ACCEPTED' | 'CLOSED' | 'CANCELED';
  createdAt: string;
  updatedAt: string;
}

export interface SubmitApplicationRequest {
  caseId: string;
  lawyerId: string;
  message: string;
}

export interface ApplicationResource {
  id: number;
  caseId: string;
  lawyerId: string;
  message: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
}

export interface InviteLawyerRequest {
  caseId: string;
  lawyerId: string;
  message: string;
}

export interface InvitationResource {
  id: string;
  caseId: string;
  lawyerId: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface CreateCommentRequest {
  caseId: string;
  authorId: string;
  content: string;
  type: 'GENERAL' | 'FINAL';
}

export interface CommentResource {
  id: string;
  caseId: string;
  authorId: string;
  content: string;
  type: 'GENERAL' | 'FINAL';
  createdAt: string;
}

class CasesService {
  /**
   * Crear un nuevo caso
   */
  async createCase(data: CreateCaseRequest): Promise<CaseResource> {
    const response = await apiClient.post('/api/v1/cases', data);
    return response.data;
  }

  /**
   * Obtener todos los casos
   */
  async getAllCases(): Promise<CaseResource[]> {
    const response = await apiClient.get('/api/v1/cases');
    return response.data;
  }

  /**
   * Obtener caso por ID
   */
  async getCaseById(caseId: string): Promise<CaseResource> {
    const response = await apiClient.get(`/api/v1/cases/${caseId}`);
    return response.data;
  }

  /**
   * Obtener casos de un cliente
   */
  async getCasesByClient(clientId: string): Promise<CaseResource[]> {
    const response = await apiClient.get(`/api/v1/cases/clients/${clientId}`);
    return response.data;
  }

  /**
   * Obtener casos de un abogado
   */
  async getCasesByLawyer(lawyerId: string): Promise<CaseResource[]> {
    const response = await apiClient.get(`/api/v1/cases/lawyer/${lawyerId}`);
    return response.data;
  }

  /**
   * Obtener casos sugeridos para un abogado
   */
  async getSuggestedCases(lawyerId: string): Promise<CaseResource[]> {
    const response = await apiClient.get('/api/v1/cases/suggested', {
      params: { lawyerId }
    });
    return response.data;
  }

  /**
   * Obtener casos por estado
   */
  async getCasesByStatus(status: string): Promise<CaseResource[]> {
    const response = await apiClient.get('/api/v1/cases/status', {
      params: { status }
    });
    return response.data;
  }

  /**
   * Cerrar un caso
   */
  async closeCase(caseId: string, clientId: string): Promise<CaseResource> {
    const response = await apiClient.put(`/api/v1/cases/${caseId}/close`, null, {
      params: { clientId }
    });
    return response.data;
  }

  /**
   * Cancelar un caso
   */
  async cancelCase(caseId: string, clientId: string): Promise<CaseResource> {
    const response = await apiClient.put(`/api/v1/cases/${caseId}/cancel`, null, {
      params: { clientId }
    });
    return response.data;
  }

  /**
   * Obtener todas las aplicaciones
   */
  async getAllApplications(): Promise<ApplicationResource[]> {
    const response = await apiClient.get('/api/v1/applications');
    return response.data;
  }

  /**
   * Obtener aplicaciones de un abogado
   */
  async getApplicationsByLawyer(lawyerId: string): Promise<ApplicationResource[]> {
    const response = await apiClient.get('/api/v1/applications/lawyer', {
      params: { lawyerId }
    });
    return response.data;
  }

  /**
   * Invitar abogado a un caso
   */
  async inviteLawyer(data: InviteLawyerRequest): Promise<InvitationResource> {
    const response = await apiClient.post('/api/v1/invitations', data);
    return response.data;
  }

  /**
   * Obtener invitaciones de un caso
   */
  async getInvitationsByCase(caseId: string): Promise<InvitationResource[]> {
    const response = await apiClient.get('/api/v1/invitations/case', {
      params: { caseId }
    });
    return response.data;
  }

  /**
   * Obtener invitaciones de un abogado
   */
  async getInvitationsByLawyer(lawyerId: string): Promise<InvitationResource[]> {
    const response = await apiClient.get('/api/v1/invitations/lawyer', {
      params: { lawyerId }
    });
    return response.data;
  }

  /**
   * Aceptar invitación
   */
  async acceptInvitation(invitationId: string): Promise<InvitationResource> {
    const response = await apiClient.put(`/api/v1/invitations/${invitationId}/accept`);
    return response.data;
  }

  /**
   * Rechazar invitación
   */
  async rejectInvitation(invitationId: string): Promise<InvitationResource> {
    const response = await apiClient.put(`/api/v1/invitations/${invitationId}/reject`);
    return response.data;
  }

  /**
   * Crear comentario en un caso
   */
  async createComment(data: CreateCommentRequest): Promise<CommentResource> {
    // El backend tiene endpoints separados para comentarios generales y finales
    const endpoint = data.type === 'FINAL' 
      ? '/api/v1/comments/final'
      : '/api/v1/comments/general';
    
    const response = await apiClient.post(endpoint, {
      caseId: data.caseId,
      authorId: data.authorId,
      content: data.content
    });
    return response.data;
  }

  /**
   * Obtener comentarios de un caso
   */
  async getCommentsByCase(caseId: string): Promise<CommentResource[]> {
    const response = await apiClient.get('/api/v1/comments', {
      params: { caseId }
    });
    return response.data;
  }

  /**
   * Subir documento a un caso
   */
  async uploadDocument(caseId: string, uploadedBy: string, file: { filename: string; fileUrl: string; fileSize: number; fileType: string }): Promise<any> {
    const response = await apiClient.post(`/api/v1/cases/${caseId}/documents?uploadedBy=${uploadedBy}`, file);
    return response.data;
  }

  /**
   * Subir archivo real a un caso (MultipartFile)
   */
  async uploadDocumentFile(caseId: string, uploadedBy: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // El interceptor de axios eliminará el Content-Type para FormData
    // y axios establecerá automáticamente multipart/form-data con el boundary correcto
    const response = await apiClient.post(
      `/api/v1/cases/${caseId}/documents/upload?uploadedBy=${uploadedBy}`,
      formData
    );
    return response.data;
  }

  /**
   * Obtener documentos de un caso
   */
  async getDocumentsByCase(caseId: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/cases/${caseId}/documents`);
    return response.data;
  }

  /**
   * Enviar mensaje en un caso
   */
  async sendMessage(caseId: string, senderId: string, content: string): Promise<any> {
    const response = await apiClient.post(`/api/v1/cases/${caseId}/messages?senderId=${senderId}`, {
      content
    });
    return response.data;
  }

  /**
   * Obtener mensajes de un caso
   */
  async getMessagesByCase(caseId: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/cases/${caseId}/messages`);
    return response.data;
  }

  /**
   * Postular a un caso como abogado
   */
  async submitApplication(data: SubmitApplicationRequest): Promise<ApplicationResource> {
    const response = await apiClient.post('/api/v1/applications', data);
    return response.data;
  }

  /**
   * Obtener aplicaciones de un caso
   */
  async getApplicationsByCase(caseId: string): Promise<ApplicationResource[]> {
    const response = await apiClient.get(`/api/v1/applications?caseId=${caseId}`);
    return response.data;
  }

  /**
   * Aceptar una aplicación (solo para clientes)
   */
  async acceptApplication(applicationId: number, clientId: string): Promise<ApplicationResource> {
    const response = await apiClient.put(`/api/v1/applications/${applicationId}/accept?clientId=${clientId}`);
    return response.data;
  }

  /**
   * Rechazar una aplicación (solo para clientes)
   */
  async rejectApplication(applicationId: number, clientId: string): Promise<ApplicationResource> {
    const response = await apiClient.put(`/api/v1/applications/${applicationId}/reject?clientId=${clientId}`);
    return response.data;
  }
}

export default new CasesService();

