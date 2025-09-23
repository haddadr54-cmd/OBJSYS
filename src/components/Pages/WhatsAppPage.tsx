import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  QrCode, 
  Smartphone, 
  Globe, 
  Zap, 
  Clock, 
  User, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Settings,
  Monitor,
  Wifi,
  WifiOff,
  Power,
  PowerOff
} from 'lucide-react';

interface WhatsAppStatus {
  connected: boolean;
  status: string;
  qrCode?: string;
  lastError?: string;
  timestamp: string;
  provider: string;
}

interface MessageResult {
  success: boolean;
  number: string;
  message?: string;
  error?: string;
}

interface BulkResult {
  total: number;
  sucessos: number;
  falhas: number;
  results: MessageResult[];
}

export function WhatsAppPage() {
  // Estados principais
  const [status, setStatus] = useState<WhatsAppStatus>({
    connected: false,
    status: 'disconnected',
    timestamp: new Date().toISOString(),
    provider: 'WhatsApp Web (Puppeteer)'
  });
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados de mensagem
  const [singleNumber, setSingleNumber] = useState('');
  const [singleMessage, setSingleMessage] = useState('');
  const [bulkNumbers, setBulkNumbers] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkDelay, setBulkDelay] = useState(5000);
  
  // Estados de resultados
  const [lastResults, setLastResults] = useState<BulkResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Estados de configuração
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'individual' | 'massa' | 'resultados'>('individual');

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 10000); // Verificar a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status');
      
      if (!response.ok) {
        throw new Error(`API retornou status ${response.status}`);
      }
      
      const data = await response.json();
      
      setStatus(data);
      setError('');
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setError(`Erro ao verificar status da API WhatsApp:\n\n${error.message}`);
      setStatus(prev => ({ 
        ...prev, 
        connected: false, 
        status: 'error',
        lastError: error.message 
      }));
    }
  };

  const connectWhatsApp = async () => {
    setConnecting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus(data);
        setSuccess(data.connected ? 'Z-API conectado com sucesso!' : 'Z-API verificado - aguardando conexão');
        
        // Se ainda não conectado, verificar status periodicamente
        if (!data.connected) {
          const checkConnection = setInterval(async () => {
            const statusResponse = await fetch('/api/whatsapp/status');
            const statusData = await statusResponse.json();
            
            if (statusResponse.ok) {
              setStatus(statusData);
              
              if (statusData.connected) {
                setSuccess('WhatsApp Web conectado com sucesso!');
                clearInterval(checkConnection);
              }
            }
          }, 3000);
          
          // Limpar interval após 2 minutos
          setTimeout(() => clearInterval(checkConnection), 120000);
        }
      } else {
        throw new Error(data.error || 'Erro ao conectar Z-API');
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      setError(`Erro ao conectar WhatsApp Web:\n\n${error.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWhatsApp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      setStatus(prev => ({
        ...prev,
        connected: false,
        status: 'disconnected',
        qrCode: null 
      }));
      setSuccess('Z-API desconectado com sucesso!');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      setError(`Erro ao desconectar:\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendSingleMessage = async () => {
    if (!singleNumber.trim() || !singleMessage.trim()) {
      setError('Preencha o número e a mensagem');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');
    
    try {
      // Formatar número para Z-API (apenas números)
      const cleanNumber = singleNumber.replace(/\D/g, '');
      
      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanNumber,
          message: singleMessage
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(`Mensagem enviada com sucesso para ${singleNumber}!`);
        setSingleNumber('');
        setSingleMessage('');
      } else {
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError(`Erro ao enviar mensagem:\n\n${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const sendBulkMessages = async () => {
    const numbers = bulkNumbers.split('\n').filter(n => n.trim());
    
    if (numbers.length === 0 || !bulkMessage.trim()) {
      setError('Preencha a lista de números e a mensagem');
      return;
    }

    if (numbers.length > 50) {
      setError('Máximo de 50 números por envio em massa');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');
    
    try {
      const cleanNumbers = numbers.map(n => n.replace(/\D/g, ''));
      
      const response = await fetch('/api/whatsapp/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: cleanNumbers,
          message: bulkMessage,
          delay: bulkDelay
        })
      });
      
      const bulkResults = await response.json();
      
      if (response.ok) {
        setLastResults(bulkResults);
        setShowResults(true);
        setActiveTab('resultados');
        setSuccess(`Envio concluído: ${bulkResults.sucessos} sucessos, ${bulkResults.falhas} falhas`);
        setBulkNumbers('');
        setBulkMessage('');
      } else {
        throw new Error(bulkResults.error || 'Erro no envio em massa');
      }
    } catch (error) {
      console.error('Erro no envio em massa:', error);
      setError(`Erro no envio em massa:\n\n${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const validateNumber = async (number: string) => {
    try {
      // Validação local do número brasileiro
      const cleanNumber = number.replace(/\D/g, '');
      
      // Verificar se é um número brasileiro válido
      if (cleanNumber.length < 10 || cleanNumber.length > 13) {
        return { 
          success: true, 
          valid: false, 
          message: 'Número deve ter entre 10 e 13 dígitos',
          number 
        };
      }
      
      // Extrair DDD
      let ddd;
      if (cleanNumber.startsWith('55')) {
        ddd = cleanNumber.substring(2, 4);
      } else {
        ddd = cleanNumber.substring(0, 2);
      }
      
      const dddNum = parseInt(ddd);
      
      // Verificar se tem DDD válido (11-99)
      if (dddNum < 11 || dddNum > 99) {
        return { 
          success: true, 
          valid: false, 
          message: 'DDD inválido',
          number 
        };
      }
      
      return {
        success: true,
        valid: true,
        message: 'Número com formato válido',
        number,
        formattedNumber: cleanNumber,
        provider: 'Z-API'
      };
    } catch (error) {
      console.error('Erro ao validar número:', error);
      return { success: false, valid: false, message: 'Erro ao validar número' };
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'connecting':
      case 'qr_code':
        return 'text-yellow-600 bg-yellow-100';
      case 'disconnected':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'connecting':
      case 'qr_code':
        return <Clock className="h-4 w-4" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = () => {
    switch (status.status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'qr_code':
        return 'Aguardando QR Code';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              📱 WhatsApp Business
            </h1>
            <p className="text-gray-600 text-lg font-medium">Comunicação direta com WhatsApp Web</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={checkApiStatus}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Status</span>
          </button>
        </div>
      </div>

      {/* Status da Conexão */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Wifi className="h-6 w-6 mr-3 text-blue-600" />
            Status da Conexão WhatsApp Web
          </h2>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor()}`}>
              {getStatusIcon()}
              <span>{getStatusLabel()}</span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(status.timestamp).toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações da Conexão */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Plataforma:</span>
              <span className="text-sm text-gray-900 font-semibold">Z-API</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Método:</span>
              <span className="text-sm text-gray-900 font-semibold">API REST</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Instância:</span>
              <span className="text-sm text-gray-900 font-semibold">3E77C41E...920B85</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            {status.connected ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-green-800">Z-API Conectado!</p>
                <p className="text-sm text-green-600">Pronto para enviar mensagens</p>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Z-API Desconectado</p>
                <p className="text-sm text-gray-500">Clique em "Conectar" para verificar status</p>
              </div>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-6 flex justify-center space-x-4">
          {!status.connected ? (
            <button
              onClick={connectWhatsApp}
              disabled={connecting}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg"
            >
              <Power className="h-5 w-5" />
              <span>{connecting ? 'Conectando...' : 'Conectar Z-API'}</span>
            </button>
          ) : (
            <button
              onClick={disconnectWhatsApp}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <PowerOff className="h-5 w-5" />
              <span>{loading ? 'Desconectando...' : 'Desconectar'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mensagens de Feedback */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2 text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Erro</p>
              <p className="text-sm whitespace-pre-wrap">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Tabs de Envio */}
      {status.connected && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('individual')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'individual'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Envio Individual</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('massa')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'massa'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Envio em Massa</span>
                </div>
              </button>
              {lastResults && (
                <button
                  onClick={() => setActiveTab('resultados')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'resultados'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Resultados</span>
                  </div>
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Aba Envio Individual */}
            {activeTab === 'individual' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">📱 Envio Individual</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={singleNumber}
                      onChange={(e) => setSingleNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: (11) 99999-9999 ou 11999999999
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem
                    </label>
                    <textarea
                      value={singleMessage}
                      onChange={(e) => setSingleMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Digite sua mensagem aqui..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {singleMessage.length}/1000 caracteres
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={sendSingleMessage}
                    disabled={sending || !singleNumber.trim() || !singleMessage.trim()}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <Send className="h-5 w-5" />
                    <span>{sending ? 'Enviando...' : 'Enviar Mensagem'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Aba Envio em Massa */}
            {activeTab === 'massa' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">📢 Envio em Massa</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lista de Números (um por linha)
                    </label>
                    <textarea
                      value={bulkNumbers}
                      onChange={(e) => setBulkNumbers(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(11) 99999-9999&#10;(11) 88888-8888&#10;(11) 77777-7777"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bulkNumbers.split('\n').filter(n => n.trim()).length} números • Máximo: 50
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem
                      </label>
                      <textarea
                        value={bulkMessage}
                        onChange={(e) => setBulkMessage(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Digite a mensagem que será enviada para todos..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {bulkMessage.length}/1000 caracteres
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intervalo entre Mensagens (ms)
                      </label>
                      <select
                        value={bulkDelay}
                        onChange={(e) => setBulkDelay(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value={3000}>3 segundos (Rápido)</option>
                        <option value={5000}>5 segundos (Recomendado)</option>
                        <option value={8000}>8 segundos (Seguro)</option>
                        <option value={10000}>10 segundos (Muito Seguro)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Tempo estimado: {Math.ceil((bulkNumbers.split('\n').filter(n => n.trim()).length * bulkDelay) / 1000)}s
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={sendBulkMessages}
                    disabled={sending || bulkNumbers.split('\n').filter(n => n.trim()).length === 0 || !bulkMessage.trim()}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <Users className="h-5 w-5" />
                    <span>
                      {sending 
                        ? 'Enviando em Massa...' 
                        : `Enviar para ${bulkNumbers.split('\n').filter(n => n.trim()).length} Números`
                      }
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Aba Resultados */}
            {activeTab === 'resultados' && lastResults && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">📊 Resultados do Envio em Massa</h3>
                  <button
                    onClick={() => {
                      const csvContent = [
                        'Número,Status,Mensagem',
                        ...lastResults.results.map(r => 
                          `"${r.number}","${r.success ? 'Sucesso' : 'Erro'}","${r.message || r.error || ''}"`
                        )
                      ].join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `whatsapp_results_${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Exportar CSV</span>
                  </button>
                </div>

                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total</p>
                        <p className="text-2xl font-bold text-blue-900">{lastResults.total}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Sucessos</p>
                        <p className="text-2xl font-bold text-green-900">{lastResults.sucessos}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Falhas</p>
                        <p className="text-2xl font-bold text-red-900">{lastResults.falhas}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Taxa de Sucesso</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {((lastResults.sucessos / lastResults.total) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Lista Detalhada */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Detalhes por Número</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {lastResults.results.map((result, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium text-gray-900">{result.number}</span>
                        </div>
                        <span className={`text-sm ${
                          result.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {result.success ? 'Enviado' : result.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <Monitor className="h-5 w-5 mr-2" />
          📋 Como Usar o Z-API
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">🔗 Primeira Conexão:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Clique em "Conectar Z-API"</li>
              <li>Sistema verifica status da instância</li>
              <li>Certifique-se que o WhatsApp está conectado na instância Z-API</li>
              <li>Aguarde a confirmação de conexão</li>
              <li>Pronto! Agora pode enviar mensagens</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">📱 Envio de Mensagens:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Teste primeiro com envio individual</li>
              <li>Use envio em massa para comunicados</li>
              <li>Respeite o intervalo entre mensagens</li>
              <li>Máximo de 50 números por vez</li>
              <li>Monitore os resultados na aba "Resultados"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Avisos Importantes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-900">⚠️ Avisos Importantes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">🚨 Limitações do Z-API:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Não envie spam ou mensagens não solicitadas</li>
              <li>• Respeite os limites de envio da plataforma</li>
              <li>• Use intervalos adequados entre mensagens</li>
              <li>• Instância pode ser suspensa por uso inadequado</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">💡 Boas Práticas:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Teste sempre com poucos números primeiro</li>
              <li>• Use mensagens personalizadas e relevantes</li>
              <li>• Mantenha a instância Z-API ativa durante o envio</li>
              <li>• Monitore os resultados e ajuste conforme necessário</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}