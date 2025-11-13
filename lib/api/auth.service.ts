import apiClient from './config';

export interface SignUpRequest {
  username: string;
  password: string;
  roles: string[];
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface UserResource {
  id: string;
  username: string;
  roles: string[];
}

export interface AuthenticatedUserResource {
  id: string;
  username: string;
  roles: string[];
  token: string;
}

class AuthService {
  /**
   * Registrar un nuevo usuario
   */
  async signUp(data: SignUpRequest): Promise<UserResource> {
    const response = await apiClient.post('/api/v1/authentication/sign-up', data);
    return response.data;
  }

  /**
   * Iniciar sesión
   */
  async signIn(data: SignInRequest): Promise<AuthenticatedUserResource> {
    const response = await apiClient.post('/api/v1/authentication/sign-in', data);
    const user = response.data;
    
    // Guardar token y usuario en localStorage
    if (user.token) {
      localStorage.setItem('authToken', user.token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return user;
  }

  /**
   * Cerrar sesión
   */
  signOut(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser(): AuthenticatedUserResource | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  /**
   * Verificar si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export default new AuthService();

