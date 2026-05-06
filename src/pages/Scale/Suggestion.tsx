import { useState, useMemo } from 'react';
import { Check, RefreshCw, Edit3, CalendarCheck } from 'lucide-react';

interface Suggestion {
  day: number;
  weekDay: string;
  employee: string;
  isHoliday: boolean;
  holidayName?: string;
  weekIndex: number;
}

export function Suggestion() {
  // Lista de funcionários para o rodízio semanal
  const staff = ["Afonso Jimenez", "Ezequiel Oliveira", "Flávia Santos", "Rannyery Silva"];
  const daysOfWeek = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

  // Gerando os 30 dias de Abril/2026 com lógica SEMANAL
  const fullMonthSuggestions = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date(2026, 3, i);
      let dayIndex = date.getDay();
      dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Ajuste para começar na Segunda
      
      // Lógica: Muda o funcionário a cada 7 dias (ou pela semana do ano)
      // Usamos o cálculo de qual semana do mês estamos
      const firstDayOfMonth = new Date(2026, 3, 1);
      let firstDayIdx = firstDayOfMonth.getDay();
      firstDayIdx = firstDayIdx === 0 ? 6 : firstDayIdx - 1;
      
      const weekIndex = Math.floor((i + firstDayIdx - 1) / 7);
      const employee = staff[weekIndex % staff.length];

      const isHoliday = (i === 3) || (i === 5) || (i === 21);
      const holidayName = i === 3 ? "Sexta-feira Santa" : i === 5 ? "Páscoa" : i === 21 ? "Tiradentes" : "";

      days.push({
        day: i,
        weekDay: daysOfWeek[dayIndex],
        employee,
        isHoliday,
        holidayName,
        weekIndex
      });
    }
    return days;
  }, []);

  const [suggestions] = useState<Suggestion[]>(fullMonthSuggestions);

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col items-center mb-4 md:mb-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-center w-full mb-4">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Sugestão: Abril 2026</h2>
            <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-widest text-center">
              Rodízio Semanal de Colaboradores
            </p>
          </div>
        </div>

        <div className="w-full bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
          <CalendarCheck className="text-blue-500 shrink-0" size={20} />
          <p className="text-[10px] md:text-xs text-blue-800">
            Cada funcionário foi alocado para <strong>uma semana inteira</strong>. Revise antes de confirmar.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto w-full flex-grow flex flex-col overflow-hidden">
        
        {/* VISUALIZAÇÃO MOBILE: LISTA POR SEMANAS */}
        <div className="md:hidden flex-grow overflow-y-auto space-y-6 pb-32 custom-scrollbar pr-1">
          {[0, 1, 2, 3, 4].map(wIdx => {
            const weekDays = suggestions.filter(d => d.weekIndex === wIdx);
            if (weekDays.length === 0) return null;
            return (
              <div key={wIdx} className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Semana {wIdx + 1}</h3>
                  <span className="text-[10px] font-bold text-[#B5071A] bg-red-50 px-2 py-0.5 rounded">{weekDays[0].employee}</span>
                </div>
                <div className="space-y-1">
                  {weekDays.map(day => (
                    <div key={day.day} className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-100 justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-gray-400 w-8">{day.weekDay}</span>
                        <span className={`text-sm font-bold ${day.isHoliday ? 'text-[#B5071A]' : 'text-gray-700'}`}>{day.day.toString().padStart(2, '0')}</span>
                      </div>
                      {day.isHoliday && <span className="text-[8px] font-bold text-[#B5071A] uppercase">{day.holidayName}</span>}
                      <Edit3 size={14} className="text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* VISUALIZAÇÃO DESKTOP: GRID IGUAL À TELA DE ESCALA DO MÊS */}
        <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="grid grid-cols-7 bg-white border-b border-gray-100">
            {daysOfWeek.map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-bold text-gray-400 tracking-widest">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 bg-gray-200 gap-[1px]">
            {/* Espaços vazios iniciais para Abril/2026 (Começa na Quarta = index 2) */}
            <div className="h-28 bg-white opacity-50"></div>
            <div className="h-28 bg-white opacity-50"></div>
            
            {suggestions.map((item) => (
              <div key={item.day} className="h-28 bg-white p-3 flex flex-col justify-between items-end hover:bg-gray-50 transition-colors group">
                <div className="w-full text-left">
                  <span className={`text-[10px] font-bold block truncate transition-colors
                    ${item.isHoliday ? 'text-[#B5071A]' : 'text-gray-700'}`}>
                    {item.employee}
                  </span>
                  {item.isHoliday && <span className="text-[8px] text-gray-400 font-bold">{item.holidayName}</span>}
                </div>
                
                <div className="flex justify-between items-end w-full">
                  <Edit3 size={14} className="text-gray-200 group-hover:text-[#B5071A] cursor-pointer" />
                  <span className={`text-sm font-bold ${item.isHoliday ? 'text-[#B5071A]' : 'text-gray-400'}`}>
                    {item.day.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Espaços vazios finais */}
            <div className="h-28 bg-white opacity-50"></div>
            <div className="h-28 bg-white opacity-50"></div>
            <div className="h-28 bg-white opacity-50"></div>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0 md:mt-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-[#1E293B] text-white py-3 md:py-2.5 rounded-xl text-[11px] font-bold uppercase shadow-md active:scale-95 transition-all">
              <RefreshCw size={16} /> Regerar Escala Semanal
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#B5071A] text-white py-3 md:py-2.5 rounded-xl text-[11px] font-bold uppercase shadow-md active:scale-95 transition-all">
              <Check size={18} /> Confirmar e Publicar Abril
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 10px; }
      `}</style>
    </div>
  );
}