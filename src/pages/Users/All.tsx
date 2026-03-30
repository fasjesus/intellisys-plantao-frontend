import { useState, useEffect } from 'react';
import { ArrowLeft, User, IdCard, Hash, Activity, LayoutGrid, Loader2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { SearchBar } from '../../components/SearchBar';
import { collaboratorService } from '../../services/collaboratorService';

interface Collaborator {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  setor: string;
  foto_url: string;
  status: 'ativo' | 'desativo';
  ativo_plantao: 'ativo' | 'inativo';
  data_admissao: string;
  // Campos calculados para exibição na tabela
  displayStatus: string;
  displayCode: string;
}

export function All() {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const { searchTerm, setSearchTerm } = useOutletContext<{
    searchTerm: string;
    setSearchTerm: (v: string) => void;
  }>();

  useEffect(() => {
    async function loadCollaborators() {
      try {
        const savedUserRaw = localStorage.getItem('@Intellisys:user');

        if (!savedUserRaw || savedUserRaw === "undefined" || savedUserRaw === "null") {
          console.warn("Sessão inválida ou expirada.");
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const user = JSON.parse(savedUserRaw);

        const userIsAdmin = user?.role === 'admin';
        setIsAdmin(userIsAdmin);

        if (!userIsAdmin) {
          setLoading(false);
          return;
        }

        const data = await collaboratorService.getAll();
        
        const formattedData = data.map((c: any) => ({
          ...c,
          displayStatus: c.status === 'ativo' ? 'Ativo' : 'Desativo',
          displayCode: c.id ? c.id.split('-')[0].toUpperCase() : 'N/A'
        }));

        setCollaborators(formattedData);
      } catch (error) {
        console.error("Erro ao buscar colaboradores do Docker:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCollaborators();
  }, [navigate]);

  const filteredCollaborators = collaborators.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tela de bloqueio caso não seja admin
  if (!loading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <Activity size={40} className="text-[#B5071A]" />
        </div>
        <h2 className="text-[#B5071A] font-bold text-xl uppercase tracking-tighter">Acesso Restrito</h2>
        <p className="text-gray-500 mt-2 max-w-xs text-sm">
          Sua conta não possui privilégios de Administrador para gerenciar a equipe.
        </p>
        <button 
          onClick={() => navigate('/home')} 
          className="mt-6 bg-[#1E293B] text-white px-8 py-2 rounded-lg font-bold text-xs shadow-md active:scale-95 transition-all"
        >
          VOLTAR AO INÍCIO
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col pt-6">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between w-full mb-4 md:mb-2 px-2 md:px-0">
          <button onClick={() => navigate('/home')} className="text-gray-800 hover:opacity-70 transition-opacity outline-none">
            <ArrowLeft size={window.innerWidth < 768 ? 24 : 32} />
          </button>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Colaboradores</h2>
            <p className="text-[12px] md:text-sm text-gray-500 font-medium tracking-tight">Gerencie sua equipe e permissões.</p>
          </div>
          <div className="w-8 md:w-10"></div>
        </div>

        <div className="w-full md:hidden px-2">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col overflow-hidden">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="text-[#B5071A] animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sincronizando com Docker...</p>
          </div>
        ) : (
          <>
            {/* CABEÇALHO TABELA (Desktop) */}
            <div className="hidden md:grid grid-cols-[60px_1fr_2fr_1fr_1fr_60px] gap-4 px-4 mb-6 text-gray-400">
              <div></div> 
              <div className="flex flex-col items-center gap-1">
                <User size={22} /><span className="text-[10px] font-bold uppercase">Email / Login</span>
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

            {/* LISTA DE COLABORADORES COM SCROLL */}
            <div className="max-h-[45vh] md:max-h-[380px] overflow-y-auto pr-2 custom-scrollbar space-y-3 md:space-y-4">
              {filteredCollaborators.map((user) => (
                <div 
                  key={user.id}
                  onClick={() => navigate(`/users/details/${user.id}`)}
                  className="flex flex-col md:grid md:grid-cols-[60px_1fr_2fr_1fr_1fr_60px] gap-3 md:gap-4 items-start md:items-center bg-white border border-gray-100 rounded-xl p-4 md:p-5 shadow-sm hover:border-[#B5071A]/50 transition-all cursor-pointer group"
                >
                  <div className="flex w-full md:w-auto justify-between items-center md:justify-center border-b md:border-none pb-2 md:pb-0 mb-2 md:mb-0">
                    <input type="checkbox" className="w-5 h-5 accent-[#B5071A]" onClick={(e) => e.stopPropagation()} />
                    <span className={`md:hidden text-[10px] font-bold px-2 py-1 rounded uppercase ${user.status === 'ativo' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {user.displayStatus}
                    </span>
                  </div>

                  <div className="flex flex-col md:block overflow-hidden">
                    <span className="md:hidden text-[9px] text-gray-400 font-bold uppercase">Email</span>
                    <div className="text-sm md:text-center md:text-xs font-bold text-gray-700 truncate">{user.email}</div>
                  </div>

                  <div className="flex flex-col md:block overflow-hidden">
                    <span className="md:hidden text-[9px] text-gray-400 font-bold uppercase">Nome</span>
                    <div className="text-sm md:text-center md:text-xs font-bold text-gray-700 uppercase truncate w-full">{user.nome}</div>
                  </div>

                  <div className="flex flex-col md:block">
                    <span className="md:hidden text-[9px] text-gray-400 font-bold uppercase">Código</span>
                    <div className="text-sm md:text-center md:text-xs font-bold text-gray-500">{user.displayCode}</div>
                  </div>

                  <div className="hidden md:block text-center text-xs font-bold text-gray-700 uppercase">
                    <span className={user.status === 'ativo' ? 'text-green-600' : 'text-gray-400'}>
                      {user.displayStatus}
                    </span>
                  </div>

                  <div className="hidden md:flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <LayoutGrid size={18} className="text-[#B5071A]" />
                  </div>
                </div>
              ))}
              
              {filteredCollaborators.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm font-medium">
                  Nenhum colaborador encontrado com este termo.
                </div>
              )}
            </div>
          </>
        )}

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col md:flex-row justify-end gap-3 mt-8 md:mt-10 pb-6">
          <button className="w-full md:w-auto bg-[#B5071A] text-white px-12 py-3 md:py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all">
            Incluir
          </button>
          <button className="w-full md:w-auto bg-[#B5071A] text-white px-12 py-3 md:py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all">
            Alterar
          </button>
          <button 
            onClick={() => navigate('/home')} 
            className="w-full md:w-auto bg-[#1E293B] text-white px-12 py-3 md:py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all"
          >
            Voltar
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 16px; }
      `}</style>
    </div>
  );
}