import apiClient from "./config"

interface ContactInfoPayload {
  phoneNumber: string
  address: string
}

export interface CreateLawyerRequest {
  userId: string
  firstname: string
  lastname: string
  dni: string
  contactInfo: ContactInfoPayload
  description: string
  specialties: string[]
}

export interface UpdateLawyerProfileRequest {
  firstname: string
  lastname: string
  dni: string
  contactInfo: ContactInfoPayload
  description: string
  specialties: string[]
}

export interface LawyerResource {
  id: string
  userId: string
  fullName: {
    firstname: string
    lastname: string
  }
  dni: string
  contactInfo: {
    phoneNumber: string
    address: string
  }
  description: string
  specialties: string[]
}

export interface CreateClientRequest {
  userId: string
  firstname: string
  lastname: string
  dni: string
  contactInfo: ContactInfoPayload
}

export interface UpdateClientProfileRequest {
  firstname: string
  lastname: string
  dni: string
  contactInfo: ContactInfoPayload
}

export interface ClientResource {
  id: string
  userId: string
  fullName: {
    firstname: string
    lastname: string
  }
  dni: string
  contactInfo: {
    phoneNumber: string
    address: string
  }
}

export interface LawyerSpecialtyResource {
  id: number
  name: string
}

class ProfilesService {
  /**
   * Crear perfil de abogado
   */
  async createLawyer(data: CreateLawyerRequest): Promise<LawyerResource> {
    const response = await apiClient.post("/api/v1/lawyers", data)
    return response.data
  }

  /**
   * Obtener todos los abogados
   */
  async getAllLawyers(): Promise<LawyerResource[]> {
    const response = await apiClient.get("/api/v1/lawyers")
    return response.data
  }

  /**
   * Obtener abogado por user ID
   */
  async getLawyerByUserId(userId: string): Promise<LawyerResource> {
    const response = await apiClient.get(`/api/v1/lawyers/${userId}`)
    return response.data
  }

  /**
   * Actualizar perfil completo de abogado
   */
  async updateLawyerProfile(userId: string, data: UpdateLawyerProfileRequest): Promise<LawyerResource> {
    const response = await apiClient.put(`/api/v1/lawyers/${userId}`, data)
    return response.data
  }

  /**
   * Crear perfil de cliente
   */
  async createClient(data: CreateClientRequest): Promise<ClientResource> {
    const response = await apiClient.post("/api/v1/clients", data)
    return response.data
  }

  /**
   * Obtener todos los clientes
   */
  async getAllClients(): Promise<ClientResource[]> {
    const response = await apiClient.get("/api/v1/clients")
    return response.data
  }

  /**
   * Obtener cliente por user ID
   */
  async getClientByUserId(userId: string): Promise<ClientResource> {
    const response = await apiClient.get(`/api/v1/clients/${userId}`)
    return response.data
  }

  /**
   * Actualizar perfil completo de cliente
   */
  async updateClientProfile(userId: string, data: UpdateClientProfileRequest): Promise<ClientResource> {
    const response = await apiClient.put(`/api/v1/clients/${userId}`, data)
    return response.data
  }

  /**
   * Obtener todas las especialidades
   */
  async getAllSpecialties(): Promise<LawyerSpecialtyResource[]> {
    const response = await apiClient.get("/api/v1/lawyer-specialties")
    return response.data
  }

  /**
   * Actualizar especialidades de un abogado
   */
  async updateLawyerSpecialties(userId: string, specialties: string[]): Promise<LawyerResource> {
    const response = await apiClient.put(`/api/v1/lawyers/${userId}/specialties`, {
      specialties: specialties,
    })
    return response.data
  }
}

const profilesServiceInstance = new ProfilesService()
export default profilesServiceInstance

