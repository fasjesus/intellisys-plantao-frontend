import { useState, useEffect } from 'react';
import { FileText, Calendar as CalendarIcon, User as UserIcon, Loader2, Printer } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collaboratorService, type Collaborator } from '../services/collaboratorService';
import { dutyService } from '../services/dutyService';
import { Button } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { pdf } from '@react-pdf/renderer';
import { ReportTemplate, registerFonts } from '../components/ReportTemplate';
import type { ReportGroup } from '../components/ReportTemplate';
import { statusLabel, statusClass } from '../utils/dutyStatus';

interface ReportRow {
  colaborador: string;
  inicio: string;
  fim: string;
  status: string;
  valor: number | null;
}


const formatDate = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
};

export function Reports() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(searchParams.get('start') ?? '');
  const [endDate, setEndDate] = useState(searchParams.get('end') ?? '');
  const [employee, setEmployee] = useState('');
  const [colaboradores, setColaboradores] = useState<Collaborator[]>([]);
  const [loadingColabs, setLoadingColabs] = useState(true);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    collaboratorService.getAll()
      .then(setColaboradores)
      .catch(() => {})
      .finally(() => setLoadingColabs(false));
  }, []);

  useEffect(() => {
    if (searchParams.get('start') && searchParams.get('end')) {
      handleGenerate(searchParams.get('start')!, searchParams.get('end')!, '');
    }
  }, []);

  const handleGenerate = async (start: string, end: string, emp: string) => {
    if (!start || !end) return;
    setLoading(true);
    setGenerated(false);
    try {
      const plantoes = await dutyService.getByPeriod(start, end);
      if (!Array.isArray(plantoes)) { setRows([]); setGenerated(true); return; }

      const colabMap: Record<string, string> = {};
      colaboradores.forEach(c => { colabMap[c.id] = c.nome; });

      const filtered = emp ? plantoes.filter(p => p.colaborador_id === emp) : plantoes;

      const result: ReportRow[] = await Promise.all(
        filtered.map(async p => {
          if (!colabMap[p.colaborador_id]) {
            try {
              const c = await collaboratorService.getById(p.colaborador_id);
              colabMap[p.colaborador_id] = c.nome;
            } catch {
              colabMap[p.colaborador_id] = '—';
            }
          }
          const per = p.periodo as any;
          return {
            colaborador: colabMap[p.colaborador_id],
            inicio: per.Inicio ?? per.inicio ?? '',
            fim: per.Fim ?? per.fim ?? '',
            status: String(p.status),
            valor: p.valor_total,
          };
        })
      );

      result.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
      setRows(result);
      setGenerated(true);
    } catch {
      setRows([]);
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleGenerate(startDate, endDate, employee);
  };

  const totalValor = rows.reduce((acc, r) => acc + (r.valor ?? 0), 0);

  const periodoInicio = startDate ? new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
  const periodoFim = endDate ? new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
  const emitidoEm = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  const funcionarioNome = employee ? (colaboradores.find(c => c.id === employee)?.nome ?? '—') : 'Todos';

  const handlePrint = async () => {
    // Abre antes do await para não ser bloqueado como popup
    const win = window.open('about:blank', '_blank');

    try {
      let logoBase64 = '';
      try {
        const logoModule = await import('../assets/images/logo.png');
        const res = await fetch(logoModule.default);
        const blob = await res.blob();
        logoBase64 = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch { /* sem logo */ }

      registerFonts();

      let groups: ReportGroup[] | undefined;
      if (!employee) {
        const groupMap = new Map<string, ReportGroup>();
        for (const r of rows) {
          if (!groupMap.has(r.colaborador)) {
            groupMap.set(r.colaborador, { funcionarioNome: r.colaborador, rows: [], totalValor: 0 });
          }
          const g = groupMap.get(r.colaborador)!;
          g.rows.push(r);
          g.totalValor += r.valor ?? 0;
        }
        groups = Array.from(groupMap.values()).sort((a, b) => a.funcionarioNome.localeCompare(b.funcionarioNome));
      }

      const element = ReportTemplate({ rows, periodoInicio, periodoFim, funcionarioNome, emitidoEm, totalValor, logoBase64, groups });
      const blob = await pdf(element).toBlob();
      const url = URL.createObjectURL(blob);

      if (win) {
        win.location.href = url;
      } else {
        window.open(url, '_blank');
      }
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      win?.close();
    }
  };

  return (
    <>
      {/* TELA NORMAL — escondida no print */}
      <div className="print:hidden p-4 md:p-12 bg-white min-h-full font-inter flex flex-col pt-6">
        <div className="flex flex-col items-center mb-6 md:mb-8 max-w-5xl mx-auto w-full">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Relatório de Escala</h2>
            <p className="text-[10px] md:text-sm text-gray-500 font-medium">Selecione os filtros para gerar o relatório.</p>
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
          <form onSubmit={onSubmit} className="border border-gray-100 rounded-xl p-5 shadow-sm bg-white flex flex-col gap-5">
            <h3 className="text-[#B5071A] font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
              <CalendarIcon size={16} /> Filtros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Início</label>
                <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="h-11 w-full px-4 rounded-xl border border-gray-200 text-sm text-gray-700 focus:border-[#B5071A] outline-none transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Fim</label>
                <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="h-11 w-full px-4 rounded-xl border border-gray-200 text-sm text-gray-700 focus:border-[#B5071A] outline-none transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 flex items-center gap-1">
                  <UserIcon size={11} /> Funcionário
                </label>
                <select value={employee} onChange={e => setEmployee(e.target.value)}
                  className="h-11 w-full px-4 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:border-[#B5071A] outline-none transition-all">
                  <option value="">Todos</option>
                  {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  {loadingColabs && <option disabled>Carregando...</option>}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="submit" label={loading ? 'Gerando...' : 'Gerar'} icon={loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} disabled={loading} />
              {generated && rows.length > 0 && <Button type="button" label="Imprimir" icon={<Printer size={14} />} variant="secondary" onClick={handlePrint} />}
              <Button type="button" label="Voltar" variant="secondary" onClick={() => navigate(-1)} />
            </div>
          </form>

          {generated && (
            <>
              <DataTable<ReportRow & { _key: string }>
                columns={[
                  { header: 'Funcionário' },
                  { header: 'Início' },
                  { header: 'Fim' },
                  { header: 'Status' },
                  { header: 'Valor', className: 'text-right' },
                ]}
                gridCols="grid-cols-[1fr_1fr_1fr_1fr_1fr]"
                items={rows.map((r, i) => ({ ...r, _key: `${r.colaborador}-${r.inicio}-${r.fim}-${i}` }))}
                rowKey={r => r._key}
                emptyMessage="Nenhum plantão encontrado para o período."
                renderRow={r => (
                  <>
                    <span className="text-xs font-bold text-gray-700 truncate">{r.colaborador}</span>
                    <span className="text-xs text-gray-600">{formatDate(r.inicio)}</span>
                    <span className="text-xs text-gray-600">{formatDate(r.fim)}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full w-fit ${statusClass(r.status)}`}>{statusLabel(r.status)}</span>
                    <span className="text-xs font-bold text-gray-700 text-right">{r.valor != null ? `R$ ${r.valor.toFixed(2)}` : '—'}</span>
                  </>
                )}
                renderMobileCard={r => (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-gray-700">{r.colaborador}</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusClass(r.status)}`}>{statusLabel(r.status)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{formatDate(r.inicio)} até {formatDate(r.fim)}</p>
                    <p className="text-sm font-bold text-gray-700 text-right mt-1">{r.valor != null ? `R$ ${r.valor.toFixed(2)}` : '—'}</p>
                  </>
                )}
              />
              {rows.length > 0 && (
                <div className="flex justify-between items-center border border-gray-100 rounded-xl px-6 py-4 bg-gray-50 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{rows.length} plantão(ões) no período</span>
                  <span className="text-sm font-bold text-gray-800">Total: R$ {totalValor.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </>
  );
}
