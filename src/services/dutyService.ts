import api from './api';

export interface Duty {
  id: string;
  colaborador_id: string;
  periodo: {
    inicio: string;
    fim: string;
  };
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
  valor_total: number;
  observacoes: string | null;
}

export const dutyService = {
  getAll: async (): Promise<Duty[]> => {
    const response = await api.get('/plantoes');
    return response.data;
  },

  getByPeriod: async (startDate: string, endDate: string): Promise<Duty[]> => {
    const response = await api.get(`/plantoes/periodo/${startDate}/${endDate}`);
    return response.data;
  },

  getByColaborador: async (colaboradorId: string): Promise<Duty[]> => {
    const response = await api.get(`/plantoes/colaborador/${colaboradorId}`);
    return response.data;
  },

  updateStatus: async (id: string, newStatus: string, observacoes?: string): Promise<void> => {
    await api.patch(`/plantoes/${id}/status`, { new_status: newStatus, observacoes });
  },
};
