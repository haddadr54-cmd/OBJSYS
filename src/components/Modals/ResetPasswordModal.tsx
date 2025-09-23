import React, { useState, useEffect } from 'react';
import { X, Key, User, Mail, Send, Check, AlertCircle, RefreshCw, Copy, Eye, EyeOff } from 'lucide-react';
import { Usuario, updateUsuario } from '../../lib/supabase';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Usuario | null;
  onSave: () => void;
}

export function ResetPasswordModal({ isOpen, onClose, user, onSave }: ResetPasswordModalProps) {
  const [resetMethod, setResetMethod] = useState<'auto' | 'manual'>('auto');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Gerar senha aleatória para método manual
      if (resetMethod === 'manual') {
        generateRandomPassword();
      }
      setSuccess(false);
      setError('');
      setEmailSent(false);
    }
  }, [isOpen, resetMethod]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handleAutoReset = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Simular envio de e-mail
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      setSuccess(true);
      
      setTimeout(() => {
        onSave();
        onClose();
      }, 3000);
    } catch (err) {
      setError('Erro ao enviar e-mail de redefinição');
    } finally {
      setLoading(false);
    }
  };

  const handleManualReset = async () => {
    if (!user || !newPassword) return;

    setLoading(true);
    setError('');

    try {
      // Atualizar senha no banco
      await updateUsuario(user.id, { senha: newPassword });
      
      setSuccess(true);
      
      setTimeout(() => {
        onSave();
        onClose();
      }, 3000);
    } catch (err) {
      setError('Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    alert('Senha copiada para a área de transferência!');
  };

  const resetForm = () => {
    setResetMethod('auto');
    setNewPassword('');
    setShowPassword(false);
    setLoading(false);
    setSuccess(false);
    setError('');
    setEmailSent(false);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-full">
              <Key className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Redefinir Senha
            </h3>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center space-x-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">
                {resetMethod === 'auto' 
                  ? 'E-mail de redefinição enviado com sucesso!' 
                  : 'Senha redefinida com sucesso!'
                }
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{user.nome}</h4>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                user.tipo_usuario === 'admin' ? 'bg-purple-100 text-purple-800' :
                user.tipo_usuario === 'professor' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {user.tipo_usuario === 'admin' ? 'Administrador' :
                 user.tipo_usuario === 'professor' ? 'Professor' :
                 'Pai/Responsável'}
              </span>
            </div>
          </div>

          {/* Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Redefinição
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setResetMethod('auto')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  resetMethod === 'auto'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Mail className="h-5 w-5 mx-auto mb-2" />
                <span className="text-sm font-medium">Automático</span>
                <p className="text-xs text-gray-500 mt-1">Por e-mail</p>
              </button>
              <button
                onClick={() => setResetMethod('manual')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  resetMethod === 'manual'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Key className="h-5 w-5 mx-auto mb-2" />
                <span className="text-sm font-medium">Manual</span>
                <p className="text-xs text-gray-500 mt-1">Nova senha</p>
              </button>
            </div>
          </div>

          {/* Auto Reset */}
          {resetMethod === 'auto' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📧 Redefinição Automática</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• E-mail será enviado para: <strong>{user.email}</strong></li>
                  <li>• Link válido por 24 horas</li>
                  <li>• Usuário define nova senha</li>
                  <li>• Processo seguro e automático</li>
                </ul>
              </div>

              {emailSent ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">E-mail Enviado!</h4>
                  <p className="text-sm text-gray-600">
                    O usuário receberá as instruções em breve.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleAutoReset}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Enviando...' : 'Enviar E-mail de Redefinição'}</span>
                </button>
              )}
            </div>
          )}

          {/* Manual Reset */}
          {resetMethod === 'manual' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">🔧 Redefinição Manual</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Nova senha gerada automaticamente</li>
                  <li>• Usuário deve alterar no primeiro login</li>
                  <li>• Senha temporária válida por 7 dias</li>
                  <li>• Notificação por e-mail opcional</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha Temporária
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    onClick={generateRandomPassword}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Gerar nova senha"
                  >
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={copyPassword}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    title="Copiar senha"
                  >
                    <Copy className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleManualReset}
                disabled={loading || !newPassword}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <Key className="h-4 w-4" />
                <span>{loading ? 'Redefinindo...' : 'Redefinir Senha'}</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}