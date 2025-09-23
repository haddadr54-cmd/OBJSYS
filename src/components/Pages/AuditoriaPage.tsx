import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Activity, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Database,
  Users,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'error' | 'warning';
  category: 'auth' | 'crud' | 'system' | 'security';
}

interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  successRate: number;
  errorCount: number;
  uniqueUsers: number;
  topActions: { action: string; count: number }[];
}

export function AuditoriaPage() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      user: 'Carlos Oliveira',
      action: 'LOGIN',
      resource: 'Sistema',
      details: 'Login realizado com sucesso',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      category: 'auth'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      user: 'Maria Santos',
      action: 'CREATE_STUDENT',
      resource: 'Alunos',
      details: 'Novo aluno cadastrado: João Silva',
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      status: 'success',
      category: 'crud'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: 'João Silva',
      action: 'FAILED_LOGIN',
      resource: 'Sistema',
      details: 'Tentativa de login com credenciais inválidas',
      ip: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
      status: 'error',
      category: 'security'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      user: 'Sistema',
      action: 'AUTO_BACKUP',
      resource: 'Banco de Dados',
      details: 'Backup automático executado com sucesso',
      ip: 'localhost',
      userAgent: 'Sistema Interno',
      status: 'success',
      category: 'system'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      user: 'Ana Costa',
      action: 'UPDATE_GRADE',
      resource: 'Notas',
      details: 'Nota atualizada para aluno Pedro Santos - Matemática: 8.5',
      ip: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success',
      category: 'crud'
    }
  ]);
  
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    status: '',
    usuario: '',
    periodo: 'hoje'
  });
  
  const [stats, setStats] = useState<AuditStats>({
    totalLogs: 0,
    todayLogs: 0,
    successRate: 0,
    errorCount: 0,
    uniqueUsers: 0,
    topActions: []
  });

  useEffect(() => {
    calculateStats();
  }, [logs]);

  const calculateStats = () => {
    const hoje = new Date().toDateString();
    const logsHoje = logs.filter(log => new Date(log.timestamp).toDateString() === hoje);
    const sucessos = logs.filter(log => log.status === 'success').length;
    const erros = logs.filter(log => log.status === 'error').length;
    const usuariosUnicos = new Set(logs.map(log => log.user)).size;
    
    // Contar ações mais frequentes
    const actionCounts: { [key: string]: number } = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    
    const topActions = Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));

    setStats({
      totalLogs: logs.length,
      todayLogs: logsHoje.length,
      successRate: logs.length > 0 ? (sucessos / logs.length) * 100 : 0,
      errorCount: erros,
      uniqueUsers: usuariosUnicos,
      topActions
    });
  };

  const logsFiltrados = logs.filter(log => {
    const matchBusca = !filtros.busca || 
      log.user.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      log.action.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      log.details.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchCategoria = !filtros.categoria || log.category === filtros.categoria;
    const matchStatus = !filtros.status || log.status === filtros.status;
    const matchUsuario = !filtros.usuario || log.user === filtros.usuario;
    
    let matchPeriodo = true;
    if (filtros.periodo !== 'todos') {
      const logDate = new Date(log.timestamp);
      const hoje = new Date();
      
      if (filtros.periodo === 'hoje') {
        matchPeriodo = logDate.toDateString() === hoje.toDateString();
      } else if (filtros.periodo === 'semana') {
        const semanaAtras = new Date();
        semanaAtras.setDate(hoje.getDate() - 7);
        matchPeriodo = logDate >= semanaAtras;
      } else if (filtros.periodo === 'mes') {
        const mesAtras = new Date();
        mesAtras.setMonth(hoje.getMonth() - 1);
        matchPeriodo = logDate >= mesAtras;
      }
    }
    
    return matchBusca && matchCategoria && matchStatus && matchUsuario && matchPeriodo;
  });

  const exportLogs = () => {
    const csvContent = [
      'Data,Usuário,Ação,Recurso,Detalhes,IP,Status,Categoria',
      ...logsFiltrados.map(log => 
        `"${new Date(log.timestamp).toLocaleString('pt-BR')}","${log.user}","${log.action}","${log.resource}","${log.details}","${log.ip}","${log.status}","${log.category}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <LogIn className="h-4 w-4" />;
      case 'crud':
        return <Edit className="h-4 w-4" />;
      case 'system':
        return <Database className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'auth':
        return 'Autenticação';
      case 'crud':
        return 'Dados';
      case 'system':
        return 'Sistema';
      case 'security':
        return 'Segurança';
      default:
        return category;
    }
  };

  const getActionLabel = (action: string) => {
    const actionLabels: { [key: string]: string } = {
      'LOGIN': 'Login',
      'LOGOUT': 'Logout',
      'FAILED_LOGIN': 'Login Falhado',
      'CREATE_STUDENT': 'Criar Aluno',
      'UPDATE_STUDENT': 'Atualizar Aluno',
      'DELETE_STUDENT': 'Excluir Aluno',
      'CREATE_USER': 'Criar Usuário',
      'UPDATE_USER': 'Atualizar Usuário',
      'DELETE_USER': 'Excluir Usuário',
      'CREATE_GRADE': 'Criar Nota',
      'UPDATE_GRADE': 'Atualizar Nota',
      'AUTO_BACKUP': 'Backup Automático',
      'MANUAL_BACKUP': 'Backup Manual',
      'SYSTEM_UPDATE': 'Atualização do Sistema'
    };
    
    return actionLabels[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              📊 Auditoria e Logs
            </h1>
            <p className="text-gray-600 text-lg font-medium">Monitoramento e análise de atividades</p>
          </div>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Exportar Logs</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-blue-600 uppercase tracking-wide">📊 Total</p>
              <p className="text-3xl font-black text-blue-700">{stats.totalLogs}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-green-600 uppercase tracking-wide">📅 Hoje</p>
              <p className="text-3xl font-black text-green-700">{stats.todayLogs}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-purple-600 uppercase tracking-wide">✅ Taxa</p>
              <p className="text-3xl font-black text-purple-700">{stats.successRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl border-2 border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-red-600 uppercase tracking-wide">❌ Erros</p>
              <p className="text-3xl font-black text-red-700">{stats.errorCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg">
              <XCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-xl border-2 border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-yellow-600 uppercase tracking-wide">👥 Usuários</p>
              <p className="text-3xl font-black text-yellow-700">{stats.uniqueUsers}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros de Auditoria</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar logs..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filtros.categoria}
            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            <option value="auth">Autenticação</option>
            <option value="crud">Dados</option>
            <option value="system">Sistema</option>
            <option value="security">Segurança</option>
          </select>
          
          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="success">Sucesso</option>
            <option value="error">Erro</option>
            <option value="warning">Aviso</option>
          </select>
          
          <select
            value={filtros.usuario}
            onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os usuários</option>
            {[...new Set(logs.map(log => log.user))].map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          
          <select
            value={filtros.periodo}
            onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
            <option value="todos">Todos</option>
          </select>
        </div>
      </div>

      {/* Ações Mais Frequentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Ações Mais Frequentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.topActions.map((item, index) => (
            <div key={item.action} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{item.count}</div>
              <div className="text-sm text-gray-700">{getActionLabel(item.action)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Logs de Auditoria ({logsFiltrados.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhum log encontrado com os filtros aplicados
                  </td>
                </tr>
              ) : (
                logsFiltrados.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3">
                          {log.user.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-gray-100 rounded">
                          {getCategoryIcon(log.category)}
                        </div>
                        <span className="text-sm text-gray-900">{getActionLabel(log.action)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        <span className="font-medium">
                          {log.status === 'success' ? 'Sucesso' :
                           log.status === 'error' ? 'Erro' : 'Aviso'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => alert(`Detalhes:\n\n${log.details}\n\nUser Agent: ${log.userAgent}`)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas de Segurança */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">🚨 Alertas de Segurança</h3>
        </div>
        <div className="space-y-3">
          {logs.filter(log => log.status === 'error' && log.category === 'security').length > 0 ? (
            logs.filter(log => log.status === 'error' && log.category === 'security').slice(0, 3).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-900">{log.details}</p>
                    <p className="text-xs text-red-700">
                      {log.user} - {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-red-600 font-medium">IP: {log.ip}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-700 font-medium">Nenhum alerta de segurança</p>
              <p className="text-sm text-green-600">Sistema funcionando normalmente</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumo por Categoria */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Resumo por Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['auth', 'crud', 'system', 'security'].map(category => {
            const categoryLogs = logs.filter(log => log.category === category);
            const successCount = categoryLogs.filter(log => log.status === 'success').length;
            const errorCount = categoryLogs.filter(log => log.status === 'error').length;
            
            return (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {getCategoryIcon(category)}
                  <span className="ml-2 font-medium text-gray-900">{getCategoryLabel(category)}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{categoryLogs.length}</div>
                <div className="text-xs text-gray-600">
                  {successCount} sucessos, {errorCount} erros
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}