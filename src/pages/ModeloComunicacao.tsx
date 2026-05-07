import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '../components/Button';
import api from '../services/api';

export function ModeloComunicacao() {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    tipo_comunicacao: 'Colaborador Cadastrado',
    assunto: '',
    corpo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post('/auth/admin/modelo-comunicacao/', formData);
      alert('Modelo criado com sucesso!');
      setFormData({ nome: '', tipo_comunicacao: 'Colaborador Cadastrado', assunto: '', corpo: '' });
    } catch {
      alert('Erro ao criar modelo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col pt-6">

      <div className="flex items-center justify-center mb-8">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Modelo de Comunicação</h2>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium">Crie o template de email para convites.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full space-y-5">

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Nome do Modelo</label>
          <input
            name="nome"
            type="text"
            required
            value={formData.nome}
            onChange={handleChange}
            placeholder="Ex: Convite de Acesso"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Tipo</label>
          <select
            name="tipo_comunicacao"
            value={formData.tipo_comunicacao}
            onChange={handleChange}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all cursor-pointer"
          >
            <option value="Colaborador Cadastrado">Colaborador Cadastrado</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Assunto</label>
          <input
            name="assunto"
            type="text"
            required
            value={formData.assunto}
            onChange={handleChange}
            placeholder="Ex: Bem-vindo ao sistema Intellisys"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">
            Corpo do E-mail
            <span className="ml-2 text-gray-300 normal-case font-normal">use {'{{nome}}'} para o nome do colaborador</span>
          </label>
          <textarea
            name="corpo"
            required
            value={formData.corpo}
            onChange={handleChange}
            rows={8}
            placeholder="Olá {{nome}}, seu acesso foi criado..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:border-[#B5071A] outline-none transition-all resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={saving}
            icon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            label={saving ? 'Salvando...' : 'Salvar Modelo'}
          />
        </div>
      </form>
    </div>
  );
}
