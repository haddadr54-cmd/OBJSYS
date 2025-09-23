import React, { useState } from 'react';
import { X, Mail, Send, Check, AlertCircle, ArrowLeft, Key, Clock } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'success' | 'manual'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('E-mail é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simular envio de e-mail de recuperação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar se e-mail existe no sistema (simulado)
      const emailExists = ['admin@escola.com', 'professor@escola.com', 'pai@escola.com'].includes(email);
      
      if (emailExists) {
        setStep('success');
      } else {
        setStep('manual');
      }
    } catch (error) {
      setError('Erro ao enviar e-mail de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Esqueceu a Senha?
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Email Input */}
          {step === 'email' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Recuperar Senha
                </h4>
                <p className="text-gray-600">
                  Digite seu e-mail para receber instruções de recuperação
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail cadastrado
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Enviando...' : 'Enviar Link de Recuperação'}</span>
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={handleClose}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Success */}
          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  E-mail Enviado!
                </h4>
                <p className="text-gray-600 mb-4">
                  Enviamos um link de recuperação para:
                </p>
                <p className="font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                  {email}
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <h5 className="font-medium text-blue-800 mb-2">📧 Próximos passos:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Verifique sua caixa de entrada</li>
                  <li>• Clique no link recebido</li>
                  <li>• Defina uma nova senha</li>
                  <li>• Faça login com a nova senha</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voltar ao Login
                </button>
                <button
                  onClick={() => setStep('email')}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Tentar outro e-mail
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Manual Reset */}
          {step === 'manual' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Solicitação Registrada
                </h4>
                <p className="text-gray-600 mb-4">
                  E-mail não encontrado no sistema automático.
                </p>
                <p className="font-medium text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg">
                  Solicitação enviada para: {email}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <h5 className="font-medium text-yellow-800 mb-2">👨‍💼 Redefinição Manual:</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Sua solicitação foi registrada</li>
                  <li>• Um administrador irá processar</li>
                  <li>• Você receberá a nova senha por e-mail</li>
                  <li>• Prazo: até 24 horas úteis</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <h5 className="font-medium text-blue-800 mb-2">📞 Contato Direto:</h5>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Secretaria: (11) 1234-5678</p>
                  <p>• E-mail: secretaria@escola.com</p>
                  <p>• Horário: 8h às 17h</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voltar ao Login
                </button>
                <button
                  onClick={() => setStep('email')}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Tentar outro e-mail
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}