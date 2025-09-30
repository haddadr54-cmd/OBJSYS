import { useState } from 'react';
import { CheckCircle, X, Save } from 'lucide-react';

type StatusFinal = 'pendente' | 'aprovado' | 'reprovado' | 'aprovado_conselho';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  aluno: { id: string; nome: string } | null;
  anoLetivo: number;
  onConfirm: (status: StatusFinal, justificativa?: string) => Promise<void> | void;
}

export function DecisaoFinalModal({ isOpen, onClose, aluno, anoLetivo, onConfirm }: Props) {
  const [status, setStatus] = useState<StatusFinal>('pendente');
  const [justificativa, setJustificativa] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !aluno) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onConfirm(status, justificativa.trim() || undefined);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold">Decisão final - {aluno.nome} ({anoLetivo})</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status final</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFinal)}
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="reprovado">Reprovado</option>
              <option value="aprovado_conselho">Aprovado com conselho</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Justificativa / Observações</label>
            <textarea
              rows={4}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Descreva a decisão e a justificativa (obrigatório para aprovado com conselho e reprovado)."
              className="mt-1 w-full resize-none rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(status === 'aprovado_conselho' || status === 'reprovado') && justificativa.trim().length === 0 && (
              <p className="mt-1 text-sm text-red-600">Justificativa é obrigatória para este status.</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-5 py-3">
          <button onClick={onClose} className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-200">Cancelar</button>
          <button
            disabled={saving || ((status === 'aprovado_conselho' || status === 'reprovado') && justificativa.trim().length === 0)}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={16} /> Salvar decisão
          </button>
        </div>
      </div>
    </div>
  );
}

export default DecisaoFinalModal;
