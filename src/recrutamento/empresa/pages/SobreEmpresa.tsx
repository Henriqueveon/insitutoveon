// =====================================================
// SOBRE A EMPRESA - Perfil com Diferenciais
// Para atrair candidatos com benefícios e cultura
// =====================================================

import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Upload,
  Globe,
  Instagram,
  Users,
  Clock,
  Briefcase,
  Heart,
  Coffee,
  Car,
  Home,
  GraduationCap,
  Sparkles,
  Camera,
  X,
  Loader2,
  Save,
  Image as ImageIcon,
} from 'lucide-react';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  logo_url: string | null;
  segmento: string | null;
  tempo_mercado: string | null;
  num_colaboradores: string | null;
  site_url: string | null;
  instagram_empresa: string | null;
  sobre_empresa: string | null;
  diferenciais: string[] | null;
  porque_trabalhar: string | null;
  fotos_ambiente: string[] | null;
}

const SEGMENTOS = [
  'Varejo',
  'Serviços',
  'Indústria',
  'Tecnologia',
  'Saúde',
  'Educação',
  'Alimentação',
  'Construção Civil',
  'Logística',
  'Financeiro',
  'Agronegócio',
  'Outros',
];

const TEMPO_MERCADO = [
  'Menos de 1 ano',
  '1 a 3 anos',
  '3 a 5 anos',
  '5 a 10 anos',
  '10 a 20 anos',
  'Mais de 20 anos',
];

const NUM_COLABORADORES = [
  '1 a 10',
  '11 a 50',
  '51 a 200',
  '201 a 500',
  'Mais de 500',
];

const DIFERENCIAIS = {
  beneficios: {
    titulo: 'Benefícios',
    icon: Heart,
    itens: [
      'Vale Refeição',
      'Vale Alimentação',
      'Vale Transporte',
      'Plano de Saúde',
      'Plano Odontológico',
      'Seguro de Vida',
      'Participação nos Lucros',
      'Bonificação por Metas',
      'Day Off no Aniversário',
    ],
  },
  estrutura: {
    titulo: 'Estrutura',
    icon: Building2,
    itens: [
      'Cozinha/Refeitório',
      'Área de Descanso',
      'Estacionamento',
      'Ambiente Climatizado',
      'Home Office',
      'Horário Flexível',
    ],
  },
  desenvolvimento: {
    titulo: 'Desenvolvimento',
    icon: GraduationCap,
    itens: [
      'Treinamentos Profissionalizantes',
      'Plano de Carreira',
      'Bolsa de Estudos',
      'Cursos e Certificações',
      'Mentoria',
    ],
  },
  cultura: {
    titulo: 'Cultura',
    icon: Sparkles,
    itens: [
      'Ambiente Descontraído',
      'Eventos de Integração',
      'Confraternizações',
      'Dress Code Livre',
    ],
  },
};

