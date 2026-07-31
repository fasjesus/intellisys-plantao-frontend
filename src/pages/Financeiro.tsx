import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Pencil, X, Save, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../components/Button';
import { scaleService, type ConfigValor, type Feriado } from '../services/scaleService';

type Aba = 'valores' | 'feriados';

const TIPO_DIA_LABEL: Record<ConfigValor['tipo_dia'], string> = {
  UTIL: 'Dia Útil',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
  FERIADO: 'Feriado',
};

const formatDate = (iso: string) => {
  if (!iso) return '—';
  const part = iso.split('T')[0];
  const [y, m, d] = part.split('-');
  if (!y || !m || !d) return '—';
  return `${d}/${m}/${y}`;
};

const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ─── ABA VALORES ─────────────────────────────────────────────────────────── */

function AbaValores() {
  const [valores, setValores] = useState<ConfigValor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    tipo_dia: 'UTIL' as ConfigValor['tipo_dia'],
    valor: '',
    vigencia_inicio: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState('');
  const [editVigencia, setEditVigencia] = useState('');
  const [updating, setUpdating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await scaleService.getConfigValores();
      setValores(Array.isArray(data) ? data : []);
    } catch {
      setValores([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    try {
      await scaleService.createConfigValor({
        tipo_dia: form.tipo_dia,
        valor: parseFloat(form.valor),
        vigencia_inicio: form.vigencia_inicio, // Envia exatamente YYYY-MM-DD
      });
      setShowForm(false);
      setForm({ tipo_dia: 'UTIL', valor: '', vigencia_inicio: '' });
      await load();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar novo valor.';
        alert(`Erro: ${errorMsg}`);
      } else {
        alert('Erro interno ao tentar salvar o valor.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (v: ConfigValor) => {
    if (!editValor || !editVigencia) {
      alert("Por favor, preencha o valor e a data de vigência corretamente.");
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        valor: parseFloat(editValor),
        vigencia_inicio: editVigencia, // Envia exatamente YYYY-MM-DD
      };

      await scaleService.updateConfigValor(v.tipo_dia, payload);
      
      setEditingId(null);
      await load();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Erro desconhecido retornado pela API.';
        alert(`Falha na atualização (400): ${errorMsg}`);
      } else {
        alert('Erro interno ao atualizar o valor.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const vigente = (v: ConfigValor) => !v.vigencia_fim || new Date(v.vigencia_fim) >= new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <Loader2 size={28} className="text-[#B5071A] animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carregando...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Novo Valor</h3>
          <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Tipo de Dia</label>
            <select
              value={form.tipo_dia}
              onChange={e => setForm(f => ({ ...f, tipo_dia: e.target.value as ConfigValor['tipo_dia'] }))}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all cursor-pointer"
            >
              {Object.entries(TIPO_DIA_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.valor}
              onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
              placeholder="Ex: 150.00"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Vigência a partir de</label>
            <input
              type="date"
              required
              value={form.vigencia_inicio}
              onChange={e => setForm(f => ({ ...f, vigencia_inicio: e.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" label="Cancelar" onClick={() => setShowForm(false)} />
            <Button
              type="submit"
              size="lg"
              disabled={creating}
              icon={creating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              label={creating ? 'Salvando...' : 'Salvar'}
            />
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* DESKTOP */}
      <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1fr_1fr_1.2fr_1fr_100px] bg-gray-50 border-b border-gray-100 px-6 py-4">
          {['Tipo de Dia', 'Valor', 'Vigência Início', 'Status', 'Ações'].map(h => (
            <span key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</span>
          ))}
        </div>
        <div className="max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-gray-50">
          {valores.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Nenhum valor cadastrado.</p>
          ) : valores.map(v => (
            <div key={v.id} className="grid grid-cols-[1fr_1fr_1.2fr_1fr_100px] px-6 py-4 items-center hover:bg-gray-50 transition-colors">
              <span className="text-xs font-bold text-gray-700">{TIPO_DIA_LABEL[v.tipo_dia]}</span>
              
              {editingId === v.id ? (
                <input
                  type="number"
                  step="0.01"
                  value={editValor}
                  onChange={e => setEditValor(e.target.value)}
                  className="h-8 w-24 px-2 rounded-lg border border-[#B5071A] text-xs text-gray-700 outline-none"
                />
              ) : (
                <span className="text-xs font-bold text-[#B5071A]">{formatCurrency(v.valor)}</span>
              )}

              {editingId === v.id ? (
                <input
                  type="date"
                  value={editVigencia}
                  onChange={e => setEditVigencia(e.target.value)}
                  className="h-8 w-32 px-2 rounded-lg border border-[#B5071A] text-xs text-gray-700 outline-none"
                />
              ) : (
                <span className="text-xs text-gray-500">{formatDate(v.vigencia_inicio)}</span>
              )}
              
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full w-fit ${vigente(v) ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {vigente(v) ? 'Vigente' : 'Encerrado'}
              </span>

              <div className="flex gap-2">
                {editingId === v.id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(v)}
                      disabled={updating}
                      className="text-[10px] font-bold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                    >
                      {updating ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-[10px] font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { 
                      setEditingId(v.id); 
                      setEditValor(String(v.valor)); 
                      setEditVigencia(v.vigencia_inicio?.split('T')[0] ?? ''); 
                    }}
                    className="text-[10px] font-bold text-gray-400 hover:text-[#B5071A] flex items-center gap-1 transition-colors"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden space-y-3 pb-28">
        {valores.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Nenhum valor cadastrado.</p>
        ) : valores.map(v => (
          <div key={v.id} className="border border-gray-100 rounded-xl p-4 shadow-sm bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-gray-700">{TIPO_DIA_LABEL[v.tipo_dia]}</span>
              {editingId !== v.id && (
                <button
                  onClick={() => { 
                    setEditingId(v.id); 
                    setEditValor(String(v.valor)); 
                    setEditVigencia(v.vigencia_inicio?.split('T')[0] ?? ''); 
                  }}
                  className="text-gray-400 hover:text-[#B5071A] transition-colors"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>

            {editingId === v.id ? (
              <div className="flex flex-col gap-2 mt-2">
                <input
                  type="number"
                  step="0.01"
                  value={editValor}
                  onChange={e => setEditValor(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-[#B5071A] text-sm text-gray-700 outline-none"
                  placeholder="Novo Valor"
                />
                <input
                  type="date"
                  value={editVigencia}
                  onChange={e => setEditVigencia(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-[#B5071A] text-sm text-gray-700 outline-none"
                />
                <div className="flex gap-3 mt-2">
                  <button onClick={() => handleUpdate(v)} disabled={updating} className="text-[11px] font-bold text-green-600 uppercase">
                    {updating ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-[11px] font-bold text-gray-400 uppercase">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-[#B5071A]">{formatCurrency(v.valor)}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-gray-400">A partir de {formatDate(v.vigencia_inicio)}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${vigente(v) ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {vigente(v) ? 'VIGENTE' : 'ENCERRADO'}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!showForm && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0 md:flex md:justify-end md:gap-3">
          <Button label="Novo Valor" icon={<Plus size={14} />} onClick={() => setShowForm(true)} />
        </div>
      )}
    </div>
  );
}

/* ─── ABA FERIADOS ────────────────────────────────────────────────────────── */

function AbaFeriados() {
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState('');
  const [saving, setSaving] = useState(false);

  async function load(a: number) {
    setLoading(true);
    try {
      const data = await scaleService.getFeriados(a);
      setFeriados(Array.isArray(data) ? data : []);
    } catch {
      setFeriados([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(ano); }, [ano]);

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      await scaleService.updateFeriado(id, editData);
      setFeriados(prev => prev.map(f => f.id === id ? { ...f, data: `${editData}T00:00:00Z` } : f));
      setEditingId(null);
    } catch {
      alert('Erro ao atualizar feriado. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <Loader2 size={28} className="text-[#B5071A] animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Seletor de ano */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setAno(a => a - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-[#B5071A] hover:border-[#B5071A] transition-colors text-sm font-bold"
        >‹</button>
        <span className="text-sm font-bold text-gray-700 w-12 text-center">{ano}</span>
        <button
          onClick={() => setAno(a => a + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-[#B5071A] hover:border-[#B5071A] transition-colors text-sm font-bold"
        >›</button>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[2fr_1fr_1fr] bg-gray-50 border-b border-gray-100 px-6 py-4">
          {['Nome', 'Data', 'Ação'].map(h => (
            <span key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</span>
          ))}
        </div>
        <div className="max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-gray-50">
          {feriados.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Nenhum feriado encontrado para {ano}.</p>
          ) : feriados.map(f => (
            <div key={f.id} className="grid grid-cols-[2fr_1fr_1fr] px-6 py-3 items-center hover:bg-gray-50 transition-colors">
              <span className="text-xs font-bold text-gray-700">{f.nome}</span>
              {editingId === f.id ? (
                <input
                  type="date"
                  value={editData}
                  onChange={e => setEditData(e.target.value)}
                  className="h-8 px-2 rounded-lg border border-[#B5071A] text-xs text-gray-700 outline-none"
                />
              ) : (
                <span className="text-xs text-gray-500">{formatDate(f.data)}</span>
              )}
              <div className="flex gap-2">
                {editingId === f.id ? (
                  <>
                    <button
                      onClick={() => handleSave(f.id)}
                      disabled={saving}
                      className="text-[10px] font-bold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                    >
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-[10px] font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                    >
                      <X size={12} /> Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditingId(f.id); setEditData(f.data?.split('T')[0] ?? ''); }}
                    className="text-[10px] font-bold text-gray-400 hover:text-[#B5071A] flex items-center gap-1 transition-colors"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden space-y-3 pb-10">
        {feriados.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Nenhum feriado encontrado para {ano}.</p>
        ) : feriados.map(f => (
          <div key={f.id} className="border border-gray-100 rounded-xl p-4 shadow-sm bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-gray-700">{f.nome}</p>
                {editingId === f.id ? (
                  <input
                    type="date"
                    value={editData}
                    onChange={e => setEditData(e.target.value)}
                    className="mt-1 h-8 px-2 rounded-lg border border-[#B5071A] text-xs text-gray-700 outline-none"
                  />
                ) : (
                  <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(f.data)}</p>
                )}
              </div>
              {editingId === f.id ? (
                <div className="flex gap-2 mt-1">
                  <button onClick={() => handleSave(f.id)} disabled={saving} className="text-[10px] font-bold text-green-600">
                    {saving ? <Loader2 size={12} className="animate-spin" /> : 'Salvar'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-[10px] font-bold text-gray-400">Cancelar</button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingId(f.id); setEditData(f.data?.split('T')[0] ?? ''); }}
                  className="text-gray-400 hover:text-[#B5071A] transition-colors"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────── */

export function Financeiro() {
  const [aba, setAba] = useState<Aba>('valores');

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col">
      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-4xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Configuração Financeira</h2>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium">Gerencie valores de plantão e feriados do sistema.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        {/* ABAS */}
        <div className="flex gap-1 mb-6 bg-gray-50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setAba('valores')}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all',
              aba === 'valores' ? 'bg-white text-[#B5071A] shadow-sm' : 'text-gray-400 hover:text-gray-600',
            ].join(' ')}
          >
            <DollarSign size={13} /> Valores
          </button>
          <button
            onClick={() => setAba('feriados')}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all',
              aba === 'feriados' ? 'bg-white text-[#B5071A] shadow-sm' : 'text-gray-400 hover:text-gray-600',
            ].join(' ')}
          >
            <Calendar size={13} /> Feriados
          </button>
        </div>

        {aba === 'valores' ? <AbaValores /> : <AbaFeriados />}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 10px; }
      `}</style>
    </div>
  );
}