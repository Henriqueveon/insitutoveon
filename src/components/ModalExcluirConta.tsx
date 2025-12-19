import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ModalExcluirContaProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioTipo: 'candidato' | 'empresa' | 'analista';
  usuarioId: string;
  usuarioEmail: string;
  usuarioNome: string;
}

const MOTIVOS = [
  { value: 'encontrei_emprego_candidato', label: 'Encontrei emprego/Consegui contratar' },
  { value: 'nao_gostei_plataforma', label: 'Não gostei da plataforma' },
  { value: 'plataforma_nao_atende', label: 'A plataforma não atende minhas necessidades' },
  { value: 'nao_sei_usar', label: 'Não sei usar a plataforma' },
  { value: 'entrei_conhecer', label: 'Entrei apenas para conhecer' },
  { value: 'nao_informar', label: 'Prefiro não informar' },
];

export function ModalExcluirConta({
  isOpen,
  onClose,
  usuarioTipo,
  usuarioId,
  usuarioEmail,
  usuarioNome,
}: ModalExcluirContaProps) {
  const [etapa, setEtapa] = useState<'motivo' | 'confirmacao' | 'sucesso'>('motivo');
  const [motivoSelecionado, setMotivoSelecionado] = useState('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [contadorLogout, setContadorLogout] = useState(3);

  useEffect(() => {
    if (etapa === 'sucesso') {
      const interval = setInterval(() => {
        setContadorLogout((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            realizarLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [etapa]);

  const realizarLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSolicitarExclusao = async () => {
    if (!motivoSelecionado) {
      setErro('Por favor, selecione um motivo.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const { data, error } = await supabase.rpc('solicitar_exclusao_conta', {
        p_usuario_id: usuarioId,
        p_usuario_tipo: usuarioTipo,
        p_motivo: motivoSelecionado,
        p_comentario: comentario || null,
      });

      if (error) {
        console.error('Erro ao solicitar exclusão:', error);
        setErro(error.message || 'Erro ao processar solicitação. Tente novamente.');
        return;
      }

      if (data && !data.sucesso) {
        setErro(data.mensagem || 'Erro ao processar solicitação.');
        return;
      }

      setEtapa('sucesso');
    } catch (err) {
      console.error('Erro inesperado:', err);
      setErro('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (etapa !== 'sucesso') {
      setEtapa('motivo');
      setMotivoSelecionado('');
      setComentario('');
      setErro('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Excluir Conta
          </h2>
        </div>

        <div className="p-6">
          {/* Etapa: Motivo */}
          {etapa === 'motivo' && (
            <>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Lamentamos que você queira nos deixar. Por favor, nos ajude a melhorar informando o motivo:
                </p>

                <div className="space-y-3">
                  {MOTIVOS.map((motivo) => (
                    <label
                      key={motivo.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        motivoSelecionado === motivo.value
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="motivo"
                        value={motivo.value}
                        checked={motivoSelecionado === motivo.value}
                        onChange={(e) => setMotivoSelecionado(e.target.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-3 text-gray-700">{motivo.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Comentário adicional (opcional)
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Deixe aqui suas sugestões ou feedback..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                />
              </div>

              {erro && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {erro}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setEtapa('confirmacao')}
                  disabled={!motivoSelecionado}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {/* Etapa: Confirmação */}
          {etapa === 'confirmacao' && (
            <>
              <div className="mb-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tem certeza?</h3>
                <p className="text-gray-600">
                  Sua conta será desativada por <span className="font-bold text-red-600">30 dias</span>.
                  Após esse período, todos os seus dados serão excluídos permanentemente.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-yellow-800 mb-2">Durante os 30 dias:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Você não terá acesso à plataforma</li>
                  <li>• Seu perfil ficará invisível</li>
                  <li>• Ao fazer login, sua conta será reativada automaticamente</li>
                </ul>
              </div>

              {erro && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {erro}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setEtapa('motivo')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSolicitarExclusao}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processando...
                    </>
                  ) : (
                    'Confirmar Exclusão'
                  )}
                </button>
              </div>
            </>
          )}

          {/* Etapa: Sucesso */}
          {etapa === 'sucesso' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitação Registrada</h3>
              <p className="text-gray-600 mb-4">
                Sua conta será excluída em 30 dias. Se mudar de ideia, basta fazer login novamente.
              </p>
              <p className="text-sm text-gray-500">
                Você será desconectado em <span className="font-bold text-red-600">{contadorLogout}</span> segundos...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalExcluirConta;
