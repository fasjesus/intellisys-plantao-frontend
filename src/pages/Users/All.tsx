import { ArrowLeft, User, IdCard, Hash, Activity, LayoutGrid } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { SearchBar } from '../../components/SearchBar';

interface Collaborator {
  id: string;
  login: string;
  name: string;
  code: string;
  status: 'Ativo' | 'Desativo';
}

export function All() {
  const navigate = useNavigate();
  
  const { searchTerm, setSearchTerm } = useOutletContext<{
    searchTerm: string;
    setSearchTerm: (v: string) => void;
  }>();

  const collaborators: Collaborator[] = [
    { id: '1', login: 'AFONSO', name: 'Afonso Jimenez Gomes Neves', code: '25487', status: 'Ativo' },
    { id: '2', login: 'AFONSO', name: 'Afonso Jimenez Gomes Neves', code: '25487', status: 'Ativo' },
    { id: '3', login: 'AFONSO', name: 'Afonso Jimenez Gomes Neves', code: '25487', status: 'Ativo' },
    { id: '4', login: 'AFONSO', name: 'Afonso Jimenez Gomes Neves', code: '25487', status: 'Ativo' },
    { id: '5', login: 'AFONSO', name: 'Afonso Jimenez Gomes Neves', code: '25487', status: 'Ativo' },
    { id: '6', login: 'AFONSO', name: 'Afonso Jimenez Gomes Neves', code: '25487', status: 'Ativo' },
    { id: '7', login: 'AFONSO', name: 'Afonso Jimenez Gomes Neves', code: '25487', status: 'Ativo' },
  ];

  const filteredCollaborators = collaborators.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.login.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col pt-6">
      {/* HEADER */}
      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between w-full mb-4 md:mb-2">
             <button onClick={() => navigate('/home')} className="text-gray-800 hover:opacity-70 outline-none">
               <ArrowLeft size={window.innerWidth < 768 ? 24 : 32} />
             </button>
             <div className="text-center">
               <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Colaboradores</h2>
               <p className="text-[12px] md:text-sm text-gray-500 font-medium">Veja aqui sua equipe de colaboradores.</p>
             </div>
             <div className="w-8"></div>
        </div>

        {/* BARRA DE PESQUISA MOBILE: Visível apenas abaixo de 768px */}
        <div className="w-full md:hidden px-2">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        {/* CABEÇALHO TABELA (Desktop) */}
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
        <div className="max-h-[50vh] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3 md:space-y-4">
          {filteredCollaborators.map((user) => (
            <div 
              key={user.id}
              onClick={() => navigate(`/users/details/${user.id}`)}
              className="flex flex-col md:grid md:grid-cols-[60px_1fr_2fr_1fr_1fr_60px] gap-3 md:gap-4 items-start md:items-center bg-white border border-gray-100 rounded-xl p-4 md:p-5 shadow-sm hover:border-[#B5071A]/50 transition-all cursor-pointer"
            >
              <div className="flex w-full md:w-auto justify-between items-center md:justify-center border-b md:border-none pb-2 md:pb-0 mb-2 md:mb-0">
                <input type="checkbox" className="w-5 h-5 accent-[#B5071A]" onClick={(e) => e.stopPropagation()} />
                <span className="md:hidden text-[10px] font-bold px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">{user.status}</span>
              </div>

              <div className="flex flex-col md:block">
                <span className="md:hidden text-[9px] text-gray-400 font-bold uppercase">Login</span>
                <div className="text-sm md:text-center md:text-xs font-bold text-gray-600">{user.login}</div>
              </div>

              <div className="flex flex-col md:block">
                <span className="md:hidden text-[9px] text-gray-400 font-bold uppercase">Nome</span>
                <div className="text-sm md:text-center md:text-xs font-bold text-gray-600 uppercase truncate w-full">{user.name}</div>
              </div>

              <div className="flex flex-col md:block">
                <span className="md:hidden text-[9px] text-gray-400 font-bold uppercase">Código</span>
                <div className="text-sm md:text-center md:text-xs font-bold text-gray-600">{user.code}</div>
              </div>

              <div className="hidden md:block text-center text-xs font-bold text-gray-600">{user.status}</div>
              <div className="hidden md:flex justify-center"></div>
            </div>
          ))}
        </div>

        {/* BOTÕES DE AÇÃO */}
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