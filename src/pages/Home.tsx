import { useState } from 'react';
import { Calendar, Users, Clock, CalendarDays, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { UserAvatar } from '../components/UserAvatar';
import { ToolCard } from '../components/ToolCard';
import logo from '../assets/images/logo.png';

export function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const navigate = useNavigate();

  // Função de Busca Global
  const handleGlobalSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.toLowerCase().trim();

    if (!query) return;

    // Lógica de Redirecionamento Inteligente
    if (query.includes('escala') || query.includes('mês') || query.includes('ano')) {
      navigate('/scale/month');
    } else if (query.includes('colab') || query.includes('equipe') || query.includes('user')) {
      navigate('/users');
    } else if (query.includes('plant') || query.includes('hora')) {
      navigate('/plantoes');
    } else {
      // Se não for um comando direto, vai para a lista de usuários com o termo de busca
      navigate(`/users?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter bg-white overflow-x-hidden">
      <header className="relative h-16 md:h-20 flex items-center justify-between px-6 md:px-10 bg-white shadow-md z-20">
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
            <button onClick={() => navigate('/')}><LogOut size={26} /></button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="absolute right-0 top-0 h-full w-[52%] bg-[#B5071A] diagonal-bg flex md:hidden items-center justify-end px-4 gap-3">
          <button onClick={() => setIsSearchVisible(!isSearchVisible)} className="text-white">
            <Search size={20} />
          </button>
          <UserAvatar name="" />
          <button onClick={() => navigate('/')} className="text-white"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center pt-10 md:pt-24 px-6 gap-8">
        {isSearchVisible && (
          <form onSubmit={handleGlobalSearch} className="w-full max-w-md md:hidden">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </form>
        )}

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-800">
            Acesse as <span className="text-[#B5071A] font-bold">Ferramentas</span>
          </h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Gerencie aqui sua equipe de plantões.</p>
        </div>

        {/* Grid sempre fixo com os 4 itens principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-4xl pb-10">
          <ToolCard label="Escala" icon={<Calendar size={36} />} onClick={() => navigate('/scale/month')} />
          <ToolCard label="Colaboradores" icon={<Users size={36} />} onClick={() => navigate('/users')} />
          <ToolCard label="Plantões" icon={<Clock size={36} />} onClick={() => navigate('/plantoes')} />
          <ToolCard label="Relatórios" icon={<CalendarDays size={36} />} onClick={() => navigate('/relatorios')} />
        </div>
      </main>

      <footer className="bg-[#545454] text-white py-6 text-center text-[10px] md:text-sm px-4 shrink-0">
        Intellisys Informática Ltda / Todos os direitos reservados (c) 2026
      </footer>
    </div>
  );
}