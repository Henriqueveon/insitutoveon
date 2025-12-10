import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CompetenciaItem {
  subject: string;
  A: number;
  B: number;
}

interface PDFCompetenciesPageProps {
  competencias: CompetenciaItem[];
}

/**
 * PDFCompetenciesPage - 16-axis radar chart for competencies
 * CRITICAL: isAnimationActive={false} for PDF rendering
 */
export function PDFCompetenciesPage({ competencias }: PDFCompetenciesPageProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🎯 Mapa de Competências (16 Eixos)
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Visualização completa das 16 competências comportamentais
      </p>

      {/* Radar Chart - Fixed height 600px, ANIMATIONS DISABLED */}
      <div className="flex-1 min-h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart 
            data={competencias} 
            margin={{ top: 20, right: 50, bottom: 20, left: 50 }}
          >
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 9, fill: '#6b7280' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 8, fill: '#9ca3af' }}
            />
            {/* Natural - Cyan solid fill */}
            <Radar
              name="Natural"
              dataKey="A"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
            {/* Adapted - Coral dashed line, transparent fill */}
            <Radar
              name="Adaptado"
              dataKey="B"
              stroke="#f43f5e"
              fill="transparent"
              strokeWidth={2}
              strokeDasharray="5 5"
              isAnimationActive={false}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation guide */}
      <div className="mt-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
        <h4 className="font-bold text-sm text-gray-800 mb-2">💡 Como interpretar o Radar:</h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>✅ <strong>Sobreposições próximas:</strong> Autenticidade na competência</li>
          <li>⚠️ <strong>Grandes diferenças:</strong> Esforço de adaptação significativo</li>
          <li>🎯 <strong>Área coberta:</strong> Quanto maior, mais versátil você é</li>
        </ul>
      </div>
    </div>
  );
}
