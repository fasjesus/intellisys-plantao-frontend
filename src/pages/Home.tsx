import { useState } from 'react';
import { Calendar, Users, Clock, CalendarDays, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { UserAvatar } from '../components/UserAvatar';
import { ToolCard } from '../components/ToolCard';
import logo from '../assets/images/logo.png';

export function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleGlobalSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.toLowerCase().trim();
    if (!query) return;

    if (query.includes('escala') || query.includes('mês') || query.includes('ano')) {
      navigate('/scale/month');
    } else if (query.includes('colab') || query.includes('equipe') || query.includes('user')) {
      navigate('/users');
    } else if (query.includes('plant') || query.includes('hora')) {
      navigate('/plantoes');
    } else {
      navigate(`/users?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter bg-white overflow-x-hidden">
      {/* HEADER */}
      <header className="relative h-18 md:h-20 flex items-center justify-between px-6 md:px-10 bg-white shadow-md z-30">
        <div className="z-10 shrink-0">
          <img src={logo} alt="Intellisys" className="h-6 md:h-8 w-auto object-contain" />
        </div>

        {/* Diagonal Desktop */}
        <div className="absolute right-0 top-0 h-full w-[78%] bg-[#B5071A] diagonal-bg hidden md:flex items-center justify-end px-16 gap-12">
          <form onSubmit={handleGlobalSearch} className="flex-grow max-w-sm">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </form>
          <div className="flex items-center gap-8 text-white">
            <UserAvatar name="USUÁRIO" />
            <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity outline-none">
              <LogOut size={26} />
            </button>
          </div>
        </div>

        {/* Diagonal Mobile */}
        <div className="absolute right-0 top-0 h-full w-[40%] bg-[#B5071A] diagonal-bg flex md:hidden items-center justify-end px-4 gap-4">
          <UserAvatar name="" />
          <button onClick={() => navigate('/')} className="text-white active:opacity-50 transition-opacity">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* MAIN: Ajustado o padding-top (pt) e o gap para mobile */}
      <main className="flex-grow flex flex-col items-center pt-6 md:pt-24 px-6 gap-4 md:gap-12">  

        {/* Bloco de Texto Superior: Margem negativa ou reduzida para aproximar da busca */}
        <div className="text-center mb-2 md:mb-0">
          <h2 className="text-xl md:text-3xl font-medium text-gray-800">
            Acesse as <span className="text-[#B5071A] font-bold">Ferramentas</span>
          </h2>
          <p className="text-gray-500 text-xs md:text-base leading-relaxed">
            Gerencie aqui sua equipe de plantões.
          </p>
        </div>

        {/* BUSCA MOBILE: Espaçamento reduzido */}
        <div className="w-full max-w-md md:hidden mb-4">
          <form onSubmit={handleGlobalSearch}>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </form>
        </div>

        {/* GRID DE FERRAMENTAS: Gap reduzido para subir os ícones */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-16 gap-y-6 md:gap-8 w-full max-w-4xl pb-8">
          <div className="active:scale-95 transition-transform md:active:scale-100 flex flex-col items-center">
            <ToolCard label="Escala" icon={<Calendar size={36} />} onClick={() => navigate('/scale/month')} />
          </div>
          <div className="active:scale-95 transition-transform md:active:scale-100 flex flex-col items-center">
            <ToolCard label="Plantões" icon={<Clock size={36} />} onClick={() => navigate('/plantoes')} />
          </div>
          <div className="active:scale-95 transition-transform md:active:scale-100 flex flex-col items-center">
            <ToolCard label="Colaboradores" icon={<Users size={36} />} onClick={() => navigate('/users')} />
          </div>
          <div className="active:scale-95 transition-transform md:active:scale-100 flex flex-col items-center">
            <ToolCard label="Relatórios" icon={<CalendarDays size={36} />} onClick={() => navigate('/relatorios')} />
          </div>
        </div>
      </main>

      <footer className="bg-[#545454] text-white py-4 md:py-6 text-center text-[10px] md:text-sm px-4 shrink-0">
        Intellisys Informática Ltda / Todos os direitos reservados (c) 2026
      </footer>
    </div>
  );
}