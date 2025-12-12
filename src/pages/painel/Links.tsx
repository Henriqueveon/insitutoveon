import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, Construction } from 'lucide-react';

export default function PainelLinks() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Links de Avaliação</h1>
        <p className="text-slate-400 mt-1">
          Crie e gerencie links personalizados para suas avaliações DISC
        </p>
      </div>

      {/* Coming Soon */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
            <Construction className="w-8 h-8 text-[#00D9FF]" />
          </div>
          <h3 className="text-xl font-medium text-white">Em Desenvolvimento</h3>
          <p className="text-slate-400 text-center max-w-md mt-2">
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            Por enquanto, use o link padrão de avaliação.
          </p>
          <div className="mt-6 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
            <p className="text-sm text-slate-400 mb-2">Link de avaliação atual:</p>
            <div className="flex items-center gap-2 text-[#00D9FF]">
              <Link2 className="w-4 h-4" />
              <code className="text-sm">{window.location.origin}/</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
