import api from './api';

export const conviteService = {
  criar: async (idColaborador: string, email: string, nome: string): Promise<void> => {
    await api.post('/convites', {
      id_colaborador: idColaborador,
      colaborador_email: email,
      colaborador_nome: nome,
    });
  },
};
