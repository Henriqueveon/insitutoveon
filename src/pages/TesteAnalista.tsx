import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAssessment } from '@/context/AssessmentContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, XCircle, CreditCard, ArrowRight } from 'lucide-react';

type ValidationStatus = 'loading' | 'valid' | 'invalid' | 'inactive' | 'no_licenses';

interface AnalistaData {
  id: string;
  nome: string;
  email: string;
  empresa: string | null;
  licencas_total: number;
  licencas_usadas: number;
  ativo: boolean;
}

export default function TesteAnalista() {
  const { linkUnico } = useParams<{ linkUnico: string }>();
  const navigate = useNavigate();
  const { setAnalistaId, resetAssessment } = useAssessment();

  const [status, setStatus] = useState<ValidationStatus>('loading');
  const [analista, setAnalista] = useState<AnalistaData | null>(null);

  useEffect(() => {
    const validateLink = async () => {
      if (!linkUnico) {
        setStatus('invalid');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('analistas')
          .select('id, nome, email, empresa, licencas_total, licencas_usadas, ativo')
          .eq('link_unico', linkUnico)
          .single();

        if (error || !data) {
          setStatus('invalid');
          return;
        }

        setAnalista(data);

        // Check if analyst is active
        if (!data.ativo) {
          setStatus('inactive');
          return;
        }

        // Check if analyst has available licenses
        const licencasDisponiveis = data.licencas_total - data.licencas_usadas;
        if (licencasDisponiveis <= 0) {
          setStatus('no_licenses');
          return;
        }

        // All validations passed
        setStatus('valid');
      } catch (error) {
        console.error('Erro ao validar link:', error);
        setStatus('invalid');
      }
    };

    validateLink();
  }, [linkUnico]);

  const handleStartTest = () => {
    if (analista && status === 'valid') {
      // Reset any previous assessment data
      resetAssessment();
      // Set the analyst ID in context
      setAnalistaId(analista.id);
      // Navigate to the test
      navigate('/teste');
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#003DA5] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validando link...</p>
        </div>
      </div>
    );
  }

  // Invalid link
  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Link Inválido</CardTitle>
            <CardDescription className="text-gray-600">
              Este link de avaliação não existe ou foi digitado incorretamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Verifique se o link foi copiado corretamente ou entre em contato com quem lhe enviou.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-gray-300"
            >
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Inactive analyst
  if (status === 'inactive') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Link Desativado</CardTitle>
            <CardDescription className="text-gray-600">
              Este link de avaliação não está mais ativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Entre em contato com {analista?.nome || 'o responsável'} para mais informações.
            </p>
            {analista?.email && (
              <p className="text-sm text-gray-400">
                Email: {analista.email}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // No licenses available
  if (status === 'no_licenses') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Sem Licenças Disponíveis</CardTitle>
            <CardDescription className="text-gray-600">
              Não há licenças disponíveis para realizar a avaliação no momento.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Entre em contato com <strong>{analista?.nome || 'o responsável'}</strong> para solicitar mais licenças.
            </p>
            {analista?.email && (
              <p className="text-sm text-gray-400">
                Email: {analista.email}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid - show welcome screen
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-12">
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#003DA5] to-[#002a73] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">V</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Avaliação Comportamental DISC
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Instituto VEON - "A bússola que aponta para o sucesso!"
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Analyst info */}
            {analista && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Avaliação aplicada por:</p>
                <p className="font-semibold text-gray-900">{analista.nome}</p>
                {analista.empresa && (
                  <p className="text-sm text-gray-600">{analista.empresa}</p>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-3 text-sm text-gray-600">
              <p className="font-medium text-gray-800">Sobre a avaliação:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>São 46 perguntas no total</li>
                <li>Duração aproximada: 15-20 minutos</li>
                <li>Responda com sinceridade para melhores resultados</li>
                <li>Ao final, você receberá seu relatório completo</li>
              </ul>
            </div>

            {/* Start button */}
            <Button
              onClick={handleStartTest}
              className="w-full h-12 text-base font-semibold bg-[#003DA5] hover:bg-[#002a73] text-white"
            >
              Iniciar Avaliação
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-xs text-center text-gray-400">
              Ao continuar, você concorda com os termos de uso do Instituto VEON.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
