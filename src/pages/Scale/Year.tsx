import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Year() {
  const navigate = useNavigate();
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="p-8 bg-white min-h-full font-inter">
      {/* Título e Navegação Superior */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/holidays/month')} 
          className="text-gray-800 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={32}/>
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#B5071A]">Feriados - 2026</h2>
          <p className="text-sm text-gray-500 font-medium">Visualize todos os feriados do ano.</p>
        </div>

        <div className="flex items-center gap-4 font-bold text-gray-800">
           <ChevronLeft size={24} className="cursor-pointer hover:text-[#B5071A]"/>
           <span className="text-xl">2026</span>
           <ChevronRight size={24} className="cursor-pointer hover:text-[#B5071A]"/>
        </div>
      </div>

      {/* GRID DE MESES (Visão Anual) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {months.map((month) => (
          <div 
            key={month} 
            onClick={() => navigate('/holidays/month')} // Clique no mês leva para a visão detalhada
            className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white group"
          >
            <h3 className="text-[#B5071A] font-bold text-center mb-3 border-b border-gray-100 pb-2 group-hover:scale-105 transition-transform">
              {month}
            </h3>
            
            {/* Mini Grid representativo dos dias */}
            <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-gray-400 mb-2 font-bold">
              <span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => (
                <div 
                  key={i} 
                  className={`h-5 flex items-center justify-center text-[10px] rounded-sm
                    ${(i + 1) === 12 && month === "Fevereiro" 
                      ? 'bg-[#B5071A] text-white font-bold' 
                      : 'text-gray-600'}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ações Inferiores */}
      <div className="mt-10 flex justify-end gap-4">
         <button className="bg-[#B5071A] text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-red-800 transition-colors">
           Imprimir Calendário Anual
         </button>
         <button 
           onClick={() => navigate('/holidays/month')} 
           className="bg-gray-800 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-gray-900 transition-colors"
         >
           Voltar para Mês
         </button>
      </div>
    </div>
  );
}