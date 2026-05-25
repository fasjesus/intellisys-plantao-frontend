import api from './api';

export interface Duty {
  id: string;
  colaborador_id: string;
  periodo: {
    Inicio: string;
    Fim: string;
  };
  status: string;
  valor_total: number;
  observacoes: string | null;
}

export const dutyService = {
  getAll: async (): Promise<Duty[]> => {
    const response = await api.get('/plantoes');
    return response.data;
  },

  getById: async (id: string): Promise<Duty> => {
    const response = await api.get(`/plantoes/${id}`);
    return response.data;
  },

  getByColaborador: async (colaboradorId: string): Promise<Duty[]> => {
    const response = await api.get(`/plantoes/colaborador/${colaboradorId}`);
    return response.data;
  },

  getByStatus: async (status: 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'PAGO'): Promise<Duty[]> => {
    const response = await api.get(`/plantoes/status/${status}`);
    return response.data;
  },

  getByPeriod: async (startDate: string, endDate: string): Promise<Duty[]> => {
    const response = await api.get(`/plantoes/periodo/${startDate}/${endDate}`);
    return response.data;
  },

  create: async (payload: {
    colaborador_id: string;
    periodo: { inicio: string; fim: string };
  }): Promise<Duty> => {
    const response = await api.post('/plantoes', payload);
    return response.data;
  },

  updateStatus: async (id: string, newStatus: string | number, observacoes?: string): Promise<void> => {
    await api.patch(`/plantoes/${id}/status`, { new_status: newStatus, observacoes });
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/plantoes/${id}`);
  },
};
