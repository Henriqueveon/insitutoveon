// =====================================================
// TERMOS LGPD CANDIDATO - Aceite de Termos
// Área de Recrutamento VEON
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  FileCheck,
  Shield,
  Eye,
  UserCheck,
  Lock,
  Trash2,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function TermosCandidato() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const {
    form,
    ref,
    fotoBlob,
    videoBlob,
    videoDuracao,
    videoTipo,
    documentoBlob,
    documentoTipo,
  } = location.state || {};

  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [aceiteLGPD, setAceiteLGPD] = useState(false);
  const [aceiteVeracidade, setAceiteVeracidade] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const todosAceitos = aceiteTermos && aceiteLGPD && aceiteVeracidade;

  // Redirecionar se não tiver form
  useEffect(() => {
    if (!form) {
      navigate('/recrutamento/candidato/cadastro');
    }
  }, [form, navigate]);

  // Salvar candidato no banco
  const salvarCandidato = async () => {
    if (!todosAceitos || !form) return;

    setIsLoading(true);

    try {
      // Preparar dados do candidato
      const dadosCandidato = {
        // Dados pessoais
        nome_completo: form.nome_completo,
        data_nascimento: form.data_nascimento,
        cpf: form.cpf.replace(/\D/g, ''),
        telefone: form.telefone.replace(/\D/g, ''),
        email: form.email,
        estado: form.estado,
        cidade: form.cidade,
        bairro: form.bairro,

        // Situação atual
        esta_trabalhando: form.esta_trabalhando,
        salario_atual: form.salario_atual || null,
        regime_atual: form.regime_atual || null,
        motivo_busca_oportunidade: form.motivos_busca.join(', '),
        disponibilidade_inicio: form.disponibilidade_inicio,
        regime_preferido: form.regime_preferido,

        // Experiência
        ultima_empresa: form.ultima_empresa,
        ultimo_cargo: form.ultimo_cargo,
        tempo_ultima_empresa: form.tempo_permanencia,
        motivo_saida: form.motivo_saida,
        areas_experiencia: form.areas_experiencia,
        anos_experiencia: form.anos_experiencia,

        // Formação
        escolaridade: form.escolaridade,
        curso: form.curso || null,
        certificacoes: form.certificacoes || null,

        // Logística
        possui_veiculo: form.veiculo,
        possui_cnh: form.cnh,
        disponibilidade_horario: form.disponibilidade_horario.join(', '),
        aceita_viajar: form.aceita_viajar,
        aceita_mudanca: form.aceita_mudanca,

        // Vida pessoal
        estado_civil: form.estado_civil,
        tem_filhos: form.tem_filhos,
        quantidade_filhos: form.tem_filhos ? form.quantidade_filhos : null,
        idade_filhos: form.tem_filhos ? form.idade_filhos : null,
        instagram: form.instagram || null,

        // Expectativas
        pretensao_salarial: form.pretensao_salarial,
        valores_empresa: form.valores_empresa,
        areas_interesse: form.areas_interesse,
        objetivo_profissional: form.objetivo_profissional,

        // Vídeo
        video_tipo: videoTipo,
        video_duracao: videoDuracao,

        // Documento
        documento_tipo: documentoTipo,

        // Termos
        aceite_termos: true,
        aceite_termos_data: new Date().toISOString(),
        aceite_lgpd: true,
        aceite_lgpd_data: new Date().toISOString(),

        // Status
        status: 'disponivel',
      };

      // Inserir candidato no banco
      const { data: candidato, error: insertError } = await supabase
        .from('candidatos_recrutamento')
        .insert(dadosCandidato)
        .select()
        .single();

      if (insertError) {
        // Verificar se é erro de CPF duplicado
        if (insertError.code === '23505') {
          throw new Error('CPF já cadastrado. Faça login para acessar seu perfil.');
        }
        throw insertError;
      }

      // Fazer upload dos arquivos no Storage
      const candidatoId = candidato.id;

      // Upload da foto
      if (fotoBlob) {
        try {
          const fotoFile = dataURLtoBlob(fotoBlob);
          const fotoPath = `candidatos/${candidatoId}/foto.jpg`;
          const { error: fotoError } = await supabase.storage
            .from('recrutamento')
            .upload(fotoPath, fotoFile, { upsert: true });

          if (!fotoError) {
            const { data: fotoUrl } = supabase.storage
              .from('recrutamento')
              .getPublicUrl(fotoPath);

            await supabase
              .from('candidatos_recrutamento')
              .update({ foto_url: fotoUrl.publicUrl })
              .eq('id', candidatoId);
          }
        } catch (e) {
          console.error('Erro upload foto:', e);
        }
      }

      // Upload do vídeo
      if (videoBlob) {
        try {
          const videoFile = dataURLtoBlob(videoBlob);
          const videoPath = `candidatos/${candidatoId}/video.webm`;
          const { error: videoError } = await supabase.storage
            .from('recrutamento')
            .upload(videoPath, videoFile, { upsert: true });

          if (!videoError) {
            const { data: videoUrl } = supabase.storage
              .from('recrutamento')
              .getPublicUrl(videoPath);

            await supabase
              .from('candidatos_recrutamento')
              .update({ video_url: videoUrl.publicUrl })
              .eq('id', candidatoId);
          }
        } catch (e) {
          console.error('Erro upload vídeo:', e);
        }
      }

      // Upload do documento
      if (documentoBlob) {
        try {
          const docFile = dataURLtoBlob(documentoBlob);
          const docPath = `candidatos/${candidatoId}/documento.jpg`;
          const { error: docError } = await supabase.storage
            .from('recrutamento')
            .upload(docPath, docFile, { upsert: true });

          if (!docError) {
            const { data: docUrl } = supabase.storage
              .from('recrutamento')
              .getPublicUrl(docPath);

            await supabase
              .from('candidatos_recrutamento')
              .update({ documento_url: docUrl.publicUrl })
              .eq('id', candidatoId);
          }
        } catch (e) {
          console.error('Erro upload documento:', e);
        }
      }

      // Limpar localStorage
      localStorage.removeItem('veon_candidato_cadastro');
      localStorage.removeItem('veon_candidato_foto');
      localStorage.removeItem('veon_candidato_video');
      localStorage.removeItem('veon_candidato_video_tipo');
      localStorage.removeItem('veon_candidato_video_duracao');
      localStorage.removeItem('veon_candidato_documento');
      localStorage.removeItem('veon_candidato_documento_tipo');

      toast({
        title: 'Cadastro salvo!',
        description: 'Agora vamos descobrir seu perfil DISC.',
      });

      // Redirecionar para o teste DISC
      // Passando o ID do candidato para vincular o resultado
      navigate('/teste', {
        state: {
          candidatoRecrutamentoId: candidatoId,
          nomeCompleto: form.nome_completo,
          telefone: form.telefone,
          email: form.email,
          ref,
        },
      });
    } catch (error) {
      console.error('Erro ao salvar candidato:', error);
      toast({
        title: 'Erro ao salvar',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar seu cadastro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const termos = [
    {
      id: 'veracidade',
      checked: aceiteVeracidade,
      onChange: setAceiteVeracidade,
      icon: UserCheck,
      text: 'Declaro que todas as informações fornecidas são verdadeiras e de minha responsabilidade.',
    },
    {
      id: 'visualizacao',
      checked: aceiteTermos,
      onChange: setAceiteTermos,
      icon: Eye,
      text: 'Autorizo que empresas cadastradas na plataforma visualizem meus dados profissionais para fins de recrutamento.',
    },
    {
      id: 'lgpd',
      checked: aceiteLGPD,
      onChange: setAceiteLGPD,
      icon: Shield,
      text: 'Concordo com a coleta e tratamento dos meus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center">
            <FileCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Termo de Consentimento
          </h1>
          <p className="text-slate-400">
            Leia e aceite os termos para finalizar seu cadastro
          </p>
        </div>

        {/* Termos */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm mb-6">
          <CardContent className="p-6 space-y-6">
            {termos.map((termo) => (
              <div key={termo.id} className="flex items-start space-x-4">
                <Checkbox
                  id={termo.id}
                  checked={termo.checked}
                  onCheckedChange={(checked) => termo.onChange(checked as boolean)}
                  className="mt-1 border-slate-500 data-[state=checked]:bg-[#E31E24] data-[state=checked]:border-[#E31E24]"
                />
                <div className="flex-1">
                  <label
                    htmlFor={termo.id}
                    className="text-sm text-slate-300 cursor-pointer leading-relaxed"
                  >
                    {termo.text}
                  </label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-sm text-slate-400">
            <Lock className="w-4 h-4 text-green-400" />
            <span>Seus dados de contato só serão revelados após aceitar uma proposta</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-400">
            <Trash2 className="w-4 h-4 text-blue-400" />
            <span>Você pode solicitar exclusão dos seus dados a qualquer momento</span>
          </div>
        </div>

        {/* Botão */}
        <Button
          onClick={salvarCandidato}
          disabled={!todosAceitos || isLoading}
          className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] py-6 text-lg disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Aceitar e Continuar para o Teste
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Próximo passo */}
        <p className="mt-4 text-center text-sm text-slate-500">
          Próximo passo: Teste de Perfil DISC (5 minutos)
        </p>
      </div>
    </div>
  );
}

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
