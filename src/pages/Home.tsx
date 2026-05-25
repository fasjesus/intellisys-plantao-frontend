import { useState, cloneElement, useEffect } from 'react';
import { Calendar, Users, Clock, CalendarDays, CheckCircle, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { ToolCard } from '../components/ToolCard';
import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { dutyService, type Duty } from '../services/dutyService';
import { statusLabel, statusClass, isStatusAtivo, normalizeStatus } from '../utils/dutyStatus';

const formatDate = (iso: string) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
};

const getPerioido = (p: Duty) => {
  const per = p.periodo as any;
  return { inicio: per.Inicio ?? per.inicio ?? '', fim: per.Fim ?? per.fim ?? '' };
};

export function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('USUÁRIO');
  const [userPhoto, setUserPhoto] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [plantoes, setPlantoes] = useState<Duty[]>([]);
  const [selected, setSelected] = useState<Duty | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [concluding, setConcluding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const usuario = await authService.getUsuario();
        const admin = usuario.role?.toLowerCase() === 'admin';
        setIsAdmin(admin);
        const colabId = usuario.id_colaborador;
        if (colabId) {
          const colaborador = await authService.getColaborador(colabId);
          setUserName(colaborador.nome);
          setUserPhoto(colaborador.foto_url || undefined);
          localStorage.setItem('@Intellisys:colaborador', JSON.stringify(colaborador));
          if (!admin) {
            try {
              const data = await dutyService.getByColaborador(colabId);
              setPlantoes(Array.isArray(data) ? data.filter(p => isStatusAtivo(p.status)) : []);
            } catch {
              setPlantoes([]);
            }
          }
        }
      } catch (error) {
        console.error('Erro no fluxo de busca de nome:', error);
      }
    }
    loadData();
  }, []);

  const handleSelectRow = (p: Duty) => {
    setSelected(p);
    setObservacoes(p.observacoes ?? '');
  };

  const handleConcluir = async () => {
    if (!selected) return;
    const novoStatus = isStatusAtivo(selected.status) && normalizeStatus(selected.status) === 'AGENDADO' ? 'EM_ANDAMENTO' : 'CONCLUIDO';
    setConcluding(true);
    try {
      await dutyService.updateStatus(selected.id, novoStatus, observacoes);
      setPlantoes(prev => prev.map(x => x.id === selected.id ? { ...x, status: novoStatus } : x));
      setSelected(prev => prev ? { ...prev, status: novoStatus } : null);
      setObservacoes('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao atualizar plantão. Tente novamente.');
    } finally {
      setConcluding(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleGlobalSearch = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.toLowerCase().trim();
    if (!query) return;
    if (query.includes('escala') || query.includes('mês')) navigate('/scale/month');
    else if (query.includes('colab') || query.includes('equipe')) navigate('/users');
    else if (query.includes('plant')) navigate('/duty');
    else navigate(`/users?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen flex flex-col font-inter bg-white overflow-x-hidden">
      <AppHeader
        userName={userName}
        userPhoto={userPhoto}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleGlobalSearch}
        onLogout={handleLogout}
      />

      <motion.main
        className="flex-grow flex flex-col items-center pt-6 md:pt-24 px-6 gap-4 md:gap-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
      >
        <div className="text-center mb-2 md:mb-0">
          <h2 className="text-xl md:text-3xl font-medium text-gray-800">
            Olá, <span className="text-[#B5071A] font-bold">{userName.split(' ')[0]}</span>
          </h2>
          <p className="text-gray-500 text-xs md:text-base leading-relaxed">
            {isAdmin ? 'Gerencie aqui sua equipe de plantões.' : 'Confira seus plantões.'}
          </p>
        </div>

        {isAdmin && (
          <div className="w-full max-w-md md:hidden mb-4">
            <form onSubmit={handleGlobalSearch}>
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </form>
          </div>
        )}

        {isAdmin && (
          <div className="flex flex-col md:flex-row md:justify-center gap-3 md:gap-4 w-full max-w-3xl mt-10 pb-8">
            {[
              { label: "Escala", icon: <Calendar size={20} />, path: '/scale/month' },
              { label: "Plantões", icon: <Clock size={20} />, path: '/duty' },
              { label: "Colaboradores", icon: <Users size={20} />, path: '/users' },
              { label: "Relatórios", icon: <CalendarDays size={20} />, path: '/reports' },
            ].map((item) => (
              <div key={item.label} className="md:w-48">
                <div className="hidden md:block">
                  <ToolCard
                    label={item.label}
                    icon={cloneElement(item.icon as React.ReactElement<{ size: number }>, { size: 42 })}
                    onClick={() => navigate(item.path)}
                  />
                </div>
                <button
                  onClick={() => navigate(item.path)}
                  className="md:hidden w-full transition-all active:scale-[0.98] flex items-center bg-[#B5071A] border border-gray-200 h-12 px-4 rounded-2xl shadow-sm gap-3 group"
                >
                  <div className="text-white shrink-0">{item.icon}</div>
                  <span className="text-white text-xs uppercase tracking-wider font-bold">{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* VIEW DO COLABORADOR */}
        {!isAdmin && (
          <div className="w-full max-w-2xl mt-4 pb-8 flex flex-col gap-3">
            {plantoes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Clock size={40} className="text-gray-200" />
                <p className="text-gray-500 font-bold text-sm">Nenhum plantão ativo no momento.</p>
                <p className="text-gray-400 text-xs">Quando houver um plantão atribuído a você, ele aparecerá aqui.</p>
              </div>
            ) : plantoes.map(p => {
              const { inicio, fim } = getPerioido(p);
              const isSelected = selected?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectRow(p)}
                  className={[
                    'border rounded-2xl p-5 cursor-pointer transition-all shadow-sm',
                    isSelected ? 'border-[#B5071A] bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={isSelected ? 'text-[#B5071A]' : 'text-gray-400'} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        CÓD: {p.id.split('-')[0].toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${statusClass(p.status)}`}>
                      {statusLabel(p.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Início</p>
                      <p className="text-sm font-bold text-gray-700">{formatDate(inicio)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Fim</p>
                      <p className="text-sm font-bold text-gray-700">{formatDate(fim)}</p>
                    </div>
                    {p.valor_total != null && p.valor_total > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Valor</p>
                        <p className="text-sm font-bold text-gray-700">R$ {p.valor_total.toFixed(2)}</p>
                      </div>
                    )}
                    {p.observacoes && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Observações</p>
                        <p className="text-xs text-gray-600">{p.observacoes}</p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </motion.main>

      <AppFooter />

      {/* MODAL DETALHES DO PLANTÃO */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#B5071A]">Plantão Ativo</h3>
                <p className="text-[10px] text-gray-400 font-medium">
                  {formatDate(getPerioido(selected).inicio)} → {formatDate(getPerioido(selected).fim)}
                </p>
              </div>
              <button onClick={() => { setSelected(null); setObservacoes(''); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {selected.valor_total != null && selected.valor_total > 0 && (
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Valor</p>
                <p className="text-lg font-bold text-gray-800">R$ {selected.valor_total.toFixed(2)}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Observações</label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                placeholder="Adicione uma observação..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#B5071A] transition-colors resize-none"
              />
            </div>

            {normalizeStatus(selected.status) === 'AGENDADO' && (
              <button
                onClick={handleConcluir}
                disabled={concluding}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {concluding
                  ? <><Loader2 size={14} className="animate-spin" /> Iniciando...</>
                  : <><CheckCircle size={14} /> Iniciar Plantão</>
                }
              </button>
            )}
            {normalizeStatus(selected.status) === 'EM_ANDAMENTO' && (
              <button
                onClick={handleConcluir}
                disabled={concluding}
                className="w-full bg-[#B5071A] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {concluding
                  ? <><Loader2 size={14} className="animate-spin" /> Concluindo...</>
                  : <><CheckCircle size={14} /> Concluir Plantão</>
                }
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
