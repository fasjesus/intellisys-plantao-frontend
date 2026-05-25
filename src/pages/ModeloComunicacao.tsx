import { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Pencil, X, FileText } from 'lucide-react';
import { Button } from '../components/Button';
import api from '../services/api';

interface Modelo {
  id: string;
  nome: string;
  tipo_comunicacao: string;
  assunto: string;
  corpo: string;
}

const emptyForm = {
  nome: '',
  tipo_comunicacao: 'Colaborador Cadastrado',
  assunto: '',
  corpo: '',
};

export function ModeloComunicacao() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Modelo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  async function loadModelos() {
    setLoading(true);
    try {
      const res = await api.get('/auth/admin/modelo-comunicacao/');
      setModelos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setModelos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadModelos(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (m: Modelo) => {
    setEditingId(m.id);
    setFormData({ nome: m.nome, tipo_comunicacao: m.tipo_comunicacao, assunto: m.assunto, corpo: m.corpo });
    setShowForm(true);
    setSelected(null);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/auth/admin/modelo-comunicacao/${editingId}`, formData);
      } else {
        await api.post('/auth/admin/modelo-comunicacao/', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      await loadModelos();
    } catch {
      alert('Erro ao salvar modelo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col">

      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-4xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Modelos de Comunicação</h2>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium">Gerencie os templates de e-mail do sistema.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="text-[#B5071A] animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carregando modelos...</p>
          </div>
        ) : modelos.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <FileText size={40} className="text-gray-200" />
            <p className="text-gray-500 font-bold text-sm">Nenhum modelo cadastrado.</p>
            <p className="text-gray-400 text-xs">Crie o primeiro modelo de comunicação.</p>
          </div>
        ) : !showForm ? (
          <>
            {/* DESKTOP */}
            <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white mb-6">
              <div className="grid grid-cols-[1.5fr_1fr_1.5fr] bg-gray-50 border-b border-gray-100 px-6 py-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assunto</span>
              </div>
              <div className="max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-gray-50">
                {modelos.map(m => {
                  const isSelected = selected?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelected(prev => prev?.id === m.id ? null : m)}
                      className={[
                        'grid grid-cols-[1.5fr_1fr_1.5fr] px-6 py-4 items-center transition-colors cursor-pointer',
                        isSelected ? 'bg-red-50 border-l-2 border-l-[#B5071A]' : 'hover:bg-gray-50',
                      ].join(' ')}
                    >
                      <span className="text-xs font-bold text-gray-700 truncate">{m.nome}</span>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit truncate">{m.tipo_comunicacao}</span>
                      <span className="text-xs text-gray-500 truncate">{m.assunto}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-3 pb-28">
              {modelos.map(m => {
                const isSelected = selected?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelected(prev => prev?.id === m.id ? null : m)}
                    className={[
                      'border rounded-xl p-4 shadow-sm cursor-pointer transition-all',
                      isSelected ? 'bg-red-50 border-[#B5071A]' : 'bg-gray-50 border-gray-100',
                    ].join(' ')}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold text-gray-700">{m.nome}</span>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{m.tipo_comunicacao}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">{m.assunto}</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* FORMULÁRIO */
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                {editingId ? 'Editar Modelo' : 'Novo Modelo'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  type="button"
                  variant="secondary"
                  label="Cancelar"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                />
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
        )}

        {!showForm && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0 md:mt-4 md:flex md:justify-end md:gap-3">
            <div className="grid grid-cols-3 gap-2 md:flex md:gap-3">
              <Button
                label="Editar"
                icon={<Pencil size={14} />}
                variant="secondary"
                disabled={!selected}
                className={!selected ? 'opacity-30 cursor-not-allowed' : ''}
                onClick={() => selected && openEdit(selected)}
              />
              <Button
                label="Novo"
                icon={<Plus size={14} />}
                onClick={openCreate}
              />
              <Button
                label="Voltar"
                variant="secondary"
                onClick={() => window.history.back()}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 10px; }
      `}</style>
    </div>
  );
}
