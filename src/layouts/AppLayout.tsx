import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; 
import { Menu, LogOut } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { SearchBar } from '../components/SearchBar';
import { UserAvatar } from '../components/UserAvatar';
import logo from '../assets/images/logo.png';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Ajusta a sidebar 
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden font-inter">
      {/* HEADER PRINCIPAL */}
      <header className="relative h-20 flex items-center justify-between px-4 md:px-10 bg-white shadow-md z-30">
        
        {/* Menu e Logo */}
        <div className="z-40 flex items-center gap-2 md:gap-4 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 outline-none transition-colors"
          >
            <Menu 
              size={28} 
              className={`transition-colors duration-300 ${isSidebarOpen ? 'text-[#B5071A]' : 'text-gray-500'}`}
            />
          </button>
          <img src={logo} alt="Intellisys" className="h-7 md:h-8 w-auto object-contain" />
        </div>
        
        {/* DIAGONAL VERMELHA*/}
        <div className="absolute right-0 top-0 h-full w-[40%] md:w-[58%] bg-[#B5071A] diagonal-bg flex items-center justify-end px-4 md:px-16 gap-4 md:gap-12">
           
           {/* SearchBar: Apenas no Desktop dentro da diagonal */}
           <div className="hidden md:flex flex-grow max-w-sm">
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
           </div>

           {/* Usuário e Logout */}
           <div className="flex items-center gap-3 md:gap-8 text-white z-40">
            <UserAvatar name={window.innerWidth < 768 ? "" : "USUÁRIO"} />
            <button 
              onClick={() => navigate('/')} 
              className="hover:opacity-80 transition-opacity outline-none"
            >
                <LogOut size={window.innerWidth < 768 ? 22 : 28} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* OVERLAY MOBILE: Fecha o menu ao clicar fora */}
        {isSidebarOpen && window.innerWidth < 768 && (
          <div 
            className="fixed inset-0 bg-black/40 z-20" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        <main className="flex-1 overflow-y-auto bg-white">
           {/* Passa o estado de busca para as páginas filhas via Context */}
           <Outlet context={{ searchTerm, setSearchTerm }} /> 
        </main>
      </div>
    </div>
  );
}