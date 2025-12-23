import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PDFDISCPageProps {
  discData: {
    natural: { D: number; I: number; S: number; C: number };
    adaptado: { D: number; I: number; S: number; C: number };
  };
  amplitude: {
    D: { valor: number; alerta: boolean };
    I: { valor: number; alerta: boolean };
    S: { valor: number; alerta: boolean };
    C: { valor: number; alerta: boolean };
  };
}

const normalizeScore = (score: number): number => {
  // Normaliza de -50/+50 para 0-100
  return Math.round(((score + 50) / 100) * 100);
};

const COLORS = {
  D: '#FF6B6B',
  I: '#FFB84D',
  S: '#51CF66',
  C: '#4DABF7',
};

/**
 * PDFDISCPage - DISC horizontal bar chart + Amplitude analysis
 * All animations DISABLED for PDF rendering
 */
export function PDFDISCPage({ discData, amplitude }: PDFDISCPageProps) {
  const chartData = [
    { 
      factor: 'D - Dominância', 
      natural: normalizeScore(discData.natural.D), 
      adaptado: normalizeScore(discData.adaptado.D),
      color: COLORS.D
    },
    { 
      factor: 'I - Influência', 
      natural: normalizeScore(discData.natural.I), 
      adaptado: normalizeScore(discData.adaptado.I),
      color: COLORS.I
    },
    { 
      factor: 'S - Estabilidade', 
      natural: normalizeScore(discData.natural.S), 
      adaptado: normalizeScore(discData.adaptado.S),
      color: COLORS.S
    },
    { 
      factor: 'C - Conformidade', 
      natural: normalizeScore(discData.natural.C), 
      adaptado: normalizeScore(discData.adaptado.C),
      color: COLORS.C
    },
  ];

  const amplitudeData = [
    { key: 'D', label: 'Dominância', icon: '🎯', ...amplitude.D },
    { key: 'I', label: 'Influência', icon: '💬', ...amplitude.I },
    { key: 'S', label: 'Estabilidade', icon: '🤝', ...amplitude.S },
    { key: 'C', label: 'Conformidade', icon: '📋', ...amplitude.C },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📊 Gráfico DISC - Natural vs Adaptado
      </h2>
      
      {/* Scale labels */}
      <div className="flex justify-between text-xs text-gray-500 mb-2 px-36">
        <span>Crítico</span>
        <span>Baixo</span>
        <span>Satisfatório</span>
        <span>Desenvolvido</span>
        <span>Excelente</span>
      </div>
      
      {/* Horizontal Bar Chart - ANIMATIONS DISABLED */}
      <div className="h-[280px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
            <YAxis 
              type="category" 
              dataKey="factor" 
              width={120} 
              tick={{ fontSize: 11, fill: '#374151' }}
            />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar 
              dataKey="natural" 
              fill="#00CED1" 
              name="Natural" 
              radius={[0, 8, 8, 0]}
              isAnimationActive={false}
            />
            <Bar 
              dataKey="adaptado" 
              fill="#FF6B6B" 
              name="Adaptado" 
              radius={[0, 8, 8, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#00CED1]" />
          <span className="text-sm text-gray-600">Natural - Como você realmente é</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#FF6B6B]" />
          <span className="text-sm text-gray-600">Adaptado - Como você age no ambiente</span>
        </div>
      </div>

      {/* Amplitude Analysis Section */}
      <div className="mt-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          📏 Análise de Amplitude
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Diferenças significativas entre perfil Natural e Adaptado indicam esforço de adaptação ao ambiente.
        </p>
        
        <div className="grid grid-cols-4 gap-3">
          {amplitudeData.map((item) => (
            <div
              key={item.key}
              className={`p-3 rounded-lg border-2 ${
                item.alerta 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-1 mb-2">
                {item.alerta && <span className="text-sm">⚠️</span>}
                <span className="text-lg">{item.icon}</span>
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              
              <p className={`text-lg font-bold ${
                Math.abs(item.valor) > 5 ? 'text-red-600' : 'text-green-600'
              }`}>
                {item.valor > 0 ? '+' : ''}{item.valor} pts
              </p>
              
              {item.alerta && (
                <p className="text-xs text-gray-500 mt-1">
                  Adaptação significativa
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
