import api from './api';

export const authService = {
  login: async (credentials: { email: string; senha: string }) => {
    // 1. Faz o login na rota de autenticação
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.token) {
      const token = response.data.token;
      const userAccount = response.data.usuario || response.data;

      // 2. Salva o Token e configura o Axios imediatamente
      localStorage.setItem('@Intellisys:token', token);
      api.defaults.headers.Authorization = `Bearer ${token}`;

      // 3. Salva a conta de Usuário 
      localStorage.setItem('@Intellisys:user', JSON.stringify(userAccount));

      if (userAccount.id_colaborador) {
        try {
          const colabResponse = await api.get(`/colaboradores/${userAccount.id_colaborador}`);
          localStorage.setItem('@Intellisys:colaborador', JSON.stringify(colabResponse.data));
        } catch (error) {
          console.error("Erro ao buscar dados do colaborador após login", error);
        }
      }
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('@Intellisys:token');
    localStorage.removeItem('@Intellisys:user');
    localStorage.removeItem('@Intellisys:colaborador');
    delete api.defaults.headers.Authorization;
  },

  getUsuario: async () => {
    // Rota que retorna o perfil do Usuário logado
    const response = await api.get('/authenticated/usuarios');
    localStorage.setItem('@Intellisys:user', JSON.stringify(response.data));
    return response.data;
  },

  getColaborador: async (colaboradorId: string) => {
    // Rota que retorna os dados do Colaborador
    const response = await api.get(`/colaboradores/${colaboradorId}`);
    localStorage.setItem('@Intellisys:colaborador', JSON.stringify(response.data));
    return response.data;
  }
};