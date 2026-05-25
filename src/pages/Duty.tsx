import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AlertCircle, Info, Plus, Loader2, X, Trash2, CircleDollarSign } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { Button } from '../components/Button';
import { dutyService, type Duty } from '../services/dutyService';
import { collaboratorService, type Collaborator } from '../services/collaboratorService';
import { statusLabel, statusClass, normalizeStatus, statusToApiValue } from '../utils/dutyStatus';

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
  const [selected, setSelected] = useState<DutyWithNome | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
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
          inicio: `${form.inicio}T12:00:00Z`,
          fim: `${form.fim}T12:00:00Z`,
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

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(`Deletar plantão de ${selected.funcionario}?`)) return;
    setDeleting(true);
    try {
      await dutyService.delete(selected.id);
      setPlantoes(prev => prev.filter(p => p.id !== selected.id));
      setSelected(null);
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.response?.data?.message || 'Erro ao deletar plantão.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePagar = async () => {
    if (!selected) return;
    if (!confirm(`Marcar plantão de ${selected.funcionario} como pago?`)) return;
    setPaying(true);
    try {
      await dutyService.updateStatus(selected.id, statusToApiValue('PAGO'));
      setPlantoes(prev => prev.map(p => p.id === selected.id ? { ...p, status: 'PAGO' } : p));
      setSelected(prev => prev ? { ...prev, status: 'PAGO' } : null);
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.response?.data?.message || 'Erro ao pagar plantão.');
    } finally {
      setPaying(false);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    const date = new Date(iso);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
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
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] bg-gray-50 border-b border-gray-100 px-6 py-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Início</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fim</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Funcionário</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Nenhum plantão encontrado.</p>
            ) : filtered.map((p) => {
              const isSelected = selected?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelected(prev => prev?.id === p.id ? null : p)}
                  className={[
                    'grid grid-cols-[1fr_1fr_1fr_1fr_1fr] px-6 py-4 border-b border-gray-50 items-center transition-colors cursor-pointer',
                    isSelected ? 'bg-red-50 border-l-2 border-l-[#B5071A]' : 'hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span className="text-xs font-bold text-gray-400">{p.id.split('-')[0].toUpperCase()}</span>
                  <span className="text-xs font-bold text-gray-700">{formatDate(p.periodo.Inicio)}</span>
                  <span className="text-xs font-bold text-gray-700">{formatDate(p.periodo.Fim)}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full w-fit ${statusClass(p.status)}`}>
                    {statusLabel(p.status)}
                  </span>
                  <span className="text-xs font-bold text-gray-700">{p.funcionario}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden">
          <div className="max-h-[360px] overflow-y-auto space-y-3 pb-4 pr-1 custom-scrollbar">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Nenhum plantão encontrado.</p>
            ) : filtered.map((p) => {
              const isSelected = selected?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelected(prev => prev?.id === p.id ? null : p)}
                  className={[
                    'border rounded-xl p-4 shadow-sm cursor-pointer transition-all',
                    isSelected ? 'bg-red-50 border-[#B5071A]' : 'bg-gray-50 border-gray-100',
                  ].join(' ')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-gray-400">CÓD: {p.id.split('-')[0].toUpperCase()}</span>
                    <span className={`text-[10px] font-bold uppercase ${statusClass(p.status)}`}>{statusLabel(p.status)}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-700">{p.funcionario}</p>
                  <p className="text-[11px] text-gray-500">{formatDate(p.periodo.Inicio)} até {formatDate(p.periodo.Fim)}</p>
                </div>
              );
            })}
          </div>
          {filtered.length > 2 && (
            <div className="text-center py-2">
              <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
            </div>
          )}
        </div>

        {/* TOOLBAR */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0 md:mt-6 md:flex md:justify-end md:gap-3">
          <div className="grid grid-cols-2 gap-2 md:flex md:gap-3">
            <Button
              label="Detalhes"
              icon={<Info size={14} />}
              variant="secondary"
              disabled={!selected}
              className={!selected ? 'opacity-30 cursor-not-allowed' : ''}
              onClick={() => selected && setShowDetalhes(true)}
            />
            <Button
              label={paying ? 'Pagando...' : 'Pagar'}
              icon={paying ? <Loader2 size={14} className="animate-spin" /> : <CircleDollarSign size={14} />}
              disabled={!selected || paying || normalizeStatus(selected?.status ?? '') !== 'CONCLUIDO'}
              className={(!selected || normalizeStatus(selected?.status ?? '') !== 'CONCLUIDO') ? 'opacity-30 cursor-not-allowed' : ''}
              onClick={handlePagar}
            />
            <Button
              label={deleting ? 'Deletando...' : 'Deletar'}
              icon={deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              disabled={!selected || deleting}
              className={!selected ? 'opacity-30 cursor-not-allowed' : ''}
              onClick={handleDelete}
            />
            <Button
              label="Inserir"
              icon={<Plus size={14} />}
              variant="secondary"
              onClick={() => setShowModal(true)}
            />
            <Button
              label="Voltar"
              variant="secondary"
              onClick={() => navigate('/home')}
            />
          </div>
        </div>
      </div>

      {/* MODAL DETALHES */}
      {showDetalhes && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#B5071A]">Detalhes do Plantão</h3>
                <p className="text-[10px] text-gray-400 font-medium">CÓD: {selected.id.split('-')[0].toUpperCase()}</p>
              </div>
              <button onClick={() => setShowDetalhes(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {[
                { label: 'Funcionário', value: selected.funcionario },
                { label: 'Início', value: formatDate(selected.periodo.Inicio) },
                { label: 'Fim', value: formatDate(selected.periodo.Fim) },
                { label: 'Status', value: statusLabel(selected.status) },
                { label: 'Valor Total', value: selected.valor_total != null ? `R$ ${selected.valor_total.toFixed(2)}` : '—' },
                { label: 'Observações', value: selected.observacoes || '—' },
              ].map(({ label, value }, i) => (
                <div key={label} className={`flex justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                  <span className="text-xs font-bold text-gray-700 text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowDetalhes(false)}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-[10px] font-bold uppercase text-gray-500 hover:bg-gray-50 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

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
