import api from './api';

export const authService = {
  login: async (credentials: { email: string; senha: string }) => {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('@Intellisys:token', response.data.token);
      localStorage.setItem('@Intellisys:user', JSON.stringify(response.data.usuario || response.data));
      
      api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('@Intellisys:token');
    localStorage.removeItem('@Intellisys:user');
    localStorage.removeItem('@Intellisys:colaborador'); // Limpa também o colaborador
    delete api.defaults.headers.Authorization;
  },

  getUsuario: async () => {
    const response = await api.get('/authenticated/usuarios');
    // Atualiza o user no storage com dados frescos do servidor
    localStorage.setItem('@Intellisys:user', JSON.stringify(response.data));
    return response.data;
  },

  getColaborador: async (colaboradorId: string) => {
    const response = await api.get(`/colaboradores/${colaboradorId}`);
    // Salva o colaborador para que o Header e o All.tsx possam usar
    localStorage.setItem('@Intellisys:colaborador', JSON.stringify(response.data));
    return response.data;
  }
};