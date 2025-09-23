import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Trash2,
  Save,
  Eye,
  Copy,
  Share,
  Archive,
  HardDrive,
  Cloud,
  Shield,
  Clock,
  Users,
  BookOpen,
  GraduationCap,
  School,
  BarChart3
} from 'lucide-react';

interface DataStats {
  usuarios: number;
  alunos: number;
  turmas: number;
  disciplinas: number;
  notas: number;
  recados: number;
  materiais: number;
  presencas: number;
}

export function DadosImportExportPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'backup' | 'stats'>('export');
  const [selectedTables, setSelectedTables] = useState<string[]>(['usuarios', 'alunos', 'turmas']);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'sql'>('json');
  
  const [dataStats] = useState<DataStats>({
    usuarios: 15,
    alunos: 120,
    turmas: 8,
    disciplinas: 25,
    notas: 450,
    recados: 35,
    materiais: 80,
    presencas: 1200
  });

  const availableTables = [
    { id: 'usuarios', label: 'Usuários', icon: Users, count: dataStats.usuarios },
    { id: 'alunos', label: 'Alunos', icon: GraduationCap, count: dataStats.alunos },
    { id: 'turmas', label: 'Turmas', icon: School, count: dataStats.turmas },
    { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen, count: dataStats.disciplinas },
    { id: 'notas', label: 'Notas', icon: FileText, count: dataStats.notas },
    { id: 'recados', label: 'Recados', icon: FileText, count: dataStats.recados },
    { id: 'materiais', label: 'Materiais', icon: Archive, count: dataStats.materiais },
    { id: 'presencas', label: 'Presenças', icon: CheckCircle, count: dataStats.presencas }
  ];

  const handleExport = async () => {
    if (selectedTables.length === 0) {
      setError('Selecione pelo menos uma tabela para exportar');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simular processo de exportação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Criar dados simulados para exportação
      const exportData: any = {};
      
      selectedTables.forEach(table => {
        switch (table) {
          case 'usuarios':
            exportData.usuarios = [
              { id: '1', nome: 'Carlos Admin', email: 'admin@escola.com', tipo: 'admin' },
              { id: '2', nome: 'Maria Professor', email: 'prof@escola.com', tipo: 'professor' },
              { id: '3', nome: 'João Pai', email: 'pai@escola.com', tipo: 'pai' }
            ];
            break;
          case 'alunos':
            exportData.alunos = [
              { id: '1', nome: 'Ana Silva', turma_id: 'turma-1', responsavel_id: 'user-3' },
              { id: '2', nome: 'Pedro Santos', turma_id: 'turma-1', responsavel_id: 'user-3' }
            ];
            break;
          case 'turmas':
            exportData.turmas = [
              { id: 'turma-1', nome: '5º Ano A', ano_letivo: '2024' },
              { id: 'turma-2', nome: '3º Ano B', ano_letivo: '2024' }
            ];
            break;
          default:
            exportData[table] = [];
        }
      });

      // Criar arquivo para download
      let content = '';
      let filename = '';
      let mimeType = '';

      switch (exportFormat) {
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          filename = `dados_escola_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        case 'csv':
          // Converter para CSV (simplificado)
          content = selectedTables.map(table => {
            const data = exportData[table] || [];
            if (data.length === 0) return `${table}:\nNenhum dado\n\n`;
            
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map((item: any) => Object.values(item).join(',')).join('\n');
            return `${table}:\n${headers}\n${rows}\n\n`;
          }).join('');
          filename = `dados_escola_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'sql':
          content = selectedTables.map(table => {
            const data = exportData[table] || [];
            return `-- Dados da tabela ${table}\n${data.map((item: any) => 
              `INSERT INTO ${table} VALUES (${Object.values(item).map(v => `'${v}'`).join(', ')});`
            ).join('\n')}\n\n`;
          }).join('');
          filename = `dados_escola_${new Date().toISOString().split('T')[0]}.sql`;
          mimeType = 'text/sql';
          break;
      }

      // Criar e baixar arquivo
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      setSuccess(`Dados exportados com sucesso! ${selectedTables.length} tabela(s) exportada(s) em formato ${exportFormat.toUpperCase()}.`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      
      // Validar formato do arquivo
      if (file.name.endsWith('.json')) {
        JSON.parse(text); // Validar JSON
      }
      
      // Simular processo de importação
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSuccess(`Arquivo ${file.name} importado com sucesso! ${Math.floor(Math.random() * 50 + 10)} registros processados.`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Erro ao importar arquivo. Verifique o formato e tente novamente.');
    } finally {
      setLoading(false);
      // Limpar input
      event.target.value = '';
    }
  };

  const toggleTableSelection = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAllTables = () => {
    setSelectedTables(availableTables.map(t => t.id));
  };

  const clearSelection = () => {
    setSelectedTables([]);
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simular criação de backup completo
      const backupData = {
        timestamp: new Date().toISOString(),
        tables: availableTables.length,
        totalRecords: Object.values(dataStats).reduce((acc, val) => acc + val, 0),
        size: '25.7 MB'
      };

      const content = JSON.stringify(backupData, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setSuccess('Backup completo criado e baixado com sucesso!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Erro ao criar backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
            <Database className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              💾 Gestão de Dados
            </h1>
            <p className="text-gray-600 text-lg font-medium">Import, Export e Backup de dados</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={createBackup}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Archive className="h-4 w-4" />
            <span>{loading ? 'Criando...' : 'Backup Completo'}</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'export', label: 'Exportar Dados', icon: Download },
              { id: 'import', label: 'Importar Dados', icon: Upload },
              { id: 'backup', label: 'Backup/Restore', icon: Archive },
              { id: 'stats', label: 'Estatísticas', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
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
          {/* Aba Export */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">📤 Exportar Dados do Sistema</h3>
              
              {/* Seleção de Formato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Formato de Exportação
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'json', label: 'JSON', desc: 'Estruturado e legível' },
                    { value: 'csv', label: 'CSV', desc: 'Para Excel/Planilhas' },
                    { value: 'sql', label: 'SQL', desc: 'Para bancos de dados' }
                  ].map(format => (
                    <button
                      key={format.value}
                      onClick={() => setExportFormat(format.value as any)}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        exportFormat === format.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{format.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Tabelas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Selecionar Tabelas para Exportar
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={selectAllTables}
                      className="text-sm text-teal-600 hover:text-teal-800"
                    >
                      Selecionar Todas
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Limpar Seleção
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {availableTables.map(table => {
                    const Icon = table.icon;
                    const isSelected = selectedTables.includes(table.id);
                    
                    return (
                      <button
                        key={table.id}
                        onClick={() => toggleTableSelection(table.id)}
                        className={`p-4 border rounded-lg text-left transition-all ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-teal-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              isSelected ? 'text-teal-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium">{table.label}</div>
                            <div className="text-sm text-gray-500">{table.count} registros</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-2 flex justify-end">
                            <CheckCircle className="h-4 w-4 text-teal-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão de Exportação */}
              <div className="flex justify-center">
                <button
                  onClick={handleExport}
                  disabled={loading || selectedTables.length === 0}
                  className="flex items-center space-x-2 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Download className="h-5 w-5" />
                  <span className="font-medium">
                    {loading ? 'Exportando...' : `Exportar ${selectedTables.length} Tabela(s)`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Aba Import */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">📥 Importar Dados</h3>
              
              {/* Área de Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 hover:bg-teal-50 transition-colors">
                <input
                  type="file"
                  accept=".json,.csv,.sql"
                  onChange={handleImport}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {loading ? 'Processando arquivo...' : 'Clique para selecionar arquivo'}
                  </h4>
                  <p className="text-gray-500">
                    Formatos suportados: JSON, CSV, SQL (máximo 50MB)
                  </p>
                </label>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-800 mb-3">📋 Instruções de Importação:</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• <strong>JSON:</strong> Estrutura de dados completa com relacionamentos</li>
                  <li>• <strong>CSV:</strong> Dados tabulares simples, uma tabela por arquivo</li>
                  <li>• <strong>SQL:</strong> Scripts de inserção direta no banco</li>
                  <li>• <strong>Validação:</strong> Dados são validados antes da importação</li>
                  <li>• <strong>Backup:</strong> Recomendamos fazer backup antes de importar</li>
                </ul>
              </div>

              {/* Histórico de Importações */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">📜 Histórico de Importações</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">usuarios_backup.json</p>
                        <p className="text-xs text-gray-500">Hoje às 14:30 - 15 registros</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Sucesso</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">alunos_2024.csv</p>
                        <p className="text-xs text-gray-500">Ontem às 09:15 - 120 registros</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Sucesso</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">💾 Backup e Restauração</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup Completo */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Archive className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-blue-900">Backup Completo</h4>
                  </div>
                  <p className="text-blue-700 mb-4">
                    Cria um backup completo de todos os dados do sistema.
                  </p>
                  <button
                    onClick={createBackup}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Archive className="h-4 w-4" />
                    <span>{loading ? 'Criando Backup...' : 'Criar Backup Agora'}</span>
                  </button>
                </div>

                {/* Restauração */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <RefreshCw className="h-5 w-5 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-orange-900">Restaurar Sistema</h4>
                  </div>
                  <p className="text-orange-700 mb-4">
                    Restaura o sistema a partir de um backup anterior.
                  </p>
                  <input
                    type="file"
                    accept=".json,.sql"
                    className="hidden"
                    id="restore-upload"
                  />
                  <label
                    htmlFor="restore-upload"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Selecionar Backup</span>
                  </label>
                </div>
              </div>

              {/* Configurações de Backup */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configurações de Backup</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequência</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                    <input
                      type="time"
                      defaultValue="02:00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retenção</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                      <option value="7">7 dias</option>
                      <option value="30">30 dias</option>
                      <option value="90">90 dias</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Estatísticas */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">📊 Estatísticas dos Dados</h3>
              
              {/* Resumo Geral */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total de Registros</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {Object.values(dataStats).reduce((acc, val) => acc + val, 0)}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Tabelas Ativas</p>
                      <p className="text-3xl font-bold text-green-900">{availableTables.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Tamanho Estimado</p>
                      <p className="text-3xl font-bold text-purple-900">25.7 MB</p>
                    </div>
                    <HardDrive className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Último Backup</p>
                      <p className="text-lg font-bold text-yellow-900">Hoje</p>
                      <p className="text-xs text-yellow-700">02:00</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Detalhes por Tabela */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Detalhes por Tabela</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tabela</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registros</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho Est.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Atualização</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {availableTables.map((table) => {
                        const Icon = table.icon;
                        return (
                          <tr key={table.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <Icon className="h-4 w-4 text-gray-600" />
                                </div>
                                <span className="font-medium text-gray-900">{table.label}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {table.count.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(table.count * 0.02).toFixed(1)} MB
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date().toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                <CheckCircle className="h-3 w-3" />
                                <span>Ativo</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alertas Importantes */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-900">⚠️ Avisos Importantes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-800">Antes de Importar:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Sempre faça backup antes de importar dados</li>
              <li>• Verifique a integridade dos arquivos</li>
              <li>• Teste em ambiente de desenvolvimento primeiro</li>
              <li>• Valide os formatos de data e campos obrigatórios</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-800">Limitações:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Tamanho máximo de arquivo: 50MB</li>
              <li>• Formatos suportados: JSON, CSV, SQL</li>
              <li>• Importação pode demorar alguns minutos</li>
              <li>• Dados duplicados serão ignorados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}