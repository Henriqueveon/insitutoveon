// =====================================================
// EXEMPLOS DE USO - R2 Storage
// Este arquivo mostra como usar os componentes e hooks de upload
// =====================================================

import React from 'react';

// =====================================================
// EXEMPLO 1: Upload de Foto do Candidato (Componente pronto)
// =====================================================

import { FotoCandidatoUpload } from '@/components/upload';

function ExemploFotoCandidato() {
  const candidatoId = 'uuid-do-candidato';

  return (
    <FotoCandidatoUpload
      candidatoId={candidatoId}
      currentFotoUrl="https://pub-recruta-veon.r2.dev/candidatos/123/foto.jpg"
      onUploadSuccess={(url) => {
        console.log('Foto enviada:', url);
      }}
    />
  );
}

// =====================================================
// EXEMPLO 2: Upload de Currículo (Componente pronto)
// =====================================================

import { CurriculoUpload } from '@/components/upload';

function ExemploCurriculoCandidato() {
  const candidatoId = 'uuid-do-candidato';

  return (
    <CurriculoUpload
      candidatoId={candidatoId}
      onUploadSuccess={(url) => {
        console.log('Currículo enviado:', url);
      }}
    />
  );
}

// =====================================================
// EXEMPLO 3: Upload de Vídeo (Componente pronto)
// =====================================================

import { VideoUpload } from '@/components/upload';

function ExemploVideoCandidato() {
  const candidatoId = 'uuid-do-candidato';

  return (
    <VideoUpload
      candidatoId={candidatoId}
      onUploadSuccess={(url) => {
        console.log('Vídeo enviado:', url);
      }}
    />
  );
}

// =====================================================
// EXEMPLO 4: Upload de Logo da Empresa (Componente pronto)
// =====================================================

import { LogoEmpresaUpload } from '@/components/upload';

function ExemploLogoEmpresa() {
  const empresaId = 'uuid-da-empresa';

  return (
    <LogoEmpresaUpload
      empresaId={empresaId}
      onUploadSuccess={(url) => {
        console.log('Logo enviada:', url);
      }}
    />
  );
}

// =====================================================
// EXEMPLO 5: Usando o Hook diretamente (mais controle)
// =====================================================

import { useFileUpload } from '@/hooks/useFileUpload';

function ExemploComHook() {
  const { upload, isUploading, progress, error, reset } = useFileUpload({
    onSuccess: (response) => {
      console.log('Upload concluído:', response.publicUrl);
    },
    onError: (errorMsg) => {
      console.error('Erro:', errorMsg);
    },
  });

  const handleUpload = async (file: File) => {
    await upload({
      category: 'candidatos',
      entityId: 'uuid-do-candidato',
      fileType: 'foto',
      file,
    });
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={isUploading}
      />
      {isUploading && <p>Enviando... {progress}%</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

// =====================================================
// EXEMPLO 6: Usando o Serviço diretamente (máximo controle)
// =====================================================

import {
  uploadFotoCandidato,
  uploadCurriculoCandidato,
  uploadVideoCandidato,
  uploadLogoEmpresa,
  deleteFile,
  getPublicUrl,
  extractPathFromUrl,
} from '@/services/r2Storage';

async function exemploServico() {
  // Upload de foto
  const fotoResult = await uploadFotoCandidato(
    'uuid-candidato',
    new File([], 'foto.jpg'),
    (progress) => console.log(`Progresso: ${progress}%`)
  );

  if (fotoResult.success) {
    console.log('URL da foto:', fotoResult.publicUrl);
  }

  // Upload de currículo
  const curriculoResult = await uploadCurriculoCandidato(
    'uuid-candidato',
    new File([], 'curriculo.pdf')
  );

  // Upload de vídeo
  const videoResult = await uploadVideoCandidato(
    'uuid-candidato',
    new File([], 'video.mp4')
  );

  // Upload de logo
  const logoResult = await uploadLogoEmpresa(
    'uuid-empresa',
    new File([], 'logo.png')
  );

  // Deletar arquivo
  const path = extractPathFromUrl(fotoResult.publicUrl || '');
  if (path) {
    await deleteFile(path);
  }

  // Gerar URL pública
  const url = getPublicUrl('candidatos/123/foto.jpg');
  console.log('URL:', url);
}

// =====================================================
// EXEMPLO 7: Formulário completo de perfil do candidato
// =====================================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function FormularioPerfilCandidato({ candidatoId }: { candidatoId: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <FotoCandidatoUpload candidatoId={candidatoId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currículo (PDF)</CardTitle>
        </CardHeader>
        <CardContent>
          <CurriculoUpload candidatoId={candidatoId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vídeo de Apresentação</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoUpload candidatoId={candidatoId} />
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// ESTRUTURA DE PASTAS NO R2
// =====================================================
/*
recruta-veon/
├── candidatos/
│   └── {candidato_id}/
│       ├── foto-{timestamp}.jpg
│       ├── curriculo-{timestamp}.pdf
│       └── video-entrevista-{timestamp}.mp4
├── empresas/
│   └── {empresa_id}/
│       └── logo-{timestamp}.png
└── vagas/
    └── {vaga_id}/
        └── imagem-{timestamp}.jpg
*/

export {
  ExemploFotoCandidato,
  ExemploCurriculoCandidato,
  ExemploVideoCandidato,
  ExemploLogoEmpresa,
  ExemploComHook,
  FormularioPerfilCandidato,
};
