import api from './api';

export interface Feriado {
  id: string;
  data: string;
  nome: string;
  descricao: string;
}

export const scaleService = {
  getFeriados: async (ano: number): Promise<Feriado[]> => {
    const response = await api.get('/admin/feriados', { params: { ano } });
    return response.data;
  },
};
