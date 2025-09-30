import { useState } from 'react';
import { Save, X, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { getSituacaoAcademica, formatarNota, MEDIA_MINIMA_APROVACAO } from '../../lib/gradeConfig';
import type { Aluno, Disciplina, Nota } from '../../lib/supabase.types';

interface RecuperacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: Aluno;
  disciplinas: {
    disciplina: Disciplina;
    mediaFinal: number;
    notaRecuperacao?: number;
    situacao: 'recuperacao' | 'aprovado_recuperacao' | 'reprovado_final';
  }[];
  onSaveNota: (disciplinaId: string, nota: number) => Promise<void>;
  saving?: boolean;
}

export function RecuperacaoModal({
  isOpen,
  onClose,
  aluno,
  disciplinas,
  onSaveNota,
  saving = false
}: RecuperacaoModalProps) {
  const [notasTemp, setNotasTemp] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const handleNotaChange = (disciplinaId: string, valor: string) => {
    const nota = Math.min(10, Math.max(0, parseFloat(valor) || 0));
    setNotasTemp(prev => ({
      ...prev,
      [disciplinaId]: nota
    }));
  };

  const calcularSituacaoFinal = (mediaOriginal: number, notaRecuperacao?: number) => {
    if (notaRecuperacao === undefined) return getSituacaoAcademica(mediaOriginal);
    
    const mediaFinal = Math.max(mediaOriginal, notaRecuperacao);
    return getSituacaoAcademica(mediaFinal);
  };

  const handleSalvarTodas = async () => {
    try {
      for (const [disciplinaId, nota] of Object.entries(notasTemp)) {
        if (nota > 0) {
          await onSaveNota(disciplinaId, nota);
        }
      }
      setNotasTemp({});
      onClose();
    } catch (error) {
      console.error('Erro ao salvar notas de recuperação:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Gestão de Recuperação</h2>
                <p className="text-yellow-100 mt-1">
                  Aluno: <span className="font-semibold">{aluno.nome}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {disciplinas.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Parabéns! Aluno Aprovado
              </h3>
              <p className="text-gray-600">
                Este aluno não possui disciplinas em recuperação.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Disciplinas em Recuperação</h3>
                </div>
                <p className="text-sm text-yellow-700">
                  O aluno precisa atingir média {MEDIA_MINIMA_APROVACAO.toFixed(1)} ou superior nas disciplinas abaixo.
                  A nota de recuperação substituirá a média original apenas se for maior.
                </p>
              </div>

              {disciplinas.map((item) => {
                const notaTempAtual = notasTemp[item.disciplina.id] || item.notaRecuperacao || 0;
                const situacaoFinal = calcularSituacaoFinal(item.mediaFinal, notaTempAtual || undefined);
                const mediaFinalComRecuperacao = Math.max(item.mediaFinal, notaTempAtual || 0);

                return (
                  <div
                    key={item.disciplina.id}
                    className={`border rounded-lg p-6 transition-all ${
                      situacaoFinal.status === 'Aprovado' 
                        ? 'border-green-200 bg-green-50'
                        : situacaoFinal.status === 'Recuperação'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {item.disciplina.nome}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Média Original: <span className={`font-medium ${getSituacaoAcademica(item.mediaFinal).textColor}`}>
                              {formatarNota(item.mediaFinal)}
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        situacaoFinal.status === 'Aprovado'
                          ? 'bg-green-100 text-green-800'
                          : situacaoFinal.status === 'Recuperação'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {situacaoFinal.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Nota de Recuperação */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nota de Recuperação
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={notaTempAtual || ''}
                          onChange={(e) => handleNotaChange(item.disciplina.id, e.target.value)}
                          placeholder="0.0"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Média Final Projetada */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Média Final Projetada
                        </label>
                        <div className={`w-full border rounded-lg px-3 py-2 text-center font-bold text-lg ${
                          situacaoFinal.bgColor.replace('bg-', 'bg-').replace('-500', '-100')
                        } ${situacaoFinal.textColor}`}>
                          {formatarNota(mediaFinalComRecuperacao)}
                        </div>
                      </div>

                      {/* Status Final */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Situação Final
                        </label>
                        <div className={`w-full border rounded-lg px-3 py-2 text-center font-medium flex items-center justify-center space-x-2 ${
                          situacaoFinal.bgColor.replace('bg-', 'bg-').replace('-500', '-100')
                        } ${situacaoFinal.textColor}`}>
                          <span>{situacaoFinal.icon}</span>
                          <span>{situacaoFinal.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Análise de Melhoria */}
                    {notaTempAtual > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Análise:</strong> 
                          {mediaFinalComRecuperacao > item.mediaFinal ? (
                            ` A nota de recuperação ${formatarNota(notaTempAtual)} elevou a média de ${formatarNota(item.mediaFinal)} para ${formatarNota(mediaFinalComRecuperacao)}.`
                          ) : (
                            ` A nota de recuperação ${formatarNota(notaTempAtual)} não alterou a média original de ${formatarNota(item.mediaFinal)}.`
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {disciplinas.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-600">
              {Object.keys(notasTemp).length > 0 ? (
                <span>
                  {Object.keys(notasTemp).length} nota(s) alterada(s) • 
                  <strong className="ml-1">Lembre-se de salvar as alterações</strong>
                </span>
              ) : (
                'Digite as notas de recuperação e clique em Salvar'
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarTodas}
                disabled={saving || Object.keys(notasTemp).length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Notas'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}