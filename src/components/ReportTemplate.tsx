import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

let fontsRegistered = false;
export function registerFonts() {
  if (fontsRegistered) return;
  const base = window.location.origin;
  Font.register({
    family: 'Inter',
    fonts: [
      { src: `${base}/fonts/Inter-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/Inter-Medium.ttf`, fontWeight: 500 },
      { src: `${base}/fonts/Inter-Bold.ttf`, fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}

interface ReportRow {
  colaborador: string;
  inicio: string;
  fim: string;
  status: string;
  valor: number | null;
}

export interface ReportGroup {
  funcionarioNome: string;
  rows: ReportRow[];
  totalValor: number;
}

interface ReportTemplateProps {
  rows: ReportRow[];
  periodoInicio: string;
  periodoFim: string;
  funcionarioNome: string;
  emitidoEm: string;
  totalValor: number;
  logoBase64: string;
  groups?: ReportGroup[];
}

const statusLabel: Record<string, string> = {
  PENDENTE: 'Aberto', APROVADO: 'Pago', RECUSADO: 'Recusado',
  '0': 'Aberto', '1': 'Pago', '2': 'Recusado',
};

const formatDate = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
};

const RED = '#B5071A';
const GRAY1 = '#111827';
const GRAY4 = '#374151';
const GRAY5 = '#6b7280';
const GRAY9 = '#9ca3af';
const BORDER = '#e5e7eb';
const ROW_ALT = '#f9fafb';
const FOOT_BG = '#f3f4f6';

const REGULAR = 'Inter';

const s = StyleSheet.create({
  page: {
    fontFamily: REGULAR, fontSize: 9, color: GRAY1,
    backgroundColor: '#fff', paddingHorizontal: 40, paddingTop: 32, paddingBottom: 52,
  },

  // LOGO
  logoBloco: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10,
  },
  logoImg: { height: 22 },
  logoSep: { width: 1, height: 20, backgroundColor: BORDER, marginHorizontal: 12 },
  logoTitulo: { fontFamily: REGULAR, fontWeight: 700, fontSize: 11, color: GRAY1 },
  logoSub: { fontFamily: REGULAR, fontWeight: 400, fontSize: 6.5, color: GRAY9, textTransform: 'uppercase', letterSpacing: 0.7, marginTop: 2 },

  // INFO
  infoBloco: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
  },
  infoCampos: { flexDirection: 'row', gap: 28 },
  campoLabel: { fontFamily: REGULAR, fontWeight: 400, fontSize: 6, textTransform: 'uppercase', letterSpacing: 0.8, color: GRAY9, marginBottom: 2 },
  campoValor: { fontFamily: REGULAR, fontWeight: 700, fontSize: 9.5, color: GRAY1 },
  totalLabel: { fontFamily: REGULAR, fontWeight: 400, fontSize: 6, textTransform: 'uppercase', letterSpacing: 0.8, color: GRAY9, marginBottom: 2, textAlign: 'right' },
  totalValor: { fontFamily: REGULAR, fontWeight: 700, fontSize: 14, color: RED, textAlign: 'right' },

  // TABELA
  tableContainer: { borderWidth: 1, borderColor: BORDER, borderRadius: 6 },
  tableHeader: { flexDirection: 'row', backgroundColor: RED },
  thCell: { fontFamily: REGULAR, fontWeight: 700, paddingVertical: 9, paddingHorizontal: 10, fontSize: 7.5, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.7 },

  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowAlt: { backgroundColor: ROW_ALT },
  tdCell: { fontFamily: REGULAR, fontWeight: 400, paddingVertical: 6, paddingHorizontal: 10, fontSize: 8.5, color: GRAY4 },
  tdBold: { fontFamily: REGULAR, fontWeight: 700, color: GRAY1 },
  tdRight: { textAlign: 'right' },

  // BADGE
  badgeWrap: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontFamily: REGULAR, fontWeight: 700, fontSize: 6.5, textTransform: 'uppercase' },
  badgeAbertoWrap: { backgroundColor: '#fff7ed' },
  badgeAbertoText: { color: '#c2410c' },
  badgePagoWrap: { backgroundColor: '#f0fdf4' },
  badgePagoText: { color: '#15803d' },
  badgeRecusadoWrap: { backgroundColor: '#fef2f2' },
  badgeRecusadoText: { color: '#b91c1c' },

  tableFoot: { flexDirection: 'row', backgroundColor: FOOT_BG, borderTopWidth: 2, borderTopColor: BORDER },
  tfCell: { fontFamily: REGULAR, fontWeight: 700, paddingVertical: 6, paddingHorizontal: 10, fontSize: 8, color: GRAY5 },
  tfTotal: { fontFamily: REGULAR, fontWeight: 700, fontSize: 9, color: GRAY1, textAlign: 'right' },

  // FOOTER
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, alignItems: 'center' },
  footerSep: { width: 360, height: 1, backgroundColor: BORDER, marginBottom: 5 },
  footerL1: { fontFamily: REGULAR, fontWeight: 700, fontSize: 7.5, color: GRAY4, marginBottom: 2 },
  footerL2: { fontFamily: REGULAR, fontWeight: 400, fontSize: 6.5, color: GRAY9 },
});

const COL_WITH_FUNC = { funcionario: '37%', data: '15%', status: '17%', valor: '16%' };
const COL_WITHOUT_FUNC = { funcionario: '0%', data: '24%', status: '22%', valor: '30%' };

