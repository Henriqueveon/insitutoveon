// =====================================================
// CONFIGURAÇÕES CANDIDATO - Área de Recrutamento VEON
// Gerenciamento de perfil e status
// =====================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Camera,
  Video,
  MapPin,
  Phone,
  Mail,
  Save,
  Loader2,
  Trash2,
  LogOut,
  Play,
  RotateCcw,
  Circle,
  Square,
  AlertCircle,
} from 'lucide-react';

interface Candidato {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  bairro: string | null;
  foto_url: string | null;
  video_url: string | null;
  status: string;
  objetivo_profissional: string | null;
  instagram: string | null;
}

interface Empresa {
  id: string;
  nome_fantasia: string;
}

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export default function ConfiguracoesCandidato() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { candidato: candidatoContext, recarregarCandidato } = useOutletContext<{
    candidato: Candidato | null;
    recarregarCandidato: () => void;
  }>();

  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [form, setForm] = useState({
    nome_completo: '',
    telefone: '',
    cidade: '',
    estado: '',
    bairro: '',
    objetivo_profissional: '',
    instagram: '',
  });
  const [status, setStatus] = useState<string>('disponivel');
  const [empresaContratante, setEmpresaContratante] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cidades, setCidades] = useState<string[]>([]);

  // Modal de foto
  const [modalFoto, setModalFoto] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal de vídeo
  const [modalVideo, setModalVideo] = useState(false);
  const [gravandoVideo, setGravandoVideo] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoChunks, setVideoChunks] = useState<Blob[]>([]);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [tempoGravacao, setTempoGravacao] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Dialog de exclusão
  const [dialogExcluir, setDialogExcluir] = useState(false);

  useEffect(() => {
    if (candidatoContext?.id) {
      carregarCandidato();
      carregarEmpresas();
    }
  }, [candidatoContext?.id]);

  useEffect(() => {
    if (form.estado) {
      carregarCidades(form.estado);
    }
  }, [form.estado]);

  const carregarCandidato = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidatos_recrutamento')
        .select('*')
        .eq('id', candidatoContext?.id)
        .single();

      if (error) throw error;

      setCandidato(data);
      setForm({
        nome_completo: data.nome_completo || '',
        telefone: data.telefone || '',
        cidade: data.cidade || '',
        estado: data.estado || '',
        bairro: data.bairro || '',
        objetivo_profissional: data.objetivo_profissional || '',
        instagram: data.instagram || '',
      });
      setStatus(data.status);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const carregarEmpresas = async () => {
    const { data } = await supabase
      .from('empresas_recrutamento')
      .select('id, nome_fantasia')
      .order('nome_fantasia');

    if (data) {
      setEmpresas(data);
    }
  };

  const carregarCidades = async (uf: string) => {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
      );
      const data = await response.json();
      setCidades(data.map((c: any) => c.nome).sort());
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  const salvarAlteracoes = async () => {
    if (!candidato) return;

    setIsSaving(true);

    try {
      const updates: any = {
        ...form,
        status,
      };

      if (status === 'contratado' && empresaContratante) {
        updates.empresa_contratante_id = empresaContratante;
      }

      const { error } = await supabase
        .from('candidatos_recrutamento')
        .update(updates)
        .eq('id', candidato.id);

      if (error) throw error;

      toast({
        title: 'Alterações salvas!',
        description: 'Suas configurações foram atualizadas.',
      });

      recarregarCandidato();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Foto ---
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A foto deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewFoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const salvarFoto = async () => {
    if (!previewFoto || !candidato) return;

    setIsSaving(true);

    try {
      // Converter base64 para blob
      const response = await fetch(previewFoto);
      const blob = await response.blob();

      // Upload para o storage
      const path = `candidatos/${candidato.id}/foto.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('recrutamento')
        .upload(path, blob, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('recrutamento')
        .getPublicUrl(path);

      // Atualizar candidato
      await supabase
        .from('candidatos_recrutamento')
        .update({ foto_url: urlData.publicUrl })
        .eq('id', candidato.id);

      toast({
        title: 'Foto atualizada!',
      });

      setModalFoto(false);
      setPreviewFoto(null);
      recarregarCandidato();
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a foto.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Vídeo ---
  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 720, height: 1280 },
        audio: true,
      });

      setVideoStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoChunks(chunks);
        setPreviewVideo(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setGravandoVideo(true);

      // Timer
      let tempo = 0;
      const interval = setInterval(() => {
        tempo++;
        setTempoGravacao(tempo);
        if (tempo >= 60) {
          pararGravacao();
          clearInterval(interval);
        }
      }, 1000);

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível acessar a câmera.',
        variant: 'destructive',
      });
    }
  };

  const pararGravacao = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setGravandoVideo(false);
      setTempoGravacao(0);
    }
  };

  const salvarVideo = async () => {
    if (videoChunks.length === 0 || !candidato) return;

    setIsSaving(true);

    try {
      const blob = new Blob(videoChunks, { type: 'video/webm' });

      // Upload para o storage
      const path = `candidatos/${candidato.id}/video.webm`;
      const { error: uploadError } = await supabase.storage
        .from('recrutamento')
        .upload(path, blob, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('recrutamento')
        .getPublicUrl(path);

      // Atualizar candidato
      await supabase
        .from('candidatos_recrutamento')
        .update({ video_url: urlData.publicUrl })
        .eq('id', candidato.id);

      toast({
        title: 'Vídeo salvo!',
      });

      setModalVideo(false);
      setPreviewVideo(null);
      setVideoChunks([]);
      recarregarCandidato();
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o vídeo.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fecharModalVideo = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    setVideoStream(null);
    setMediaRecorder(null);
    setGravandoVideo(false);
    setPreviewVideo(null);
    setVideoChunks([]);
    setTempoGravacao(0);
    setModalVideo(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('veon_candidato_id');
    navigate('/recrutamento/candidato/bem-vindo');
  };

  const excluirConta = async () => {
    // Em produção, enviaria para suporte
    toast({
      title: 'Solicitação enviada',
      description: 'Nossa equipe entrará em contato em até 48h.',
    });
    setDialogExcluir(false);
  };

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-8">
      <h1 className="text-xl font-bold text-white">Configurações</h1>

      {/* Foto e Vídeo */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={candidato?.foto_url || undefined} />
                <AvatarFallback className="bg-slate-600 text-white text-2xl">
                  {candidato?.nome_completo?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#E31E24]"
                onClick={() => setModalFoto(true)}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1">
              <p className="text-white font-medium">{candidato?.nome_completo}</p>
              <p className="text-sm text-slate-400">{candidato?.email}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalVideo(true)}
                className="mt-2 border-slate-600 text-slate-300"
              >
                <Video className="w-4 h-4 mr-2" />
                {candidato?.video_url ? 'Regravar vídeo' : 'Gravar vídeo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base">Status do Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={status} onValueChange={setStatus}>
            <div className="flex items-center space-x-2 p-3 bg-slate-700/30 rounded-lg">
              <RadioGroupItem value="disponivel" id="disponivel" />
              <Label htmlFor="disponivel" className="flex-1 cursor-pointer">
                <span className="flex items-center text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  Disponível para o mercado
                </span>
                <span className="text-xs text-slate-500 block">
                  Empresas podem ver seu perfil e enviar propostas
                </span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-slate-700/30 rounded-lg">
              <RadioGroupItem value="pausado" id="pausado" />
              <Label htmlFor="pausado" className="flex-1 cursor-pointer">
                <span className="flex items-center text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-slate-500 mr-2" />
                  Pausado
                </span>
                <span className="text-xs text-slate-500 block">
                  Você não aparece para empresas
                </span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-slate-700/30 rounded-lg">
              <RadioGroupItem value="contratado" id="contratado" />
              <Label htmlFor="contratado" className="flex-1 cursor-pointer">
                <span className="flex items-center text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                  Fui recrutado
                </span>
                <span className="text-xs text-slate-500 block">
                  Marque se você foi contratado
                </span>
              </Label>
            </div>
          </RadioGroup>

          {status === 'contratado' && (
            <Select value={empresaContratante} onValueChange={setEmpresaContratante}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nome_fantasia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center">
            <User className="w-4 h-4 mr-2" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Nome Completo</Label>
            <Input
              value={form.nome_completo}
              onChange={(e) => setForm(prev => ({ ...prev, nome_completo: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Telefone</Label>
            <Input
              value={form.telefone}
              onChange={(e) => setForm(prev => ({ ...prev, telefone: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(v) => setForm(prev => ({ ...prev, estado: v, cidade: '' }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BR.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Cidade</Label>
              <Select
                value={form.cidade}
                onValueChange={(v) => setForm(prev => ({ ...prev, cidade: v }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {cidades.map((cidade) => (
                    <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Bairro</Label>
            <Input
              value={form.bairro}
              onChange={(e) => setForm(prev => ({ ...prev, bairro: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Instagram</Label>
            <Input
              value={form.instagram}
              onChange={(e) => setForm(prev => ({ ...prev, instagram: e.target.value }))}
              placeholder="@seuusuario"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Objetivo Profissional</Label>
            <Textarea
              value={form.objetivo_profissional}
              onChange={(e) => setForm(prev => ({ ...prev, objetivo_profissional: e.target.value }))}
              rows={3}
              className="bg-slate-700 border-slate-600 text-white resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <Button
        onClick={salvarAlteracoes}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
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

      {/* Ações da Conta */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-4 space-y-3">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-slate-600 text-slate-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>

          <Button
            variant="outline"
            onClick={() => setDialogExcluir(true)}
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir minha conta (LGPD)
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Foto */}
      <Dialog open={modalFoto} onOpenChange={setModalFoto}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Alterar Foto</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {previewFoto ? (
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto">
                  <AvatarImage src={previewFoto} />
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewFoto(null)}
                  className="mt-2 text-slate-400"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Escolher outra
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-slate-500 transition-colors"
              >
                <Camera className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">Clique para selecionar uma foto</p>
                <p className="text-xs text-slate-500 mt-1">Máximo 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setModalFoto(false); setPreviewFoto(null); }}
              className="border-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarFoto}
              disabled={!previewFoto || isSaving}
              className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Vídeo */}
      <Dialog open={modalVideo} onOpenChange={fecharModalVideo}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              {previewVideo ? 'Preview do Vídeo' : 'Gravar Vídeo'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {previewVideo ? (
              <div>
                <video
                  ref={previewVideoRef}
                  src={previewVideo}
                  controls
                  className="w-full rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setPreviewVideo(null); setVideoChunks([]); }}
                  className="mt-2 text-slate-400"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Gravar novamente
                </Button>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="w-full rounded-lg bg-slate-900"
                />

                {gravandoVideo && (
                  <div className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-full flex items-center text-white text-sm">
                    <Circle className="w-3 h-3 mr-1 fill-current animate-pulse" />
                    {formatarTempo(tempoGravacao)}
                  </div>
                )}

                <div className="flex justify-center mt-4">
                  {!gravandoVideo ? (
                    <Button
                      onClick={iniciarGravacao}
                      className="bg-red-500 hover:bg-red-600 rounded-full h-16 w-16"
                    >
                      <Circle className="w-8 h-8 fill-white" />
                    </Button>
                  ) : (
                    <Button
                      onClick={pararGravacao}
                      className="bg-red-500 hover:bg-red-600 rounded-full h-16 w-16"
                    >
                      <Square className="w-6 h-6 fill-white" />
                    </Button>
                  )}
                </div>

                <p className="text-xs text-slate-500 text-center mt-2">
                  {gravandoVideo
                    ? 'Clique para parar (mín. 10s, máx. 60s)'
                    : 'Clique para iniciar a gravação'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={fecharModalVideo}
              className="border-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            {previewVideo && (
              <Button
                onClick={salvarVideo}
                disabled={isSaving}
                className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Vídeo'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <AlertDialog open={dialogExcluir} onOpenChange={setDialogExcluir}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Excluir sua conta?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. Todos os seus dados serão
              permanentemente removidos conforme a LGPD.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={excluirConta}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
