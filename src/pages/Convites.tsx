import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2, RefreshCw, Mail, Clock, CheckCircle } from 'lucide-react';
import { conviteService, type Convite } from '../services/conviteService';
import { collaboratorService } from '../services/collaboratorService';
import { Button } from '../components/Button';

interface ConviteRow extends Convite {
  nomeColaborador: string;
}

const formatDate = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

export function Convites() {
  const navigate = useNavigate();
  const [convites, setConvites] = useState<ConviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [selected, setSelected] = useState<ConviteRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [lista, colaboradores] = await Promise.all([
        conviteService.listar(),
        collaboratorService.getAll(),
      ]);
      const colabMap: Record<string, string> = {};
      colaboradores.forEach(c => { colabMap[c.id] = c.nome; });
      setConvites(lista.map(cv => ({
        ...cv,
        nomeColaborador: colabMap[cv.id_colaborador] ?? '—',
      })));
    } catch {
      alert('Erro ao carregar convites.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleRevogar = async (cv: ConviteRow) => {
    if (!confirm(`Revogar convite de ${cv.nomeColaborador}?`)) return;
    setRevoking(cv.token);
    try {
      await conviteService.deletar(cv.token);
      setConvites(prev => prev.filter(c => c.token !== cv.token));
      if (selected?.token === cv.token) setSelected(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao revogar convite.');
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col">

      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-4xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Gerenciamento de Convites</h2>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium">Acompanhe e revogue convites enviados à equipe.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="text-[#B5071A] animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carregando convites...</p>
          </div>
        ) : convites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Mail size={40} className="text-gray-200" />
            <p className="text-gray-500 font-bold text-sm">Nenhum convite encontrado.</p>
            <p className="text-gray-400 text-xs">Os convites enviados aparecerão aqui.</p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white mb-6">
              <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_80px] bg-gray-50 border-b border-gray-100 px-6 py-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Colaborador</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Token</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expira em</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Situação</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Ação</span>
              </div>
              <div className="max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-gray-50">
                {convites.map(cv => {
                  const expirado = new Date(cv.expira_em) < new Date();
                  const isSelected = selected?.token === cv.token;
                  return (
                    <div
                      key={cv.token}
                      onClick={() => setSelected(prev => prev?.token === cv.token ? null : cv)}
                      className={[
                        'grid grid-cols-[1.5fr_1.5fr_1fr_1fr_80px] px-6 py-4 items-center transition-colors cursor-pointer',
                        isSelected ? 'bg-red-50 border-l-2 border-l-[#B5071A]' : 'hover:bg-gray-50',
                      ].join(' ')}
                    >
                      <span className="text-xs font-bold text-gray-700 uppercase truncate">{cv.nomeColaborador}</span>
                      <span className="text-[10px] font-mono text-gray-400 truncate">{cv.token.split('-')[0].toUpperCase()}…</span>
                      <span className="text-xs text-gray-500">{formatDate(cv.expira_em)}</span>
                      <div className="flex items-center gap-1.5">
                        {cv.usado ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle size={10} /> Usado
                          </span>
                        ) : expirado ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            <Clock size={10} /> Expirado
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Pendente</span>
                        )}
                      </div>
                      <div className="flex justify-center">
                        {revoking === cv.token ? (
                          <Loader2 size={14} className="animate-spin text-[#B5071A]" />
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); handleRevogar(cv); }}
                            disabled={cv.usado}
                            className="text-gray-300 hover:text-[#B5071A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-3 pb-28">
              {convites.map(cv => {
                const expirado = new Date(cv.expira_em) < new Date();
                const isSelected = selected?.token === cv.token;
                return (
                  <div
                    key={cv.token}
                    onClick={() => setSelected(prev => prev?.token === cv.token ? null : cv)}
                    className={[
                      'border rounded-xl p-4 shadow-sm cursor-pointer transition-all',
                      isSelected ? 'bg-red-50 border-[#B5071A]' : 'bg-gray-50 border-gray-100',
                    ].join(' ')}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-gray-700 uppercase">{cv.nomeColaborador}</span>
                      {cv.usado ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle size={10} /> Usado
                        </span>
                      ) : expirado ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          <Clock size={10} /> Expirado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Pendente</span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 mb-1">{cv.token.split('-')[0].toUpperCase()}…</p>
                    <p className="text-[11px] text-gray-500">Expira: {formatDate(cv.expira_em)}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0 md:mt-4 md:flex md:justify-end md:gap-3">
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-3">
            <Button
              label="Atualizar"
              variant="secondary"
              icon={<RefreshCw size={14} />}
              onClick={load}
            />
            <Button
              label={revoking ? 'Revogando...' : 'Revogar'}
              icon={revoking ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              disabled={!selected || !!revoking || selected?.usado}
              className={!selected || selected?.usado ? 'opacity-30 cursor-not-allowed' : ''}
              onClick={() => selected && handleRevogar(selected)}
            />
            <Button label="Voltar" variant="secondary" onClick={() => navigate('/users')} />
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 10px; }
      `}</style>
    </div>
  );
}
