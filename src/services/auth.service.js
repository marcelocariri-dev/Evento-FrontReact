// src/services/auth.service.js

import axios from 'axios';

// Criar instância separada para auth (sem /v1)
const authAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace('/v1', '') || 'http://localhost:73/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
const authv1Axios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
// Interceptor para adicionar token em todas as requisições
authv1Axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Instância normal do axios para outras rotas (com /v1)

const authService = {
  /**
   * Registrar novo usuário
   */
  async register(userData) {
    try {
      const response = await authAxios.post('/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password, 
      });

      const { access_token, user } = response.data;

      // Salvar token e usuário no localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token: access_token, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.email?.[0] ||
                          'Erro ao criar conta. Tente novamente.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Login do usuário
   */
  async login(email, password) {
    try {
      const response = await authAxios.post('/login', {
        email,
        password,
      });

      const { access_token, user } = response.data;

      // Salvar token e usuário no localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token: access_token, user };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.'
      );
    }
  },

  /**
   * Logout do usuário
   */
  async logout() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await authAxios.post('/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Verificar se está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Obter usuário atual
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  },
  
  async updateUser(userid, Data) {
    try {
      const isFormData = Data instanceof FormData;
      //post com metodo put
      const response = await authv1Axios.post(`/users/${userid}`, Data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Se for o próprio usuário, atualiza localStorage
      const currentUser = this.getCurrentUser();
 
        const updatedUser = { ...currentUser, ...Data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Erro ao atualizar evento.'
      );
    }
  },
  /**
   * Obter token
   */
  getToken() {
    return localStorage.getItem('token');
  },
};

export default authService;