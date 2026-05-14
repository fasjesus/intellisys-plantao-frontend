import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  Info, DollarSign, Edit, Plus, Calendar, FileText,
  Loader2, X, Trash2
} from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { dutyService, type Duty } from '../services/dutyService';
import { collaboratorService, type Collaborator } from '../services/collaboratorService';

interface DutyWithNome extends Duty {
  funcionario: string;
}

interface CreateForm {
  colaborador_id: string;
  inicio: string;
  fim: string;
}

export function Duty() {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useOutletContext<{
    searchTerm: string;
    setSearchTerm: (v: string) => void;
  }>();

  const [plantoes, setPlantoes] = useState<DutyWithNome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [colaboradores, setColaboradores] = useState<Collaborator[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<CreateForm>({
    colaborador_id: '',
    inicio: '',
    fim: '',
  });

  useEffect(() => {
    async function loadPlantoes() {
      try {
        setLoading(true);
        const data = await dutyService.getAll();
        if (!Array.isArray(data)) { setPlantoes([]); return; }

        const colaboradoresCache: Record<string, string> = {};
        const withNomes = await Promise.all(
          data.map(async (p) => {
            if (!colaboradoresCache[p.colaborador_id]) {
              try {
                const colab = await collaboratorService.getById(p.colaborador_id);
                colaboradoresCache[p.colaborador_id] = colab.nome;
              } catch {
                colaboradoresCache[p.colaborador_id] = p.colaborador_id;
              }
            }
            return { ...p, funcionario: colaboradoresCache[p.colaborador_id] };
          })
        );

setPlantoes(withNomes);
      } catch (err) {
        console.error('Erro ao carregar plantões:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadPlantoes();
  }, []);

  useEffect(() => {
    collaboratorService.getAll().then(setColaboradores).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.colaborador_id || !form.inicio || !form.fim) {
      alert('Preencha todos os campos.');
      return;
    }
    if (new Date(form.fim) <= new Date(form.inicio)) {
      alert('A data de fim deve ser posterior ao início.');
      return;
    }
    setSaving(true);
    try {
      await dutyService.create({
        colaborador_id: form.colaborador_id,
        periodo: {
          inicio: `${form.inicio}T00:00:00Z`,
          fim: `${form.fim}T23:59:59Z`,
        },
      });
      setShowModal(false);
      setForm({ colaborador_id: '', inicio: '', fim: '' });
      const data = await dutyService.getAll();
      if (!Array.isArray(data)) return;
      const colaboradoresCache: Record<string, string> = {};
      const withNomes = await Promise.all(
        data.map(async (p) => {
          if (!colaboradoresCache[p.colaborador_id]) {
            try {
              const colab = await collaboratorService.getById(p.colaborador_id);
              colaboradoresCache[p.colaborador_id] = colab.nome;
            } catch {
              colaboradoresCache[p.colaborador_id] = p.colaborador_id;
            }
          }
          return { ...p, funcionario: colaboradoresCache[p.colaborador_id] };
        })
      );
      setPlantoes(withNomes);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao criar plantão. Verifique os dados.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Deletar ${selected.size} plantão(ões)?`)) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map(id => dutyService.delete(id)));
      setPlantoes(prev => prev.filter(p => !selected.has(p.id)));
      setSelected(new Set());
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao deletar plantão.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    const date = new Date(iso);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
  };

  const statusLabel: Record<string, string> = {
    PENDENTE: 'Aberto', APROVADO: 'Pago', RECUSADO: 'Recusado',
    '0': 'Aberto', '1': 'Pago', '2': 'Recusado',
  };

  const filtered = plantoes.filter(p =>
    p.funcionario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 size={40} className="text-[#B5071A] animate-spin" />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Carregando plantões...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle size={48} className="text-gray-300" />
        <p className="text-gray-500 font-bold text-sm">Erro ao carregar plantões.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col">

      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center w-full mb-4 md:mb-2">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Gerenciamento de Plantões</h2>
            <p className="text-[10px] md:text-sm text-gray-500 font-medium">Administre as escalas e pagamentos da equipe.</p>
          </div>

          <div className="w-8 md:w-10 shrink-0"></div>
        </div>

        <div className="w-full md:hidden px-2">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">

        {/* TABELA DESKTOP */}
        <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white mb-6">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] bg-gray-50 border-b border-gray-100 px-6 py-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"> </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Início</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fim</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Funcionário</span>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Nenhum plantão encontrado.</p>
            ) : filtered.map((p) => (
              <div key={p.id} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex justify-start">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="w-4 h-4 accent-[#B5071A]" />
                </div>
                <span className="text-xs font-bold text-gray-400">{p.id.split('-')[0].toUpperCase()}</span>
                <span className="text-xs font-bold text-gray-700">{formatDate(p.periodo.Inicio)}</span>
                <span className="text-xs font-bold text-gray-700">{formatDate(p.periodo.Fim)}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full w-fit ${
                  p.status === 'APROVADO' || p.status === '1' ? 'text-green-600 bg-green-50' :
                  p.status === 'RECUSADO' || p.status === '2' ? 'text-red-600 bg-red-50' :
                  'text-orange-600 bg-orange-50'
                }`}>
                  {statusLabel[p.status] ?? p.status}
                </span>
                <span className="text-xs font-bold text-gray-700">{p.funcionario}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden">
          <div className="max-h-[360px] overflow-y-auto space-y-3 pb-4 pr-1 custom-scrollbar">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Nenhum plantão encontrado.</p>
            ) : filtered.map((p) => (
              <div key={p.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-gray-400">CÓD: {p.id.split('-')[0].toUpperCase()}</span>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="w-5 h-5 accent-[#B5071A]" />
                </div>
                <p className="text-sm font-bold text-gray-700">{p.funcionario}</p>
                <p className="text-[11px] text-gray-500">{formatDate(p.periodo.Inicio)} até {formatDate(p.periodo.Fim)}</p>
                <div className="mt-3 flex justify-end">
                  <span className={`text-[10px] font-bold uppercase ${
                    p.status === 'APROVADO' ? 'text-green-600' :
                    p.status === 'RECUSADO' ? 'text-red-600' :
                    'text-orange-500'
                  }`}>
                    {statusLabel[p.status] ?? p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length > 2 && (
            <div className="text-center py-2">
              <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
            </div>
          )}
        </div>

        {/* TOOLBAR */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2">
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <Info size={14} /> Detalhes
            </button>
            <button
              onClick={handleDelete}
              disabled={selected.size === 0 || deleting}
              className="flex items-center justify-center gap-2 bg-[#B5071A] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all disabled:opacity-30"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Deletar
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <DollarSign size={14} /> Pagar
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <Edit size={14} /> Alterar
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <Plus size={14} /> Inserir
            </button>
            <button onClick={() => navigate('/scale/month')} className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <Calendar size={14} /> Escala
            </button>
            <button onClick={() => navigate('/reports')} className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <FileText size={14} /> Relatório
            </button>
            <button onClick={() => navigate('/home')} className="flex items-center justify-center gap-2 bg-gray-400 text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              Voltar
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CRIAR PLANTÃO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#B5071A]">Novo Plantão</h3>
                <p className="text-[10px] text-gray-400 font-medium">Preencha os dados do plantão.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Funcionário</label>
                <select
                  required
                  value={form.colaborador_id}
                  onChange={e => setForm(f => ({ ...f, colaborador_id: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#B5071A] transition-colors bg-white"
                >
                  <option value="">Selecione...</option>
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Início</label>
                  <input
                    type="date"
                    value={form.inicio}
                    onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#B5071A] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fim</label>
                  <input
                    type="date"
                    value={form.fim}
                    onChange={e => setForm(f => ({ ...f, fim: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#B5071A] transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[10px] font-bold uppercase text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-[#B5071A] text-white text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {saving ? 'Salvando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 10px; }
      `}</style>
    </div>
  );
}
