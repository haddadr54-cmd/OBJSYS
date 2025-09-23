import React from 'react';
import { X, HelpCircle, User, Lock, LogIn, Phone, Mail, Clock, CheckCircle, Key } from 'lucide-react';

interface HelpInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpInstructionsModal({ isOpen, onClose }: HelpInstructionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <HelpCircle className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              💡 Como Acessar o Sistema
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Instruções Passo a Passo */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              📋 Passo a Passo para Login
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h5 className="font-medium text-blue-900 mb-1 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Digite seu e-mail ou nome de usuário
                  </h5>
                  <p className="text-sm text-blue-700">
                    Use o e-mail cadastrado na escola (ex: joao@email.com)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <div>
                  <h5 className="font-medium text-green-900 mb-1 flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Insira a senha cadastrada
                  </h5>
                  <p className="text-sm text-green-700">
                    Digite a senha fornecida pela escola ou definida por você
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <div>
                  <h5 className="font-medium text-purple-900 mb-1 flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Clique em "Entrar"
                  </h5>
                  <p className="text-sm text-purple-700">
                    Aguarde o carregamento e você será direcionado ao sistema
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 font-bold">4</span>
                </div>
                <div>
                  <h5 className="font-medium text-yellow-900 mb-1 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Em caso de dúvidas, entre em contato
                  </h5>
                  <p className="text-sm text-yellow-700">
                    Nossa equipe está pronta para ajudar você
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Credenciais de Teste */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Key className="h-5 w-5 text-purple-600" />
              </div>
              🔑 Credenciais para Teste
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">👑</span>
                </div>
                <h5 className="font-medium text-purple-900 mb-2">Administrador</h5>
                <div className="text-sm text-purple-700 space-y-1">
                  <p><strong>E-mail:</strong> admin@escola.com</p>
                  <p><strong>Senha:</strong> 123456</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">👨‍🏫</span>
                </div>
                <h5 className="font-medium text-green-900 mb-2">Professor</h5>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>E-mail:</strong> professor@escola.com</p>
                  <p><strong>Senha:</strong> 123456</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">👨‍👩‍👧‍👦</span>
                </div>
                <h5 className="font-medium text-blue-900 mb-2">Pai/Responsável</h5>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>E-mail:</strong> pai@escola.com</p>
                  <p><strong>Senha:</strong> 123456</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              📞 Precisa de Ajuda?
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <h5 className="font-medium text-blue-900">Secretaria</h5>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Telefone:</strong> (11) 1234-5678</p>
                  <p><strong>E-mail:</strong> secretaria@escola.com</p>
                  <p><strong>Horário:</strong> 8h às 17h</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <h5 className="font-medium text-green-900">Suporte Técnico</h5>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>E-mail:</strong> suporte@escola.com</p>
                  <p><strong>WhatsApp:</strong> (11) 99999-9999</p>
                  <p><strong>Horário:</strong> 8h às 18h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dicas Importantes */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <div className="p-1 bg-gray-100 rounded mr-2">
                <HelpCircle className="h-4 w-4 text-gray-600" />
              </div>
              💡 Dicas Importantes
            </h5>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Verifique se o Caps Lock está desativado</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Certifique-se de estar usando o e-mail correto</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Se esqueceu a senha, use a opção "Esqueceu a senha?"</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Para primeiro acesso, entre em contato com a secretaria</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}