// =====================================================
// COMPONENTE - FileUpload
// Componente reutilizável para upload de arquivos
// =====================================================

import { useCallback, useRef, useState } from 'react';
import { Upload, X, FileText, Image, Video, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { validateFile, FileType } from '@/services/r2Storage';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  fileType: FileType;
  accept?: string;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  isUploading?: boolean;
  progress?: number;
  error?: string | null;
  currentFileUrl?: string | null;
  placeholder?: string;
}

const fileTypeConfig: Record<FileType, {
  icon: typeof Upload;
  accept: string;
  label: string;
  description: string;
}> = {
  foto: {
    icon: Image,
    accept: 'image/jpeg,image/png,image/webp',
    label: 'Foto',
    description: 'JPG, PNG ou WebP até 5MB',
  },
  logo: {
    icon: Image,
    accept: 'image/jpeg,image/png,image/webp,image/svg+xml',
    label: 'Logo',
    description: 'JPG, PNG, WebP ou SVG até 2MB',
  },
  imagem: {
    icon: Image,
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    label: 'Imagem',
    description: 'JPG, PNG, WebP ou GIF até 5MB',
  },
  curriculo: {
    icon: FileText,
    accept: 'application/pdf',
    label: 'Currículo',
    description: 'PDF até 10MB',
  },
  video: {
    icon: Video,
    accept: 'video/mp4,video/webm,video/quicktime',
    label: 'Vídeo',
    description: 'MP4, WebM ou MOV até 100MB',
  },
};

export function FileUpload({
  onFileSelect,
  onRemove,
  fileType,
  accept,
  className,
  disabled = false,
  isUploading = false,
  progress = 0,
  error = null,
  currentFileUrl = null,
  placeholder,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const config = fileTypeConfig[fileType];
  const Icon = config.icon;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setValidationError(null);

      const validation = validateFile(file, fileType);
      if (!validation.valid) {
        setValidationError(validation.error || 'Arquivo inválido');
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [fileType, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, isUploading, handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onRemove?.();
  }, [onRemove]);

  const displayError = error || validationError;
  const isImage = ['foto', 'logo', 'imagem'].includes(fileType);
  const previewUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : currentFileUrl;

  return (
    <div className={cn('w-full', className)}>
      {/* Preview de imagem existente ou selecionada */}
      {previewUrl && isImage && !isUploading && (
        <div className="relative mb-4 rounded-lg overflow-hidden border border-slate-700">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Área de upload */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
          dragActive && 'border-blue-500 bg-blue-500/10',
          displayError && 'border-red-500 bg-red-500/10',
          isUploading && 'pointer-events-none',
          disabled && 'opacity-50 cursor-not-allowed',
          !displayError &&
            !dragActive &&
            'border-slate-600 hover:border-slate-500 bg-slate-800/50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept || config.accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 mx-auto text-blue-400 animate-spin" />
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Enviando arquivo...</p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-slate-500">{progress}%</p>
            </div>
          </div>
        ) : selectedFile && !displayError ? (
          <div className="space-y-3">
            <CheckCircle2 className="w-10 h-10 mx-auto text-green-500" />
            <div>
              <p className="text-sm font-medium text-white">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayError ? (
              <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
            ) : (
              <Icon className="w-10 h-10 mx-auto text-slate-400" />
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {placeholder || `Arraste seu ${config.label.toLowerCase()} aqui`}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ou clique para selecionar
              </p>
              {displayError ? (
                <p className="text-xs text-red-400 mt-2">{displayError}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-2">{config.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
