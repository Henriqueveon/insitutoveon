import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface LiderancaItem {
  name: string;
  value: number;
  color: string;
}

interface ValorItem {
  name: string;
  value: number;
  color: string;
}

interface PDFLeadershipPageProps {
  lideranca: LiderancaItem[];
  valores: ValorItem[];
}

/**
 * PDFLeadershipPage - Leadership donut chart + Values bar chart
 * Split into two equal halves, ANIMATIONS DISABLED
 */
export function PDFLeadershipPage({ lideranca, valores }: PDFLeadershipPageProps) {
  // Find dominant leadership style
  const dominantStyle = lideranca.reduce((prev, current) => 
    prev.value > current.value ? prev : current
  );

  return (
    <div className="h-full flex flex-col">
      {/* TOP HALF: Leadership Donut Chart */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          👔 Estilo de Liderança
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Distribuição dos estilos de liderança baseados no seu perfil
        </p>

        <div className="flex items-center gap-4 flex-1">
          {/* Donut Chart */}
          <div className="w-1/2 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lideranca}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {lideranca.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  formatter={(value, entry: any) => (
                    <span className="text-xs text-gray-700">
                      {value}: {entry.payload.value}%
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Dominant Style Card */}
          <div className="w-1/2 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">🏆 Estilo Dominante</h4>
            <p className="text-2xl font-bold" style={{ color: dominantStyle.color }}>
              {dominantStyle.name}
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {dominantStyle.value}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {getLeadershipDescription(dominantStyle.name)}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-4" />

      {/* BOTTOM HALF: Values Bar Chart */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          💎 Teoria de Valores (Spranger)
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Seus motivadores e sistemas de valores predominantes
        </p>

        {/* Vertical Bar Chart */}
        <div className="flex-1 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={valores}
              margin={{ top: 10, right: 20, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#6b7280' }}
                angle={-15}
                textAnchor="end"
              />
              <YAxis 
                domain={[0, 30]} 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <Tooltip />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              >
                {valores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Values Legend */}
        <div className="flex flex-wrap gap-2 mt-2">
          {valores.slice(0, 3).map((valor) => (
            <div 
              key={valor.name}
              className="flex items-center gap-1 px-2 py-1 rounded bg-gray-50 border border-gray-200"
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: valor.color }} 
              />
              <span className="text-xs font-medium text-gray-700">
                {valor.name}: {valor.value}%
              </span>
              <span className="text-xs text-green-600">
                {valor.value >= 17 ? '🟢' : valor.value >= 10 ? '🟡' : '⚪'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getLeadershipDescription(style: string): string {
  const descriptions: Record<string, string> = {
    'Executivo': 'Foco em resultados e ação direta. Lidera pelo exemplo.',
    'Motivador': 'Inspiração e energia contagiante. Lidera pelo entusiasmo.',
    'Facilitador': 'Apoio e desenvolvimento de pessoas. Lidera pelo suporte.',
    'Metódico': 'Processos e análise sistemática. Lidera pela organização.',
  };
  return descriptions[style] || '';
}
