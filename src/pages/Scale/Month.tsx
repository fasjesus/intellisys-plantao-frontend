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
  const daysOfWeek = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate);
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const getWeeks = () => {
    const weeks = [];
    let currentWeek = [];
    let firstDayIndex = new Date(year, month, 1).getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    for (let i = 0; i < firstDayIndex; i++) currentWeek.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  };

  const weeks = getWeeks();

  return (
    <div className="p-4 md:p-8 bg-white min-h-full font-inter flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto w-full">
        <button onClick={() => navigate('/home')} className="text-gray-800">
          <ArrowLeft size={window.innerWidth < 768 ? 24 : 32}/>
        </button>
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Escala</h2>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium">Controle de escalas de plantões.</p>
        </div>
        <div className="w-8"></div>
      </div>

      <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col overflow-hidden">
        {/* NAVEGAÇÃO */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex gap-4 items-center font-bold text-gray-800">
            <ChevronLeft size={24} className="cursor-pointer hover:text-[#B5071A]" onClick={prevMonth}/> 
            <span className="text-lg md:text-xl">{capitalizedMonth} {year}</span>
            <ChevronRight size={24} className="cursor-pointer hover:text-[#B5071A]" onClick={nextMonth}/>
          </div>
          <LayoutGrid className="text-[#B5071A] cursor-pointer" size={24} onClick={() => navigate('/scale/year')} />
        </div>

        {/* VISUALIZAÇÃO MOBILE (LISTA POR SEMANAS) */}
        <div className="md:hidden flex-grow overflow-y-auto space-y-6 pb-24 custom-scrollbar">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="space-y-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                Semana {weekIdx + 1}
              </h3>
              <div className="space-y-1">
                {week.map((day, dayIdx) => {
                  if (!day) return null;
                  const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const dayInfo = mockBackendData[dateKey];
                  const isHoliday = !!dayInfo?.holiday;

                  return (
                    <div key={dayIdx} className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex flex-col items-center justify-center border-r border-gray-200 pr-4 mr-4 min-w-[45px]">
                        <span className="text-[10px] font-bold text-gray-400">{daysOfWeek[dayIdx]}</span>
                        <span className={`text-lg font-bold ${isHoliday ? 'text-[#B5071A]' : 'text-gray-700'}`}>
                          {day.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <p className={`text-sm font-bold ${dayInfo ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                          {dayInfo ? dayInfo.employee : "A decidir"}
                        </p>
                        {isHoliday && (
                          <span className="text-[9px] bg-[#B5071A]/10 text-[#B5071A] px-1.5 py-0.5 rounded font-bold uppercase">
                            {dayInfo.holiday}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* VISUALIZAÇÃO DESKTOP (GRID TRADICIONAL COM SCROLL) */}
        <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="grid grid-cols-7 bg-white border-b border-gray-200">
            {daysOfWeek.map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-bold text-gray-400 tracking-widest">{day}</div>
            ))}
          </div>
          
          {/* SCROLL: */}
          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-7 bg-gray-200 gap-[1px]">
              {weeks.flatMap((week) => week).map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="h-28 bg-white" />;
                const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const dayInfo = mockBackendData[dateKey];
                const isHoliday = !!dayInfo?.holiday;

                return (
                  <div key={i} className="h-28 bg-white p-3 flex flex-col justify-between items-end hover:bg-gray-50 transition-colors">
                      <div className="w-full text-left">
                        <span className={`text-[10px] font-bold block truncate ${isHoliday ? 'text-[#B5071A]' : 'text-gray-700'}`}>
                          {dayInfo ? dayInfo.employee : "A decidir"}
                        </span>
                        {isHoliday && <span className="text-[8px] text-gray-400 font-bold">{dayInfo.holiday}</span>}
                      </div>
                      <span className={`text-sm font-bold ${isHoliday ? 'text-[#B5071A]' : 'text-gray-400'}`}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0 md:mt-6 md:flex md:justify-end">
        <div className="grid grid-cols-3 gap-2 md:flex md:gap-3">
          <button className="bg-[#B5071A] text-white py-3 md:px-8 md:py-2.5 rounded-xl font-bold text-[10px] md:text-xs shadow-md active:scale-95 transition-all">Relatório</button>
          <button onClick={() => navigate('/scale/year')} className="bg-[#B5071A] text-white py-3 md:px-8 md:py-2.5 rounded-xl font-bold text-[10px] md:text-xs shadow-md active:scale-95 transition-all">Ano</button>
          <button onClick={() => navigate('/home')} className="bg-[#1E293B] text-white py-3 md:px-8 md:py-2.5 rounded-xl font-bold text-[10px] md:text-xs shadow-md active:scale-95 transition-all">Voltar</button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 10px; }
      `}</style>
    </div>
  );
}