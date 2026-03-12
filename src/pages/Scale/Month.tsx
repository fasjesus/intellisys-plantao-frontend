import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DayScale {
  employee: string;
  holiday?: string;
}

const mockBackendData: Record<string, DayScale> = {
  "2026-02-12": { employee: "Rannyery", holiday: "CARNAVAL" },
  "2026-02-13": { employee: "Flávia Santos", holiday: "" },
  "2026-03-10": { employee: "Ezequiel Oliveira", holiday: "FOLGA LOCAL" },
};

export function Month() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
  const daysOfWeek = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate);
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  let firstDayIndex = new Date(year, month, 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; 

  const startEmptySlots = Array.from({ length: firstDayIndex });
  const totalUsedSlots = daysInMonth + firstDayIndex;
  const rowsNeeded = Math.ceil(totalUsedSlots / 7);
  const endEmptySlots = Array.from({ length: (rowsNeeded * 7) - totalUsedSlots });

  return (
    <div className="p-8 bg-white min-h-full font-inter flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/home')} className="text-gray-800 hover:opacity-70 transition-opacity">
          <ArrowLeft size={32}/>
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#B5071A]">Escala</h2>
          <p className="text-sm text-gray-500 font-medium">Controle de plantões e escalas.</p>
        </div>
        <div className="w-8"></div>
      </div>

      {/* NAVEGAÇÃO */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex gap-8 items-center font-bold text-gray-800">
          <div className="flex items-center gap-2 select-none">
            <ChevronLeft size={24} className="cursor-pointer hover:text-[#B5071A]" onClick={prevMonth}/> 
            <span className="min-w-[110px] text-center">{capitalizedMonth}</span>
            <ChevronRight size={24} className="cursor-pointer hover:text-[#B5071A]" onClick={nextMonth}/>
          </div>
          <span className="text-xl">{year}</span>
        </div>
        <LayoutGrid className="text-[#B5071A] cursor-pointer" size={24} onClick={() => navigate('/scale/year')} />
      </div>

      {/* CONTAINER DO CALENDÁRIO COM SCROLL */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        {/* CABEÇALHO FIXO (Dias da semana) */}
        <div className="grid grid-cols-7 bg-white border-b border-gray-200">
          {daysOfWeek.map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-bold text-gray-400 tracking-widest">{day}</div>
          ))}
        </div>

        {/* ÁREA DE SCROLL - Limitada a 3 linhas (aprox. 338px) */}
        <div className="max-h-[338px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-7 bg-gray-200 gap-[1px]">
            {startEmptySlots.map((_, i) => <div key={`start-${i}`} className="h-28 bg-white" />)}

            {daysArray.map(day => {
              const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const dayInfo = mockBackendData[dateKey];
              const isHoliday = !!dayInfo?.holiday;

              return (
                <div 
                  key={day} 
                  className="h-28 bg-white p-3 flex flex-col justify-between items-end relative hover:bg-gray-50 transition-colors"
                >
                  <div className="absolute top-3 left-3 flex flex-col items-start max-w-[85%]">
                    <span className={`text-[10px] font-bold leading-tight truncate w-full 
                      ${isHoliday ? 'text-[#B5071A]' : dayInfo ? 'text-gray-700' : 'text-gray-300 italic font-medium'}`}>
                      {dayInfo ? dayInfo.employee : "A decidir"}
                    </span>
                    
                    {isHoliday && (
                      <span className="text-[8px] text-gray-400 font-bold mt-0.5 tracking-tighter">
                        {dayInfo.holiday}
                      </span>
                    )}
                  </div>
                  
                  <span className={`text-sm font-bold ${isHoliday ? 'text-[#B5071A]' : 'text-gray-400'}`}>
                    {day.toString().padStart(2, '0')}
                  </span>
                </div>
              );
            })}

            {endEmptySlots.map((_, i) => <div key={`end-${i}`} className="h-28 bg-white" />)}
          </div>
        </div>
      </div>

      {/* RODAPÉ E BOTÕES - Agora sempre visíveis sem scroll de tela */}
      <div className="mt-6 flex justify-between items-end px-2">
        <div className="space-y-1">
          {Object.entries(mockBackendData).map(([date, info]) => {
            if (info.holiday && date.startsWith(`${year}-${(month + 1).toString().padStart(2, '0')}`)) {
              return (
                <p key={date} className="text-[#B5071A] text-xs font-bold">
                  {date.split('-')[2]} - {info.holiday}
                </p>
              );
            }
            return null;
          })}
        </div>
        
        <div className="flex gap-3">
          <button className="bg-[#B5071A] text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md hover:brightness-110 transition-all">
            Relatório
          </button>
          <button onClick={() => navigate('/scale/year')} className="bg-[#B5071A] text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md hover:brightness-110 transition-all">
            Ano
          </button>
          <button onClick={() => navigate('/home')} className="bg-[#B5071A] text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md hover:brightness-110 transition-all">
            Voltar
          </button>
        </div>
      </div>

      {/* esconde a barra de scroll ou deixá-la fina */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d9d9d9;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}