function BadgeStatus({ status }: { status: string }) {
  const label = statusLabel[status] ?? status;
  const isPago = status === 'APROVADO' || status === '1';
  const isRecusado = status === 'RECUSADO' || status === '2';
  return (
    <View style={[s.badgeWrap, isPago ? s.badgePagoWrap : isRecusado ? s.badgeRecusadoWrap : s.badgeAbertoWrap]}>
      <Text style={[s.badgeText, isPago ? s.badgePagoText : isRecusado ? s.badgeRecusadoText : s.badgeAbertoText]}>
        {label}
      </Text>
    </View>
  );
}

interface PageContentProps {
  rows: ReportRow[];
  periodoInicio: string;
  periodoFim: string;
  funcionarioNome: string;
  emitidoEm: string;
  totalValor: number;
  logoBase64: string;
  year: number;
  showFuncCol: boolean;
}

function ReportPage({ rows, periodoInicio, periodoFim, funcionarioNome, emitidoEm, totalValor, logoBase64, year, showFuncCol }: PageContentProps) {
  const col = showFuncCol ? COL_WITH_FUNC : COL_WITHOUT_FUNC;

  return (
    <Page size="A4" style={s.page}>
      {/* LOGO */}
      <View style={s.logoBloco}>
        {logoBase64 ? <Image style={s.logoImg} src={logoBase64} /> : null}
        <View style={s.logoSep} />
        <View>
          <Text style={s.logoTitulo}>Relatório de Escala de Plantões</Text>
          <Text style={s.logoSub}>Intellisys Informática Ltda</Text>
        </View>
      </View>

      {/* INFO */}
      <View style={s.infoBloco}>
        <View style={s.infoCampos}>
          <View>
            <Text style={s.campoLabel}>Período</Text>
            <Text style={s.campoValor}>{periodoInicio} - {periodoFim}</Text>
          </View>
          <View>
            <Text style={s.campoLabel}>Funcionário</Text>
            <Text style={s.campoValor}>{funcionarioNome}</Text>
          </View>
          <View>
            <Text style={s.campoLabel}>Plantões</Text>
            <Text style={s.campoValor}>{rows.length}</Text>
          </View>
        </View>
        <View>
          <Text style={s.totalLabel}>Valor Total</Text>
          <Text style={s.totalValor}>R$ {totalValor.toFixed(2)}</Text>
        </View>
      </View>

      {/* TABELA */}
      <View style={s.tableContainer}>
        <View style={s.tableHeader}>
          {showFuncCol && <Text style={[s.thCell, { width: col.funcionario }]}>Funcionário</Text>}
          <Text style={[s.thCell, { width: col.data }]}>Início</Text>
          <Text style={[s.thCell, { width: col.data }]}>Fim</Text>
          <Text style={[s.thCell, { width: col.status }]}>Status</Text>
          <Text style={[s.thCell, { width: col.valor, textAlign: 'right' }]}>Valor</Text>
        </View>

        {rows.map((r, i) => (
          <View key={i} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]} wrap={false}>
            {showFuncCol && <Text style={[s.tdCell, s.tdBold, { width: col.funcionario }]}>{r.colaborador}</Text>}
            <Text style={[s.tdCell, { width: col.data }]}>{formatDate(r.inicio)}</Text>
            <Text style={[s.tdCell, { width: col.data }]}>{formatDate(r.fim)}</Text>
            <View style={[s.tdCell, { width: col.status, justifyContent: 'center' }]}>
              <BadgeStatus status={r.status} />
            </View>
            <Text style={[s.tdCell, s.tdRight, { width: col.valor }]}>
              {r.valor != null ? `R$ ${r.valor.toFixed(2)}` : '—'}
            </Text>
          </View>
        ))}

        <View style={s.tableFoot}>
          {showFuncCol && <Text style={[s.tfCell, { width: col.funcionario }]} />}
          <Text style={[s.tfCell, { flex: 1 }]}>{rows.length} plantão(ões) no período</Text>
          <Text style={[s.tfCell, { width: col.status }]}>Total</Text>
          <Text style={[s.tfCell, s.tfTotal, { width: col.valor }]}>R$ {totalValor.toFixed(2)}</Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={s.footer} fixed>
        <View style={s.footerSep} />
        <Text style={s.footerL1}>Intellisys Informática Ltda — Todos os direitos reservados © {year}</Text>
        <Text style={s.footerL2}>Documento gerado automaticamente pelo sistema de gestão de plantões · Emitido em: {emitidoEm}</Text>
      </View>
    </Page>
  );
}

export function ReportTemplate({ rows, periodoInicio, periodoFim, funcionarioNome, emitidoEm, totalValor, logoBase64, groups }: ReportTemplateProps) {
  const year = new Date().getFullYear();

  if (groups && groups.length > 1) {
    return (
      <Document>
        {groups.map((g, idx) => (
          <ReportPage
            key={idx}
            rows={g.rows}
            periodoInicio={periodoInicio}
            periodoFim={periodoFim}
            funcionarioNome={g.funcionarioNome}
            emitidoEm={emitidoEm}
            totalValor={g.totalValor}
            logoBase64={logoBase64}
            year={year}
            showFuncCol={false}
          />
        ))}
      </Document>
    );
  }

  return (
    <Document>
      <ReportPage
        rows={rows}
        periodoInicio={periodoInicio}
        periodoFim={periodoFim}
        funcionarioNome={funcionarioNome}
        emitidoEm={emitidoEm}
        totalValor={totalValor}
        logoBase64={logoBase64}
        year={year}
        showFuncCol={funcionarioNome === 'Todos'}
      />
    </Document>
  );
}
