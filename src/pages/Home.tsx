import { useState, cloneElement, useEffect } from 'react';
import { Calendar, Users, Clock, CalendarDays, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { ToolCard } from '../components/ToolCard';
import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { dutyService, type Duty } from '../services/dutyService';

export function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('USUÁRIO');
  const [userPhoto, setUserPhoto] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [plantaoAtivo, setPlantaoAtivo] = useState<Duty | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [concluding, setConcluding] = useState(false);
  const [concluded, setConcluded] = useState(false);
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
              const plantoes = await dutyService.getByColaborador(colabId);
              const ativo = Array.isArray(plantoes)
                ? plantoes.find(p => p.status === 'PENDENTE') ?? null
                : null;
              setPlantaoAtivo(ativo);
              if (ativo?.observacoes) setObservacoes(ativo.observacoes);
            } catch {
              setPlantaoAtivo(null);
            }
          }
        }
      } catch (error) {
        console.error("Erro no fluxo de busca de nome:", error);
      }
    }

    loadData();
  }, []);

  const handleConcluir = async () => {
    if (!plantaoAtivo) return;
    setConcluding(true);
    try {
      await dutyService.updateStatus(plantaoAtivo.id, 'APROVADO', observacoes);
      setConcluded(true);
      setPlantaoAtivo(null);
    } finally {
      setConcluding(false);
    }
  };

  const handleLogout = () => {
    authService.logout(); // Limpa tokens e localStorage
    navigate('/');
  };

  const handleGlobalSearch = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.toLowerCase().trim();
    if (!query) return;

    if (query.includes('escala') || query.includes('mês') || query.includes('ano')) {
      navigate('/scale/month');
    } else if (query.includes('colab') || query.includes('equipe') || query.includes('user')) {
      navigate('/users');
    } else if (query.includes('plant') || query.includes('hora')) {
      navigate('/duty');
    } else {
      navigate(`/users?search=${encodeURIComponent(searchTerm)}`);
    }
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

      {/* MAIN */}
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
            {isAdmin ? 'Gerencie aqui sua equipe de plantões.' : 'Confira seu plantão de hoje.'}
          </p>
        </div>

        {/* BUSCA MOBILE - só admin */}
        {isAdmin && (
          <div className="w-full max-w-md md:hidden mb-4">
            <form onSubmit={handleGlobalSearch}>
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </form>
          </div>
        )}

        {/* GRID DE FERRAMENTAS - apenas admin */}
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
          <div className="w-full max-w-md mt-6 pb-8">
            {concluded ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <CheckCircle size={48} className="text-green-500" />
                <p className="text-gray-700 font-bold text-base">Plantão concluído!</p>
                <p className="text-gray-400 text-xs">Obrigado pelo seu trabalho.</p>
              </div>
            ) : plantaoAtivo ? (
              <div className="border border-gray-100 rounded-2xl shadow-sm bg-white overflow-hidden">
                {/* Header do card */}
                <div className="bg-gray-50 border-b border-gray-100 px-5 py-4 flex items-center gap-3">
                  <Clock size={16} className="text-[#B5071A] shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plantão Ativo</p>
                    <p className="text-xs font-bold text-gray-700">
                      {new Date(plantaoAtivo.periodo.Inicio).toLocaleDateString('pt-BR')} →{' '}
                      {new Date(plantaoAtivo.periodo.Fim).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full uppercase">
                    Em andamento
                  </span>
                </div>

                {/* Valor */}
                <div className="px-5 py-4 border-b border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Valor</p>
                  <p className="text-lg font-bold text-gray-800">
                    {plantaoAtivo.valor_total != null ? `R$ ${plantaoAtivo.valor_total.toFixed(2)}` : '—'}
                  </p>
                </div>

                {/* Observações */}
                <div className="px-5 py-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                    Observações
                  </label>
                  <textarea
                    rows={3}
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    placeholder="Adicione uma observação sobre este plantão..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#B5071A] transition-colors resize-none"
                  />
                </div>

                {/* Botão concluir */}
                <div className="px-5 pb-5">
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
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Clock size={40} className="text-gray-200" />
                <p className="text-gray-500 font-bold text-sm">Nenhum plantão ativo no momento.</p>
                <p className="text-gray-400 text-xs">Quando houver um plantão atribuído a você, ele aparecerá aqui.</p>
              </div>
            )}
          </div>
        )}
      </motion.main>

      <AppFooter />
    </div>
  );
}