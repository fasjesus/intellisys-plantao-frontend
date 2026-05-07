import { useState, cloneElement, useEffect } from 'react';
import { Calendar, Users, Clock, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { ToolCard } from '../components/ToolCard';
import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

export function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('USUÁRIO');
  const [userPhoto, setUserPhoto] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const usuario = await authService.getUsuario();
        setIsAdmin(usuario.role === 'admin');
        const colabId = usuario.id_colaborador;
        if (colabId) {
          const colaborador = await authService.getColaborador(colabId);
          setUserName(colaborador.nome);
          setUserPhoto(colaborador.foto_url || undefined);
          localStorage.setItem('@Intellisys:colaborador', JSON.stringify(colaborador));
        }
      } catch (error) {
        console.error("Erro no fluxo de busca de nome:", error);
      }
    }

    loadData();
  }, []);

  const handleLogout = () => {
    authService.logout(); // Limpa tokens e localStorage
    navigate('/');
  };

  const handleGlobalSearch = (e?: React.FormEvent) => {
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
            Gerencie aqui sua equipe de plantões.
          </p>
        </div>

        {/* BUSCA MOBILE */}
        <div className="w-full max-w-md md:hidden mb-4">
          <form onSubmit={handleGlobalSearch}>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </form>
        </div>

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
              {/* Desktop: ToolCard já é um button com onClick */}
              <div className="hidden md:block">
                <ToolCard
                  label={item.label}
                  icon={cloneElement(item.icon as React.ReactElement<{ size: number }>, { size: 42 })}
                  onClick={() => navigate(item.path)}
                />
              </div>

              {/* Mobile: button simples */}
              <button
                onClick={() => navigate(item.path)}
                className="
                  md:hidden w-full transition-all active:scale-[0.98]
                  flex items-center
                  bg-[#B5071A]
                  border border-gray-200
                  h-12 px-4
                  rounded-2xl
                  shadow-sm
                  gap-3 group
                "
              >
                <div className="text-white shrink-0">
                  {item.icon}
                </div>
                <span className="text-white text-xs uppercase tracking-wider font-bold">
                  {item.label}
                </span>
              </button>
            </div>
          ))}
        </div>
        )}
      </motion.main>

      <AppFooter />
    </div>
  );
}