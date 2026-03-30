import { useState, useEffect } from 'react';
import { ArrowLeft, User, IdCard, Hash, Activity, LayoutGrid } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { SearchBar } from '../../components/SearchBar';
import { collaboratorService } from '../../services/collaboratorService';

interface Collaborator {
  id: string;
  login: string;
  name: string;
  code: string;
  status: 'Ativo' | 'Desativo';
}

export function All() {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);

  const { searchTerm, setSearchTerm } = useOutletContext<{
    searchTerm: string;
    setSearchTerm: (v: string) => void;
  }>();

  useEffect(() => {
    async function loadCollaborators() {
      try {
        const data = await collaboratorService.getAll();
        
        const formattedData = data.map((c) => ({
          id: c.id,
          login: c.email.split('@')[0].toUpperCase(), 
          name: c.nome,
          code: c.id.substring(0, 5).toUpperCase(),
          status: c.status === 'ativo' ? 'Ativo' : 'Desativo'
        }));

        setCollaborators(formattedData);
      } catch (error) {
        console.error("Erro ao buscar colaboradores do Docker:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCollaborators();
  }, []);

  const filteredCollaborators = collaborators.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.login.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tela de bloqueio caso não seja admin
  if (!loading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
        <h2 className="text-[#B5071A] font-bold text-xl">Acesso Restrito</h2>
        <p className="text-gray-500 mt-2">Apenas administradores podem visualizar a lista completa.</p>
        <button onClick={() => navigate('/home')} className="mt-4 text-[#1E293B] font-bold underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col pt-6">
      {/* HEADER */}
      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between w-full mb-4 md:mb-2 px-2 md:px-0">
          <button onClick={() => navigate('/home')} className="text-gray-800 hover:opacity-70 outline-none">
            <ArrowLeft size={window.innerWidth < 768 ? 24 : 32} />
          </button>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Colaboradores</h2>
            <p className="text-[12px] md:text-sm text-gray-500 font-medium">Veja aqui sua equipe de colaboradores.</p>
          </div>
          <div className="w-8 md:w-10"></div>
        </div>

        <div className="w-full md:hidden px-2">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B5071A]"></div>
          </div>
        ) : (
          <>
            {/* CABEÇALHO TABELA (Desktop) - Mantido seu Layout */}
            <div className="hidden md:grid grid-cols-[60px_1fr_2fr_1fr_1fr_60px] gap-4 px-4 mb-6 text-gray-400">
              <div></div> 
              <div className="flex flex-col items-center gap-1">
                <User size={22} /><span className="text-[10px] font-bold uppercase">Login</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <IdCard size={22} /><span className="text-[10px] font-bold uppercase">Nome</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Hash size={22} /><span className="text-[10px] font-bold uppercase">Código</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Activity size={22} /><span className="text-[10px] font-bold uppercase">Status</span>
              </div>
              <div className="flex items-center justify-center">
                <LayoutGrid size={22} className="text-[#B5071A]" />
              </div>
            </div>

            {/* LISTA COM SCROLL */}
            <div className="max-h-[40vh] md:max-h-[360px] overflow-y-auto pr-2 custom-scrollbar space-y-3 md:space-y-4">
              {filteredCollaborators.map((user) => (
                <div 
                  key={user.id}
                  onClick={() => navigate(`/users/details/${user.id}`)}
                  className="flex flex-col md:grid md:grid-cols-[60px_1fr_2fr_1fr_1fr_60px] gap-3 md:gap-4 items-start md:items-center bg-white border border-gray-100 rounded-xl p-4 md:p-5 shadow-sm hover:border-[#B5071A]/50 transition-all cursor-pointer"
                >
                  <div className="flex w-full md:w-auto justify-between items-center md:justify-center border-b md:border-none pb-2 md:pb-0 mb-2 md:mb-0">
                    <input type="checkbox" className="w-5 h-5 accent-[#B5071A]" onClick={(e) => e.stopPropagation()} />
                    <span className={`md:hidden text-[10px] font-bold px-2 py-1 rounded uppercase ${user.status === 'Ativo' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {user.status}
                    </span>
                  </div>

                  <div className="flex flex-col md:block">
                    <span className="md:hidden text-[9px] text-gray-400 font-bold uppercase">Login</span>
                    <div className="text-sm md:text-center md:text-xs font-bold text-gray-700">{user.login}</div>
                  </div>

                  <div className="flex flex-col md:block overflow-hidden">
                    <span className="md:hidden text-[9px] text-gray-400 font-bold uppercase">Nome</span>
                    <div className="text-sm md:text-center md:text-xs font-bold text-gray-700 uppercase truncate w-full">{user.name}</div>
                  </div>

                  <div className="flex flex-col md:block">
                    <span className="md:hidden text-[9px] text-gray-400 font-bold uppercase">Código</span>
                    <div className="text-sm md:text-center md:text-xs font-bold text-gray-700">{user.code}</div>
                  </div>

                  <div className="hidden md:block text-center text-xs font-bold text-gray-700">{user.status}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* BOTÕES DE AÇÃO - Cores Ajustadas */}
        <div className="flex flex-col md:flex-row justify-end gap-3 mt-8 md:mt-12">
          <button className="w-full md:w-auto bg-[#B5071A] text-white px-12 py-3 md:py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all">Incluir</button>
          <button className="w-full md:w-auto bg-[#B5071A] text-white px-12 py-3 md:py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all">Alterar</button>
          <button onClick={() => navigate('/home')} className="w-full md:w-auto bg-[#1E293B] text-white px-12 py-3 md:py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all">Voltar</button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 16px; }
      `}</style>
    </div>
  );
}