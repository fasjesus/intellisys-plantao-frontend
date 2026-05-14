import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { collaboratorService, type Collaborator } from '../../services/collaboratorService';
import { scaleService } from '../../services/scaleService';
import { dutyService } from '../../services/dutyService';
import { Button } from '../../components/Button';

interface Bloco {
  inicio: number; // dia do mês
  fim: number;    // dia do mês
  collaborator: Collaborator;
}

interface DayEntry {
  day: number;
  weekDayIdx: number;
  collaborator: Collaborator;
  isHoliday: boolean;
  holidayName?: string;
  weekIndex: number;
}

const daysOfWeek = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const pad = (n: number) => String(n).padStart(2, '0');

export function Suggestion() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [staff, setStaff] = useState<Collaborator[]>([]);
  const [holidays, setHolidays] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [staffOffset, setStaffOffset] = useState(0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate);
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  useEffect(() => {
    setStaffOffset(0);
    async function load() {
      setLoading(true);
      try {
        const [colaboradores, feriados] = await Promise.all([
          collaboratorService.getAll(),
          scaleService.getFeriados(year),
        ]);
        setStaff(colaboradores.filter(c => c.ativo_plantao === 'ativo' && c.status === 'ativo'));
        const map: Record<string, string> = {};
        if (Array.isArray(feriados)) {
          feriados.forEach(f => { map[f.data.split('T')[0]] = f.nome; });
        }
        setHolidays(map);
      } catch {
        // mantém vazio
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [year, month]);

  // Blocos de 7 dias corridos a partir do dia 1 do mês
  const blocos = useMemo<Bloco[]>(() => {
    if (staff.length === 0) return [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: Bloco[] = [];
    let day = 1;
    let idx = 0;
    while (day <= daysInMonth) {
      const fim = Math.min(day + 6, daysInMonth);
      result.push({
        inicio: day,
        fim,
        collaborator: staff[(idx + staffOffset) % staff.length],
      });
      day = fim + 1;
      idx++;
    }
    return result;
  }, [staff, year, month, staffOffset]);

  // Expande blocos para DayEntry (para renderização no calendário)
  const suggestions = useMemo<DayEntry[]>(() => {
    const days: DayEntry[] = [];
    for (const bloco of blocos) {
      for (let d = bloco.inicio; d <= bloco.fim; d++) {
        let dayIdx = new Date(year, month, d).getDay();
        dayIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        const weekIndex = Math.floor((d - 1) / 7);
        const dateKey = `${year}-${pad(month + 1)}-${pad(d)}`;
        days.push({
          day: d,
          weekDayIdx: dayIdx,
          collaborator: bloco.collaborator,
          isHoliday: !!holidays[dateKey],
          holidayName: holidays[dateKey],
          weekIndex,
        });
      }
    }
    return days;
  }, [blocos, holidays, year, month]);

  const firstDayIdx = useMemo(() => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1;
  }, [year, month]);

  const handleConfirmar = async () => {
    if (blocos.length === 0) return;
    setConfirming(true);
    try {
      await Promise.all(
        blocos.map(b => dutyService.create({
          colaborador_id: b.collaborator.id,
          periodo: {
            inicio: `${year}-${pad(month + 1)}-${pad(b.inicio)}T12:00:00Z`,
            fim: `${year}-${pad(month + 1)}-${pad(b.fim)}T12:00:00Z`,
          },
        }))
      );
      alert('Escala confirmada com sucesso!');
      navigate('/scale/month');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao confirmar escala.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-white min-h-full font-inter flex flex-col">

      <div className="flex items-center justify-center mb-4 max-w-5xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Sugestão de Escala</h2>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium">Blocos de 7 dias por colaborador.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex gap-4 items-center font-bold text-gray-800">
            <ChevronLeft size={24} className="cursor-pointer hover:text-[#B5071A]" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} />
            <span className="text-lg md:text-xl">{capitalizedMonth} {year}</span>
            <ChevronRight size={24} className="cursor-pointer hover:text-[#B5071A]" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-grow py-20">
            <Loader2 size={32} className="text-[#B5071A] animate-spin" />
          </div>
        ) : staff.length === 0 ? (
          <div className="flex items-center justify-center flex-grow py-20">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Nenhum colaborador disponível para plantão.</p>
          </div>
        ) : (
          <>
            {/* RESUMO DOS BLOCOS */}
            <div className="mb-4 border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 px-4 py-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Período</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dias</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Colaborador</span>
              </div>
              {blocos.map((b, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-gray-50 items-center hover:bg-gray-50">
                  <span className="text-xs font-bold text-gray-700">{pad(b.inicio)}/{pad(month + 1)} → {pad(b.fim)}/{pad(month + 1)}</span>
                  <span className="text-xs text-gray-500">{b.fim - b.inicio + 1} dias</span>
                  <span className="text-xs font-bold text-[#B5071A]">{b.collaborator.nome}</span>
                </div>
              ))}
            </div>

            {/* CALENDÁRIO DESKTOP */}
            <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                {daysOfWeek.map(d => (
                  <div key={d} className="py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 bg-gray-100 gap-[1px]">
                {Array.from({ length: firstDayIdx }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-20 bg-white opacity-50" />
                ))}
                {suggestions.map(item => (
                  <div key={item.day} className={`h-20 p-2 flex flex-col justify-between hover:bg-gray-50 transition-colors ${item.isHoliday ? 'bg-[#B5071A]/5' : 'bg-white'}`}>
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-lg font-bold leading-none ${item.isHoliday ? 'text-[#B5071A]' : 'text-[#B8BEC7]'}`}>{item.day}</span>
                      {item.isHoliday && <span className="text-[8px] font-bold text-[#B5071A] uppercase leading-tight line-clamp-1">{item.holidayName}</span>}
                    </div>
                    <span className="text-[9px] font-semibold truncate text-gray-500">{item.collaborator.nome.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-3 pb-32">
              {blocos.map((b, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bloco {i + 1}</p>
                    <p className="text-xs font-bold text-gray-700">{pad(b.inicio)}/{pad(month + 1)} → {pad(b.fim)}/{pad(month + 1)}</p>
                    <p className="text-[10px] text-gray-500">{b.fim - b.inicio + 1} dias</p>
                  </div>
                  <span className="text-xs font-bold text-[#B5071A] bg-red-50 px-3 py-1.5 rounded-lg">{b.collaborator.nome.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0 md:mt-4 md:flex md:justify-end md:gap-3">
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-3">
            <Button
              variant="secondary"
              icon={<RefreshCw size={14} />}
              label="Regerar"
              onClick={() => setStaffOffset(o => o + 1)}
            />
            <Button
              icon={confirming ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              label={confirming ? 'Confirmando...' : 'Confirmar'}
              disabled={confirming || blocos.length === 0}
              onClick={handleConfirmar}
            />
            <Button
              variant="secondary"
              label="Voltar"
              onClick={() => navigate('/scale/month')}
            />
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