export default function SobreEmpresa() {
  const { toast } = useToast();
  const { empresa: empresaContext, recarregarEmpresa } = useOutletContext<{
    empresa: Empresa;
    recarregarEmpresa: () => void;
  }>();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const fotosInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFotos, setIsUploadingFotos] = useState(false);

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState({
    logo_url: '',
    segmento: '',
    tempo_mercado: '',
    num_colaboradores: '',
    site_url: '',
    instagram_empresa: '',
    sobre_empresa: '',
    diferenciais: [] as string[],
    porque_trabalhar: '',
    fotos_ambiente: [] as string[],
  });

  useEffect(() => {
    if (empresaContext?.id) {
      carregarPerfil();
    }
  }, [empresaContext?.id]);

  const carregarPerfil = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas_recrutamento')
        .select('*')
        .eq('id', empresaContext.id)
        .single();

      if (error) throw error;

      setEmpresa(data as Empresa);
      setFormData({
        logo_url: data.logo_url || '',
        segmento: data.segmento || '',
        tempo_mercado: data.tempo_mercado || '',
        num_colaboradores: data.num_colaboradores || '',
        site_url: data.site_url || '',
        instagram_empresa: data.instagram_empresa || '',
        sobre_empresa: data.sobre_empresa || '',
        diferenciais: data.diferenciais || [],
        porque_trabalhar: data.porque_trabalhar || '',
        fotos_ambiente: data.fotos_ambiente || [],
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${empresaContext.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('empresas')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('empresas')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));

      toast({
        title: 'Logo enviado!',
        description: 'O logo foi atualizado com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Não foi possível enviar o logo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleUploadFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fotosAtuais = formData.fotos_ambiente.length;
    const maxFotos = 5;

    if (fotosAtuais >= maxFotos) {
      toast({
        title: 'Limite atingido',
        description: `Você pode ter no máximo ${maxFotos} fotos.`,
        variant: 'destructive',
      });
      return;
    }

    const espacoDisponivel = maxFotos - fotosAtuais;
    const filesToUpload = Array.from(files).slice(0, espacoDisponivel);

    setIsUploadingFotos(true);
    try {
      const novasFotos: string[] = [];

      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${empresaContext.id}/ambiente/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('empresas')
          .upload(fileName, file);

        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage
          .from('empresas')
          .getPublicUrl(fileName);

        novasFotos.push(publicUrl);
      }

      if (novasFotos.length > 0) {
        setFormData(prev => ({
          ...prev,
          fotos_ambiente: [...prev.fotos_ambiente, ...novasFotos],
        }));

        toast({
          title: 'Fotos enviadas!',
          description: `${novasFotos.length} foto(s) adicionada(s).`,
        });
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setIsUploadingFotos(false);
      if (fotosInputRef.current) {
        fotosInputRef.current.value = '';
      }
    }
  };

  const removerFoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotos_ambiente: prev.fotos_ambiente.filter((_, i) => i !== index),
    }));
  };

  const toggleDiferencial = (diferencial: string) => {
    setFormData(prev => ({
      ...prev,
      diferenciais: prev.diferenciais.includes(diferencial)
        ? prev.diferenciais.filter(d => d !== diferencial)
        : [...prev.diferenciais, diferencial],
    }));
  };

  const salvarPerfil = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('empresas_recrutamento')
        .update({
          logo_url: formData.logo_url || null,
          segmento: formData.segmento || null,
          tempo_mercado: formData.tempo_mercado || null,
          num_colaboradores: formData.num_colaboradores || null,
          site_url: formData.site_url || null,
          instagram_empresa: formData.instagram_empresa || null,
          sobre_empresa: formData.sobre_empresa || null,
          diferenciais: formData.diferenciais.length > 0 ? formData.diferenciais : null,
          porque_trabalhar: formData.porque_trabalhar || null,
          fotos_ambiente: formData.fotos_ambiente.length > 0 ? formData.fotos_ambiente : null,
        })
        .eq('id', empresaContext.id);

      if (error) throw error;

      toast({
        title: 'Salvo!',
        description: 'As informações foram atualizadas com sucesso.',
      });

      recarregarEmpresa();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Building2 className="w-7 h-7 text-blue-400" />
          Sobre a Empresa
        </h1>
        <p className="text-slate-400 mt-1">
          Destaque seus diferenciais e atraia os melhores candidatos
        </p>
      </div>

      {/* Seção 1 - Informações Básicas */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            Informações Básicas
          </CardTitle>
          <CardDescription className="text-slate-400">
            Dados gerais da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.logo_url || undefined} />
                <AvatarFallback className="bg-slate-700 text-white text-2xl">
                  {empresa?.nome_fantasia?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              {isUploadingLogo && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <Label className="text-slate-300">Logo da Empresa</Label>
              <p className="text-sm text-slate-500 mb-2">PNG ou JPG, máximo 2MB</p>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleUploadLogo}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="border-slate-600 text-slate-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                Enviar Logo
              </Button>
            </div>
          </div>

          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Segmento de Atuação</Label>
              <Select
                value={formData.segmento}
                onValueChange={(v) => setFormData(prev => ({ ...prev, segmento: v }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENTOS.map(seg => (
                    <SelectItem key={seg} value={seg}>{seg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Tempo de Mercado</Label>
              <Select
                value={formData.tempo_mercado}
                onValueChange={(v) => setFormData(prev => ({ ...prev, tempo_mercado: v }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Há quantos anos existe?" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPO_MERCADO.map(tempo => (
                    <SelectItem key={tempo} value={tempo}>{tempo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Número de Colaboradores</Label>
              <Select
                value={formData.num_colaboradores}
                onValueChange={(v) => setFormData(prev => ({ ...prev, num_colaboradores: v }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Quantos funcionários?" />
                </SelectTrigger>
                <SelectContent>
                  {NUM_COLABORADORES.map(num => (
                    <SelectItem key={num} value={num}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Site da Empresa
              </Label>
              <Input
                value={formData.site_url}
                onChange={(e) => setFormData(prev => ({ ...prev, site_url: e.target.value }))}
                placeholder="https://suaempresa.com.br"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram da Empresa
              </Label>
              <Input
                value={formData.instagram_empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram_empresa: e.target.value }))}
                placeholder="@suaempresa"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 2 - Sobre a Empresa */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Conte sobre sua empresa</CardTitle>
          <CardDescription className="text-slate-400">
            Descreva a história, missão, visão e valores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.sobre_empresa}
            onChange={(e) => setFormData(prev => ({ ...prev, sobre_empresa: e.target.value.slice(0, 1000) }))}
            placeholder="Descreva a história, missão, visão e valores da sua empresa..."
            className="bg-slate-700 border-slate-600 text-white min-h-[150px]"
            maxLength={1000}
          />
          <p className="text-xs text-slate-500 text-right mt-1">
            {formData.sobre_empresa.length}/1000
          </p>
        </CardContent>
      </Card>

      {/* Seção 3 - Diferenciais */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">O que sua empresa oferece?</CardTitle>
          <CardDescription className="text-slate-400">
            Selecione os benefícios e diferenciais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(DIFERENCIAIS).map(([key, categoria]) => {
            const IconComponent = categoria.icon;
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <IconComponent className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-medium">{categoria.titulo}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoria.itens.map(item => (
                    <label
                      key={item}
                      className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all ${
                        formData.diferenciais.includes(item)
                          ? 'bg-blue-500/20 border border-blue-500/50'
                          : 'bg-slate-700/50 border border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <Checkbox
                        checked={formData.diferenciais.includes(item)}
                        onCheckedChange={() => toggleDiferencial(item)}
                        className="border-slate-500"
                      />
                      <span className={`text-sm ${
                        formData.diferenciais.includes(item) ? 'text-white' : 'text-slate-300'
                      }`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {formData.diferenciais.length > 0 && (
            <div className="pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                {formData.diferenciais.length} diferencial(is) selecionado(s)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção 4 - Por que trabalhar aqui */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Por que trabalhar aqui?</CardTitle>
          <CardDescription className="text-slate-400">
            O que faz sua empresa ser um ótimo lugar para trabalhar?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.porque_trabalhar}
            onChange={(e) => setFormData(prev => ({ ...prev, porque_trabalhar: e.target.value.slice(0, 500) }))}
            placeholder="O que faz sua empresa ser um ótimo lugar para trabalhar?"
            className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-slate-500 text-right mt-1">
            {formData.porque_trabalhar.length}/500
          </p>
        </CardContent>
      </Card>

      {/* Seção 5 - Fotos do Ambiente */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            Fotos do Ambiente
          </CardTitle>
          <CardDescription className="text-slate-400">
            Mostre como é trabalhar na sua empresa (até 5 fotos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Galeria de fotos */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {formData.fotos_ambiente.map((foto, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={foto}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removerFoto(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}

            {formData.fotos_ambiente.length < 5 && (
              <button
                onClick={() => fotosInputRef.current?.click()}
                disabled={isUploadingFotos}
                className="aspect-square border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors"
              >
                {isUploadingFotos ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">Adicionar</span>
                  </>
                )}
              </button>
            )}
          </div>

          <input
            type="file"
            ref={fotosInputRef}
            onChange={handleUploadFotos}
            accept="image/*"
            multiple
            className="hidden"
          />

          <p className="text-xs text-slate-500">
            {formData.fotos_ambiente.length}/5 fotos • Máximo 5MB por foto
          </p>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={salvarPerfil}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
