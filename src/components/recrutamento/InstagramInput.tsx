// =====================================================
// INSTAGRAM INPUT - Campo com validação e formatação
// Inclui ícone, validação e texto explicativo
// =====================================================

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Instagram, AlertCircle, CheckCircle } from 'lucide-react';

interface InstagramInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function InstagramInput({ value, onChange }: InstagramInputProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [erro, setErro] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Sincronizar com value externo
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  // Validar Instagram
  const validarInstagram = (username: string): { valido: boolean; erro: string } => {
    if (!username) {
      return { valido: true, erro: '' }; // Campo opcional, vazio é válido
    }

    // Remover @ se existir
    const cleanUsername = username.replace(/^@/, '');

    // Verificar espaços
    if (/\s/.test(cleanUsername)) {
      return { valido: false, erro: 'Instagram não pode ter espaços' };
    }

    // Verificar caracteres válidos (letras, números, pontos, underlines)
    if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
      return { valido: false, erro: 'Use apenas letras, números, pontos e underlines' };
    }

    // Verificar tamanho
    if (cleanUsername.length < 1) {
      return { valido: false, erro: 'Instagram muito curto' };
    }

    if (cleanUsername.length > 30) {
      return { valido: false, erro: 'Instagram muito longo (máx. 30 caracteres)' };
    }

    // Não pode começar ou terminar com ponto
    if (cleanUsername.startsWith('.') || cleanUsername.endsWith('.')) {
      return { valido: false, erro: 'Instagram não pode começar ou terminar com ponto' };
    }

    // Não pode ter pontos consecutivos
    if (/\.\./.test(cleanUsername)) {
      return { valido: false, erro: 'Instagram não pode ter pontos consecutivos' };
    }

    return { valido: true, erro: '' };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Garantir que começa com @
    if (newValue && !newValue.startsWith('@')) {
      newValue = '@' + newValue;
    }

    // Remover caracteres inválidos exceto o @ inicial
    const cleanValue = newValue.slice(1).replace(/[^a-zA-Z0-9._]/g, '').toLowerCase();
    const formattedValue = cleanValue ? '@' + cleanValue : '';

    setInputValue(formattedValue);

    // Validar
    const validacao = validarInstagram(formattedValue);
    setErro(validacao.erro);
    setIsValid(validacao.valido && formattedValue.length > 1);

    // Atualizar valor (salvar sem @)
    onChange(cleanValue);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-white font-medium">Seu Instagram</label>

      {/* Input com ícone */}
      <div className="relative">
        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
        <Input
          type="text"
          placeholder="@seuinstagram"
          value={inputValue}
          onChange={handleChange}
          className={`
            text-lg py-6 bg-slate-900/50 border-slate-600 text-white pl-11 pr-10
            ${erro ? 'border-red-500' : isValid ? 'border-green-500' : ''}
          `}
        />
        {/* Ícone de status */}
        {inputValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {erro ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : isValid ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : null}
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {erro}
        </p>
      )}

      {/* Texto explicativo */}
      <p className="text-sm text-slate-400 flex items-start gap-2">
        <Instagram className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Coloque o @ exato do seu Instagram. As empresas avaliam o perfil dos candidatos para conhecê-los melhor.
        </span>
      </p>

      {/* Preview do link */}
      {isValid && inputValue && (
        <a
          href={`https://instagram.com/${inputValue.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300"
        >
          <Instagram className="w-4 h-4" />
          Ver perfil no Instagram
        </a>
      )}
    </div>
  );
}
