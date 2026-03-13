import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Calendar as CalendarIcon, 
  User as UserIcon,
  Download
} from 'lucide-react';

export function Reports() {
  const navigate = useNavigate();
  
  // Estados para os filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employee, setEmployee] = useState('');

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Gerando relatório para:", { startDate, endDate, employee });
    // Aqui entraria a lógica de integração com o back-end
    alert("Relatório solicitado! O download iniciará em breve.");
  };

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col items-center mb-8 md:mb-12 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between w-full px-2 md:px-0">
          <button 
            onClick={() => navigate('/home')} 
            className="text-gray-800 hover:opacity-70 transition-opacity outline-none flex items-center justify-center"
          >
            <ArrowLeft size={window.innerWidth < 768 ? 24 : 32} />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Relatório de Plantões</h2>
            <p className="text-[10px] md:text-sm text-gray-500 font-medium">
              Selecione os filtros para gerar o documento.
            </p>
          </div>
          
          <div className="w-8 md:w-10"></div>
        </div>
      </div>

      <main className="flex-grow flex flex-col items-center w-full max-w-2xl mx-auto">
        <form onSubmit={handleGenerateReport} className="w-full space-y-6">
          
          {/* SEÇÃO: PERÍODO */}
          <div className="space-y-4">
            <h3 className="text-[#B5071A] font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
              <CalendarIcon size={16} /> Período do Relatório
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Início</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12 w-full px-4 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#B5071A] outline-none transition-all"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Fim</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12 w-full px-4 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#B5071A] outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO: FUNCIONÁRIO */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[#B5071A] font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
              <UserIcon size={16} /> Selecionar Funcionário
            </h3>
            <div className="flex flex-col gap-1">
              <select 
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="h-12 w-full px-4 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:border-[#B5071A] outline-none transition-all appearance-none"
                required
              >
                <option value="">Todos os funcionários</option>
                <option value="1">Afonso Jimenez Gomes Neves</option>
                <option value="2">Ezequiel Santos</option>
                <option value="3">Luma Oliveira</option>
              </select>
            </div>
          </div>

          {/* CARD INFORMATIVO (Destaque) */}
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 flex items-start gap-4">
            <FileText className="text-[#B5071A] shrink-0" size={24} />
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase mb-1">Resumo da Emissão</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                O arquivo será gerado em formato PDF contendo o histórico de plantões, 
                faltas e horas extras do período selecionado.
              </p>
            </div>
          </div>

          {/* BOTÃO DE AÇÃO */}
          <button 
            type="submit"
            className="w-full bg-[#B5071A] text-white h-14 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-3 active:scale-[0.98] transition-all mt-4"
          >
            <Download size={20} />
            GERAR RELATÓRIO AGORA
          </button>
        </form>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto bg-[#545454] text-white py-6 text-center text-[10px] md:text-sm px-4 -mx-4 md:-mx-12 shrink-0">
        Intellisys Informática Ltda / Todos os direitos reservados (c) 2026
      </footer>
    </div>
  );
}