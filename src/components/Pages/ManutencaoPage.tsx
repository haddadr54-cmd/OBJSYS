import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Shield, 
  Clock, 
  HardDrive, 
  Activity,
  CheckCircle,
  XCircle,
  Info,
  Save,
  FileText,
  Settings,
  Zap,
  Monitor
} from 'lucide-react';

interface SystemStatus {
  database: 'online' | 'offline' | 'maintenance';
  storage: number; // em MB
  lastBackup: string;
  uptime: string;
  activeUsers: number;
  systemLoad: number; // em %
}

interface BackupInfo {
  id: string;
  date: string;
  size: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'failed' | 'in_progress';
}

export function ManutencaoPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'online',
    storage: 245.7,
    lastBackup: new Date().toISOString(),
    uptime: '15 dias, 8 horas',
    activeUsers: 12,
    systemLoad: 23
  });
  
  const [backups, setBackups] = useState<BackupInfo[]>([
    {
      id: '1',
      date: new Date().toISOString(),
      size: '15.2 MB',
      type: 'automatic',
      status: 'completed'
    },
    {
      id: '2',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      size: '14.8 MB',
      type: 'automatic',
      status: 'completed'
    },
    {
      id: '3',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      size: '14.5 MB',
      type: 'manual',
      status: 'completed'
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'backup' | 'limpeza' | 'configuracoes'>('status');

  const createBackup = async () => {
    setLoading(true);
    try {
      // Simular criação de backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBackup: BackupInfo = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        size: '15.5 MB',
        type: 'manual',
        status: 'completed'
      };
      
      setBackups([newBackup, ...backups]);
      setSuccess('Backup criado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao criar backup:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = (backup: BackupInfo) => {
    // Simular download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `backup_${backup.date.split('T')[0]}.sql`;
    link.click();
    setSuccess(`Download do backup de ${new Date(backup.date).toLocaleDateString('pt-BR')} iniciado!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const deleteBackup = (backupId: string) => {
    if (confirm('Tem certeza que deseja excluir este backup?')) {
      setBackups(backups.filter(b => b.id !== backupId));
      setSuccess('Backup excluído com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const clearCache = async () => {
    if (confirm('Tem certeza que deseja limpar o cache do sistema?')) {
      setLoading(true);
      try {
        // Simular limpeza de cache
        await new Promise(resolve => setTimeout(resolve, 1500));
        localStorage.clear();
        setSuccess('Cache limpo com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Erro ao limpar cache:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const optimizeDatabase = async () => {
    if (confirm('Tem certeza que deseja otimizar o banco de dados?')) {
      setLoading(true);
      try {
        // Simular otimização
        await new Promise(resolve => setTimeout(resolve, 3000));
        setSuccess('Banco de dados otimizado com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Erro ao otimizar banco:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'offline':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'offline':
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'maintenance':
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              🛠️ Manutenção do Sistema
            </h1>
            <p className="text-gray-600 text-lg font-medium">Backup, limpeza e otimização</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={createBackup}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{loading ? 'Criando...' : 'Backup Manual'}</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'status', label: 'Status do Sistema', icon: Monitor },
              { id: 'backup', label: 'Backup e Restauração', icon: Database },
              { id: 'limpeza', label: 'Limpeza e Otimização', icon: Zap },
              { id: 'configuracoes', label: 'Configurações', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Aba Status do Sistema */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Status Geral do Sistema</h3>
              
              {/* Indicadores Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Banco de Dados</p>
                      <div className={`flex items-center space-x-2 mt-2 px-3 py-1 rounded-full text-sm ${getStatusColor(systemStatus.database)}`}>
                        {getStatusIcon(systemStatus.database)}
                        <span className="font-medium capitalize">{systemStatus.database}</span>
                      </div>
                    </div>
                    <Database className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Armazenamento</p>
                      <p className="text-2xl font-bold text-blue-900">{systemStatus.storage} MB</p>
                      <p className="text-xs text-blue-700">de 1 GB usado</p>
                    </div>
                    <HardDrive className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Usuários Ativos</p>
                      <p className="text-2xl font-bold text-purple-900">{systemStatus.activeUsers}</p>
                      <p className="text-xs text-purple-700">conectados agora</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Carga do Sistema</p>
                      <p className="text-2xl font-bold text-yellow-900">{systemStatus.systemLoad}%</p>
                      <p className="text-xs text-yellow-700">CPU e memória</p>
                    </div>
                    <Monitor className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Informações Detalhadas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo Online:</span>
                      <span className="font-medium text-gray-900">{systemStatus.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Último Backup:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(systemStatus.lastBackup).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Versão do Sistema:</span>
                      <span className="font-medium text-gray-900">v2.1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ambiente:</span>
                      <span className="font-medium text-gray-900">Produção</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Saúde do Sistema</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Conectividade</span>
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Excelente</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Performance</span>
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Ótima</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Segurança</span>
                      <div className="flex items-center space-x-2 text-green-600">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Protegido</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Backup e Restauração</h3>
                <button
                  onClick={createBackup}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>{loading ? 'Criando...' : 'Criar Backup'}</span>
                </button>
              </div>

              {/* Configurações de Backup */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Configurações de Backup Automático</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Frequência</label>
                    <select className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Horário</label>
                    <input
                      type="time"
                      defaultValue="02:00"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Retenção</label>
                    <select className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="7">7 dias</option>
                      <option value="30">30 dias</option>
                      <option value="90">90 dias</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista de Backups */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Histórico de Backups</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {backups.map((backup) => (
                        <tr key={backup.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(backup.date).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {backup.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              backup.type === 'automatic' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${getStatusColor(backup.status)}`}>
                              {getStatusIcon(backup.status)}
                              <span className="font-medium">
                                {backup.status === 'completed' ? 'Concluído' :
                                 backup.status === 'failed' ? 'Falhou' : 'Em Progresso'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => downloadBackup(backup)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteBackup(backup.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Aba Limpeza */}
          {activeTab === 'limpeza' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Limpeza e Otimização</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Limpeza de Cache */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Trash2 className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Limpeza de Cache</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Remove arquivos temporários e cache do navegador para melhorar a performance.
                  </p>
                  <button
                    onClick={clearCache}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{loading ? 'Limpando...' : 'Limpar Cache'}</span>
                  </button>
                </div>

                {/* Otimização do Banco */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Database className="h-5 w-5 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Otimizar Banco</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Reorganiza e otimiza o banco de dados para melhor performance.
                  </p>
                  <button
                    onClick={optimizeDatabase}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>{loading ? 'Otimizando...' : 'Otimizar Banco'}</span>
                  </button>
                </div>
              </div>

              {/* Estatísticas de Limpeza */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas de Uso</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">2.3 MB</div>
                    <div className="text-sm text-gray-600">Cache do Sistema</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">156 MB</div>
                    <div className="text-sm text-gray-600">Dados do Usuário</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">87 MB</div>
                    <div className="text-sm text-gray-600">Arquivos Temporários</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Configurações */}
          {activeTab === 'configuracoes' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configurações de Manutenção</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Backup Automático</h4>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Habilitar backup automático</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Notificar por email</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Backup em nuvem</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Limpeza Automática</h4>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Limpeza automática de cache</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Remover logs antigos</span>
                    </label>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequência de limpeza
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ações de Emergência */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">⚠️ Ações de Emergência</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span>Reiniciar Sistema</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            <Shield className="h-4 w-4" />
            <span>Modo Manutenção</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Upload className="h-4 w-4" />
            <span>Restaurar Backup</span>
          </button>
        </div>
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Atenção:</strong> Use essas ações apenas em caso de emergência. 
            Elas podem afetar o funcionamento do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}