// =====================================================
// CIDADE AUTOCOMPLETE - Busca de cidades brasileiras
// Com sugestões baseadas no IBGE API
// =====================================================

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, X } from 'lucide-react';

interface Cidade {
  nome: string;
  uf: string;
}

interface CidadeAutocompleteProps {
  value: string;
  estado?: string;
  onChange: (cidade: string, estado: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CidadeAutocomplete({
  value,
  estado,
  onChange,
  placeholder = 'Digite sua cidade',
  disabled = false,
}: CidadeAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [sugestoes, setSugestoes] = useState<Cidade[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cidadesCache, setCidadesCache] = useState<Cidade[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincronizar value externo
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  // Carregar cidades do estado selecionado ou todas
  useEffect(() => {
    const carregarCidades = async () => {
      setIsLoading(true);
      try {
        let url = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome';
        if (estado) {
          url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`;
        }

        const response = await fetch(url);
        const data = await response.json();

        const cidades: Cidade[] = data.map((c: any) => ({
          nome: c.nome,
          uf: estado || c.microrregiao?.mesorregiao?.UF?.sigla || '',
        }));

        setCidadesCache(cidades);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        setCidadesCache([]);
      } finally {
        setIsLoading(false);
      }
    };

    carregarCidades();
  }, [estado]);

  // Filtrar sugestões baseado no input
  useEffect(() => {
    if (inputValue.length < 2) {
      setSugestoes([]);
      return;
    }

    const termo = inputValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const filtradas = cidadesCache
      .filter((c) => {
        const nomeNormalizado = c.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return nomeNormalizado.includes(termo);
      })
      .slice(0, 8);

    setSugestoes(filtradas);
  }, [inputValue, cidadesCache]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (cidade: Cidade) => {
    setInputValue(cidade.nome);
    onChange(cidade.nome, cidade.uf);
    setIsOpen(false);
    setSugestoes([]);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('', '');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
          disabled={disabled}
          className="text-lg py-6 bg-slate-900/50 border-slate-600 text-white pl-11 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
        )}
        {!isLoading && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown de sugestões */}
      {isOpen && sugestoes.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
          {sugestoes.map((cidade, index) => (
            <button
              key={`${cidade.nome}-${cidade.uf}-${index}`}
              type="button"
              onClick={() => handleSelect(cidade)}
              className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 flex items-center justify-between transition-colors"
            >
              <span>{cidade.nome}</span>
              <span className="text-sm text-slate-400">{cidade.uf}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mensagem quando não encontra */}
      {isOpen && inputValue.length >= 2 && sugestoes.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 text-center text-slate-400">
          Nenhuma cidade encontrada
        </div>
      )}
    </div>
  );
}
