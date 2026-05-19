import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, Printer } from 'lucide-react';
import { collaboratorService, type Collaborator } from '../../services/collaboratorService';
import { dutyService, type Duty } from '../../services/dutyService';
import { Button } from '../../components/Button';
import { pdf } from '@react-pdf/renderer';
import { ReportTemplate, registerFonts } from '../../components/ReportTemplate';

const statusLabel: Record<string, string> = {
  PENDENTE: 'Aberto', APROVADO: 'Pago', RECUSADO: 'Recusado',
  '0': 'Aberto', '1': 'Pago', '2': 'Recusado',
};

const statusStyle: Record<string, string> = {
  APROVADO: 'text-green-600 bg-green-50',
  '1': 'text-green-600 bg-green-50',
  RECUSADO: 'text-red-600 bg-red-50',
  '2': 'text-red-600 bg-red-50',
};

const formatDate = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
};

export function DutyHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [colaborador, setColaborador] = useState<Collaborator | null>(null);
  const [duties, setDuties] = useState<Duty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      collaboratorService.getById(id),
      dutyService.getByColaborador(id),
    ])
      .then(([colab, ds]) => {
        setColaborador(colab);
        setDuties(ds.sort((a, b) => {
          const ai = a.periodo?.Inicio ?? a.periodo?.inicio ?? '';
          const bi = b.periodo?.Inicio ?? b.periodo?.inicio ?? '';
          return new Date(bi).getTime() - new Date(ai).getTime();
        }));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const totalValor = duties.reduce((acc, d) => acc + (d.valor_total ?? 0), 0);

  const handlePrint = async () => {
    if (!colaborador) return;
    const win = window.open('about:blank', '_blank');
    setPrinting(true);
    try {
      let logoBase64 = '';
      try {
        const logoModule = await import('../../assets/images/logo.png');
        const res = await fetch(logoModule.default);
        const blob = await res.blob();
        logoBase64 = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch { /* sem logo */ }

      const rows = duties.map(d => {
        const per = d.periodo as any;
        return {
          colaborador: colaborador.nome,
          inicio: per?.Inicio ?? per?.inicio ?? '',
          fim: per?.Fim ?? per?.fim ?? '',
          status: String(d.status),
          valor: d.valor_total,
        };
      });

      const emitidoEm = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

      registerFonts();
      const element = ReportTemplate({
        rows,
        periodoInicio: rows.length ? formatDate(rows[rows.length - 1].inicio) : '—',
        periodoFim: rows.length ? formatDate(rows[0].inicio) : '—',
        funcionarioNome: colaborador.nome,
        emitidoEm,
        totalValor,
        logoBase64,
      });
      const blob = await pdf(element).toBlob();
      const url = URL.createObjectURL(blob);

      if (win) win.location.href = url;
      else window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      win?.close();
    } finally {
      setPrinting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 size={40} className="text-[#B5071A] animate-spin" />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Carregando histórico...</p>
      </div>
    );
  }

  if (error || !colaborador) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
        <AlertCircle size={48} className="text-gray-300" />
        <h2 className="text-gray-600 font-bold">Erro ao carregar histórico</h2>
        <button onClick={() => navigate(-1)} className="bg-[#B5071A] text-white px-8 py-2 rounded-xl text-sm font-bold">Voltar</button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col pt-6">

      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-5xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Histórico de Plantões</h2>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium uppercase tracking-wider">{colaborador.nome}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col">

        {/* TABELA DESKTOP */}
        <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white mb-4">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-gray-50 border-b border-gray-100 px-6 py-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Início</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fim</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Valor</span>
          </div>

          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {duties.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Nenhum plantão registrado.</p>
            ) : duties.map((d) => {
              const per = d.periodo as any;
              const inicio = per?.Inicio ?? per?.inicio ?? '';
              const fim = per?.Fim ?? per?.fim ?? '';
              const st = String(d.status);
              return (
                <div key={d.id} className="grid grid-cols-[1fr_1fr_1fr_1fr] px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors">
                  <span className="text-xs text-gray-600">{formatDate(inicio)}</span>
                  <span className="text-xs text-gray-600">{formatDate(fim)}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full w-fit ${statusStyle[st] ?? 'text-orange-600 bg-orange-50'}`}>
                    {statusLabel[st] ?? st}
                  </span>
                  <span className="text-xs font-bold text-gray-700 text-right">
                    {d.valor_total != null ? `R$ ${d.valor_total.toFixed(2)}` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-3 pb-4">
          {duties.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Nenhum plantão registrado.</p>
          ) : duties.map((d) => {
            const per = d.periodo as any;
            const inicio = per?.Inicio ?? per?.inicio ?? '';
            const fim = per?.Fim ?? per?.fim ?? '';
            const st = String(d.status);
            return (
              <div key={d.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">{formatDate(inicio)} → {formatDate(fim)}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyle[st] ?? 'text-orange-600 bg-orange-50'}`}>
                    {statusLabel[st] ?? st}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-700 text-right">
                  {d.valor_total != null ? `R$ ${d.valor_total.toFixed(2)}` : '—'}
                </p>
              </div>
            );
          })}
        </div>

        {duties.length > 0 && (
          <div className="flex justify-between items-center border border-gray-100 rounded-xl px-6 py-4 bg-gray-50 shadow-sm mb-6">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{duties.length} plantão(ões)</span>
            <span className="text-sm font-bold text-gray-800">Total: R$ {totalValor.toFixed(2)}</span>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0 md:flex md:justify-end md:gap-3">
          {duties.length > 0 && (
            <Button
              label={printing ? 'Gerando...' : 'Imprimir Relatório'}
              icon={printing ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
              disabled={printing}
              onClick={handlePrint}
            />
          )}
          <Button label="Voltar" variant="secondary" onClick={() => navigate(`/users/details/${id}`)} />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 10px; }
      `}</style>
    </div>
  );
}