// =====================================================
// COMPONENTE: Input de Username com validação em tempo real
// Verifica disponibilidade no banco de dados
// =====================================================

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  tipo: 'candidato' | 'empresa';
  idAtual?: string;
  disabled?: boolean;
}

export function UsernameInput({
  value,
  onChange,
  tipo,
  idAtual,
  disabled = false
}: UsernameInputProps) {
  const [verificando, setVerificando] = useState(false);
  const [disponivel, setDisponivel] = useState<boolean | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const debouncedUsername = useDebounce(value, 500);

  // Validar formato do username
  const validarFormato = (username: string): string | null => {
    if (username.length < 3) {
      return 'Mínimo 3 caracteres';
    }
    if (username.length > 20) {
      return 'Máximo 20 caracteres';
    }
    if (!/^[a-z]/.test(username)) {
      return 'Deve começar com letra';
    }
    if (!/^[a-z][a-z0-9._]*$/.test(username)) {
      return 'Apenas letras, números, ponto e underline';
    }
    if (/[._]{2}/.test(username)) {
      return 'Não pode ter caracteres especiais seguidos';
    }
    if (/[._]$/.test(username)) {
      return 'Não pode terminar com ponto ou underline';
    }
    return null;
  };

  // Formatar input (lowercase, remover caracteres inválidos)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9._]/g, '')
      .slice(0, 20);

    onChange(rawValue);
    setDisponivel(null);
  };

  // Verificar disponibilidade
  useEffect(() => {
    const verificarDisponibilidade = async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        setDisponivel(null);
        setErro(null);
        return;
      }

      const erroFormato = validarFormato(debouncedUsername);
      if (erroFormato) {
        setErro(erroFormato);
        setDisponivel(false);
        return;
      }

      setVerificando(true);
      setErro(null);

      try {
        const { data, error } = await supabase.rpc('verificar_username_disponivel', {
          p_username: debouncedUsername,
          p_tipo: tipo,
          p_id_atual: idAtual || null
        });

        if (error) throw error;

        setDisponivel(data);
        if (!data) {
          setErro('Username já está em uso');
        }
      } catch (error) {
        console.error('Erro ao verificar username:', error);
        setErro('Erro ao verificar disponibilidade');
      } finally {
        setVerificando(false);
      }
    };

    verificarDisponibilidade();
  }, [debouncedUsername, tipo, idAtual]);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-300">
        Nome de usuário
      </label>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          @
        </span>

        <Input
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="seu.usuario"
          maxLength={20}
          className="pl-8 pr-10 bg-gray-700 border-gray-600 text-white lowercase"
        />

        {/* Indicador de status */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {verificando && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
          {!verificando && disponivel === true && (
            <Check className="w-4 h-4 text-green-500" />
          )}
          {!verificando && disponivel === false && (
            <X className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Mensagem de erro ou sucesso */}
      <div className="flex justify-between items-center">
        {erro ? (
          <p className="text-xs text-red-400">{erro}</p>
        ) : disponivel === true ? (
          <p className="text-xs text-green-400">Username disponível!</p>
        ) : (
          <p className="text-xs text-gray-500">
            Letras, números, ponto e underline. 3-20 caracteres.
          </p>
        )}
        <span className="text-xs text-gray-500">
          {value.length}/20
        </span>
      </div>
    </div>
  );
}

export default UsernameInput;
