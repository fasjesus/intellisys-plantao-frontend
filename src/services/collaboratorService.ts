// src/services/collaboratorService.ts
import api from './api';

export interface Collaborator {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  setor: string;
  //foto_url: string;
  status: 'ativo' | 'inativo';
  ativo_plantao: 'ativo' | 'inativo';
  data_admissao: string;
}

export interface UserAccount {
  id: string;
  id_colaborador: string;
  email: string;
  role: 'admin' | 'gerente' | 'colaborador'; 
  ativo: 'ativo' | 'inativo';
}

export const collaboratorService = {
  getAll: async (): Promise<Collaborator[]> => {
    const response = await api.get('/colaboradores');
    return response.data;
  },

  getById: async (id: string): Promise<Collaborator> => {
    const response = await api.get(`/colaboradores/${id}`);
    return response.data;
  },
 
  update: async (id: string, data: Partial<Collaborator>) => {
    const response = await api.patch(`/colaboradores/${id}`, data);
    return response.data;
  }
};