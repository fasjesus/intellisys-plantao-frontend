import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, User, 
  Info, DollarSign, Edit, Plus, XCircle, Calendar, FileText 
} from 'lucide-react';
import { SearchBar } from '../components/SearchBar';

interface Duty {
  id: string;
  funcionario: string;
  dataInicio: string;
  dataFim: string;
  tipo: string;
  status: 'Aberto' | 'Pago';
}

export function Duty() {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useOutletContext<{
    searchTerm: string;
    setSearchTerm: (v: string) => void;
  }>();

  const plantoes: Duty[] = [
    { id: '607', funcionario: 'Rannyery Santos Lima', dataInicio: '28/02/2026', dataFim: '06/03/2026', tipo: 'Externo', status: 'Aberto' },
    { id: '606', funcionario: 'Reyges Luiz Santos Lima', dataInicio: '21/02/2026', dataFim: '27/02/2026', tipo: 'Externo', status: 'Aberto' },
    { id: '605', funcionario: 'Rannyery Santos Lima', dataInicio: '28/02/2026', dataFim: '06/03/2026', tipo: 'Externo', status: 'Aberto' },
    { id: '604', funcionario: 'Reyges Luiz Santos Lima', dataInicio: '21/02/2026', dataFim: '27/02/2026', tipo: 'Externo', status: 'Aberto' },
  ];

  const filteredPlantoes = plantoes.filter(p => 
    p.funcionario.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between w-full mb-4 md:mb-2 px-2 md:px-0">
          <button onClick={() => navigate('/home')} className="text-gray-800 hover:opacity-70 outline-none flex items-center justify-center shrink-0">
            <ArrowLeft size={window.innerWidth < 768 ? 24 : 32} />
          </button>
          
          <div className="text-center flex-grow">
            <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Gerenciamento de Plantões</h2>
            <p className="text-[10px] md:text-sm text-gray-500 font-medium">Administre as escalas e pagamentos da equipe.</p>
          </div>
          
          <div className="w-8 md:w-10 shrink-0"></div>
        </div>

        <div className="w-full md:hidden px-2">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
        
        {/* TABELA DESKTOP */}
        <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white mb-6">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_120px] bg-gray-50 border-b border-gray-100 px-6 py-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"> </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Início / Fim</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Funcionário</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {filteredPlantoes.map((p) => (
              <div key={p.id} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_120px] px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex justify-start">
                   <input type="checkbox" className="w-4 h-4 accent-[#B5071A]" />
                </div>                
                <span className="text-sm font-bold text-gray-400">{p.id}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">{p.dataInicio}</span>
                  <span className="text-[10px] text-gray-400">{p.dataFim}</span>
                </div>
                <span className="text-xs font-medium text-gray-600">{p.tipo}</span>
                <span className="text-xs font-bold text-gray-700">{p.funcionario}</span>
                <div className="flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.status === 'Pago' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                    {p.status}
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-3 pb-32">
          {filteredPlantoes.map((p) => (
             <div key={p.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-gray-400">CÓD: {p.id}</span>
                  <input type="checkbox" className="w-5 h-5 accent-[#B5071A]" />
                </div>
                <p className="text-sm font-bold text-gray-700">{p.funcionario}</p>
                <p className="text-[11px] text-gray-500">{p.dataInicio} até {p.dataFim}</p>
                <div className="mt-3 flex justify-between items-center">
                   <span className="text-[10px] font-bold uppercase text-gray-400">{p.tipo}</span>
                   <span className="text-[10px] font-bold text-[#B5071A] uppercase">{p.status}</span>
                </div>
             </div>
          ))}
        </div>

        {/* TOOLBAR DE BOTÕES (AZUIS) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2">
            
            {/* Primeira Linha de Ações */}
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <Info size={14} /> Detalhes
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <DollarSign size={14} /> Pagar
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <Edit size={14} /> Alterar
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <Plus size={14} /> Inserir
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <XCircle size={14} /> Fechar
            </button>
            
            {/* Segunda Linha de Ações */}
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
               VLR Plantão
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <Calendar size={14} /> Escala
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
              <FileText size={14} /> Relatório
            </button>
            <button onClick={() => navigate('/home')} className="flex items-center justify-center gap-2 bg-gray-400 text-white py-2.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all">
               Voltar
            </button>

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