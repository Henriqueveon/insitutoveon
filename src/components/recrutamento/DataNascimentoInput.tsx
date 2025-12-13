// =====================================================
// DATA DE NASCIMENTO INPUT - 3 selects + cálculo de idade
// Dia, Mês e Ano separados para melhor UX
// =====================================================

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, AlertCircle } from 'lucide-react';

interface DataNascimentoInputProps {
  value: string; // formato: YYYY-MM-DD
  onChange: (value: string) => void;
}

const MESES = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const IDADE_MINIMA = 16;
const IDADE_MAXIMA = 70;

export default function DataNascimentoInput({ value, onChange }: DataNascimentoInputProps) {
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [idade, setIdade] = useState<number | null>(null);
  const [erro, setErro] = useState('');

  const anoAtual = new Date().getFullYear();
  const anoMinimo = anoAtual - IDADE_MAXIMA;
  const anoMaximo = anoAtual - IDADE_MINIMA;

  // Gerar lista de anos
  const anos = Array.from({ length: IDADE_MAXIMA - IDADE_MINIMA + 1 }, (_, i) => anoMaximo - i);

  // Gerar lista de dias baseado no mês e ano
  const getDiasNoMes = (mesNum: string, anoNum: string): number => {
    if (!mesNum || !anoNum) return 31;
    const m = parseInt(mesNum, 10);
    const a = parseInt(anoNum, 10);
    return new Date(a, m, 0).getDate();
  };

  const diasNoMes = getDiasNoMes(mes, ano);
  const dias = Array.from({ length: diasNoMes }, (_, i) => String(i + 1).padStart(2, '0'));

  // Sincronizar com value externo
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      setAno(y || '');
      setMes(m || '');
      setDia(d || '');
    }
  }, [value]);

  // Calcular idade e validar
  useEffect(() => {
    if (dia && mes && ano) {
      const dataNascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      const hoje = new Date();

      let idadeCalculada = hoje.getFullYear() - dataNascimento.getFullYear();
      const mesAtual = hoje.getMonth() - dataNascimento.getMonth();

      if (mesAtual < 0 || (mesAtual === 0 && hoje.getDate() < dataNascimento.getDate())) {
        idadeCalculada--;
      }

      setIdade(idadeCalculada);

      // Validação
      if (idadeCalculada < IDADE_MINIMA) {
        setErro(`Idade mínima: ${IDADE_MINIMA} anos`);
      } else if (idadeCalculada > IDADE_MAXIMA) {
        setErro(`Idade máxima: ${IDADE_MAXIMA} anos`);
      } else {
        setErro('');
      }

      // Atualizar valor
      const dataFormatada = `${ano}-${mes}-${dia}`;
      if (dataFormatada !== value) {
        onChange(dataFormatada);
      }
    } else {
      setIdade(null);
      setErro('');
    }
  }, [dia, mes, ano]);

  // Ajustar dia se necessário quando mês/ano mudar
  useEffect(() => {
    if (dia && parseInt(dia) > diasNoMes) {
      setDia(String(diasNoMes).padStart(2, '0'));
    }
  }, [diasNoMes]);

  const handleDiaChange = (newDia: string) => {
    setDia(newDia);
  };

  const handleMesChange = (newMes: string) => {
    setMes(newMes);
  };

  const handleAnoChange = (newAno: string) => {
    setAno(newAno);
  };

  return (
    <div className="space-y-4">
      {/* 3 Selects lado a lado */}
      <div className="grid grid-cols-3 gap-3">
        {/* Dia */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Dia</label>
          <Select value={dia} onValueChange={handleDiaChange}>
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
              <SelectValue placeholder="Dia" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
              {dias.map((d) => (
                <SelectItem key={d} value={d} className="text-white">
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mês */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Mês</label>
          <Select value={mes} onValueChange={handleMesChange}>
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
              {MESES.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-white">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ano */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Ano</label>
          <Select value={ano} onValueChange={handleAnoChange}>
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
              {anos.map((a) => (
                <SelectItem key={a} value={String(a)} className="text-white">
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exibição da idade */}
      {idade !== null && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          erro ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'
        }`}>
          {erro ? (
            <>
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{erro}</span>
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5 text-green-400" />
              <span className="text-green-400">
                Você tem <strong>{idade} anos</strong>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
