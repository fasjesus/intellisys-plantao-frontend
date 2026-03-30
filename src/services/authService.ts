import api from './api';

export const authService = {
  login: async (credentials: { email: string; senha: string }) => {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('@Intellisys:token', response.data.token);
      localStorage.setItem('@Intellisys:user', JSON.stringify(response.data.usuario));
      
      // Configura o token para as próximas chamadas automaticamente
      api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('@Intellisys:token');
    localStorage.removeItem('@Intellisys:user');
    delete api.defaults.headers.Authorization;
  },

  getUsuario: async () => {
    const response = await api.get('/authenticated/usuarios');
    return response.data; // Deve retornar algo como { id: 1, colaboradorId: 10, ... }
  },

  // 2. Busca os dados do colaborador usando o ID vinculado ao usuário
  getColaborador: async (colaboradorId: string) => {
    const response = await api.get(`/colaboradores/${colaboradorId}`);
    return response.data; // Deve retornar { nome: "Flávia Santos", ... }
  }
};