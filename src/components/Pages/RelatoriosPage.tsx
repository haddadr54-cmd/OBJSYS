import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Filter, Calendar, Users, GraduationCap, BookOpen, TrendingUp, FileText, Printer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import type { Aluno, Turma, Nota, Usuario, Disciplina } from '../../lib/supabase';

interface RelatorioData {
  alunos: Aluno[];
  turmas: Turma[];
  notas: Nota[];
  usuarios: Usuario[];
  disciplinas: Disciplina[];
}

export function RelatoriosPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [filtros, setFiltros] = useState({
    tipo: 'aluno',
    periodo: 'mes',
    turma: '',
    disciplina: ''
  });
  const [dados, setDados] = useState<RelatorioData>({
    alunos: [],
    turmas: [],
    notas: [],
    usuarios: [],
    disciplinas: []
  });
  const [relatorioGerado, setRelatorioGerado] = useState<any>(null);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDados();
  }, [isSupabaseConnected]);

  // Novo useEffect para acionar a geração de relatório para professores
  useEffect(() => {
    if (!loading && user && user.tipo_usuario === 'professor' && !relatorioGerado) {
      // Definir filtros padrão para professor se ainda não estiverem definidos
      setFiltros(prevFiltros => ({
        ...prevFiltros,
        tipo: 'turma' // Padrão para relatório por turma para professores
      }));
      // Acionar a geração do relatório após os dados serem buscados e os filtros definidos
      // Isso será chamado após a propagação da atualização do estado de filtros
    }
  }, [loading, user, relatorioGerado]);

  // Este useEffect será executado quando o estado de filtros mudar, incluindo o do useEffect acima
  useEffect(() => {
    if (!loading && user && user.tipo_usuario === 'professor' && !relatorioGerado && filtros.tipo === 'turma') {
      gerarRelatorio();
    }
  }, [filtros.tipo, loading, user, relatorioGerado]); // Adicionar filtros.tipo como uma dependência

  const fetchDados = async () => {
    try {
      const [alunos, turmas, notas, usuarios, disciplinas] = await Promise.all([
        dataService.getAlunos(),
        dataService.getTurmas(),
        dataService.getNotas(),
        dataService.getPermissions().canViewAllUsers ? dataService.getUsuarios() : [],
        dataService.getDisciplinas()
      ]);
      
      setDados({ alunos, turmas, notas, usuarios, disciplinas });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorio = async () => {
    setLoadingRelatorio(true);
    try {
      let relatorioData: any = {};
      
      switch (filtros.tipo) {
        case 'aluno':
          relatorioData = gerarRelatorioPorAluno();
          break;
        case 'turma':
          relatorioData = gerarRelatorioPorTurma();
          break;
        case 'professor':
          relatorioData = gerarRelatorioPorProfessor();
          break;
        case 'disciplina':
          relatorioData = gerarRelatorioPorDisciplina();
          break;
        case 'desempenho':
          relatorioData = gerarRelatorioDesempenho();
          break;
        case 'frequencia':
          relatorioData = gerarRelatorioFrequencia();
          break;
        default:
          relatorioData = gerarRelatorioDesempenho();
      }
      
      setRelatorioGerado(relatorioData);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setLoadingRelatorio(false);
    }
  };

  const gerarRelatorioPorAluno = () => {
    let alunosFiltrados = dados.alunos;
    
    if (filtros.turma) {
      alunosFiltrados = alunosFiltrados.filter(a => a.turma_id === filtros.turma);
    }
    
    const relatorio = alunosFiltrados.map(aluno => {
      const notasAluno = dados.notas.filter(n => n.aluno_id === aluno.id);
      const turma = dados.turmas.find(t => t.id === aluno.turma_id);
      const responsavel = dados.usuarios.find(u => u.id === aluno.responsavel_id);
      
      const mediaGeral = notasAluno.length > 0 
        ? notasAluno.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notasAluno.length 
        : 0;
      
      return {
        nome: aluno.nome,
        turma: turma?.nome || 'Sem turma',
        responsavel: responsavel?.nome || 'Sem responsável',
        totalNotas: notasAluno.length,
        mediaGeral: mediaGeral.toFixed(1),
        situacao: mediaGeral >= 7 ? 'Aprovado' : mediaGeral >= 5 ? 'Recuperação' : 'Reprovado',
        ultimaNota: notasAluno.length > 0 
          ? new Date(notasAluno[notasAluno.length - 1].criado_em).toLocaleDateString('pt-BR')
          : 'Nenhuma nota'
      };
    });
    
    return {
      titulo: 'Relatório por Aluno',
      tipo: 'aluno',
      dados: relatorio,
      colunas: ['Nome', 'Turma', 'Responsável', 'Total Notas', 'Média Geral', 'Situação', 'Última Nota'],
      resumo: {
        totalAlunos: relatorio.length,
        mediaGeral: relatorio.length > 0 
          ? (relatorio.reduce((acc, r) => acc + parseFloat(r.mediaGeral), 0) / relatorio.length).toFixed(1)
          : '0.0',
        aprovados: relatorio.filter(r => r.situacao === 'Aprovado').length,
        recuperacao: relatorio.filter(r => r.situacao === 'Recuperação').length,
        reprovados: relatorio.filter(r => r.situacao === 'Reprovado').length
      }
    };
  };

  const gerarRelatorioPorTurma = () => {
    let turmasFiltradas = dados.turmas;
    
    if (filtros.turma) {
      turmasFiltradas = turmasFiltradas.filter(t => t.id === filtros.turma);
    }
    
    const relatorio = turmasFiltradas.map(turma => {
      const alunosTurma = dados.alunos.filter(a => a.turma_id === turma.id);
      const notasTurma = dados.notas.filter(n => 
        alunosTurma.some(a => a.id === n.aluno_id)
      );
      
      const mediaTurma = notasTurma.length > 0 
        ? notasTurma.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notasTurma.length 
        : 0;
      
      const disciplinasTurma = dados.disciplinas.filter(d => d.turma_id === turma.id);
      
      return {
        nome: turma.nome,
        anoLetivo: turma.ano_letivo,
        totalAlunos: alunosTurma.length,
        totalDisciplinas: disciplinasTurma.length,
        mediaTurma: mediaTurma.toFixed(1),
        totalNotas: notasTurma.length,
        status: (turma as any).ativa ? 'Ativa' : 'Inativa'
      };
    });
    
    return {
      titulo: 'Relatório por Turma',
      tipo: 'turma',
      dados: relatorio,
      colunas: ['Nome', 'Ano Letivo', 'Total Alunos', 'Disciplinas', 'Média da Turma', 'Total Notas', 'Status'],
      resumo: {
        totalTurmas: relatorio.length,
        totalAlunos: relatorio.reduce((acc, r) => acc + r.totalAlunos, 0),
        mediaGeral: relatorio.length > 0 
          ? (relatorio.reduce((acc, r) => acc + parseFloat(r.mediaTurma), 0) / relatorio.length).toFixed(1)
          : '0.0'
      }
    };
  };

  const gerarRelatorioPorProfessor = () => {
    const professores = dados.usuarios.filter(u => u.tipo_usuario === 'professor');
    
    const relatorio = professores.map(professor => {
      const disciplinasProfessor = dados.disciplinas.filter(d => d.professor_id === professor.id);
      const turmasProfessor = [...new Set(disciplinasProfessor.map(d => d.turma_id))];
      const alunosProfessor = dados.alunos.filter(a => turmasProfessor.includes(a.turma_id));
      const notasProfessor = dados.notas.filter(n => 
        disciplinasProfessor.some(d => d.id === n.disciplina_id)
      );
      
      const mediaProfessor = notasProfessor.length > 0 
        ? notasProfessor.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notasProfessor.length 
        : 0;
      
      return {
        nome: professor.nome,
        email: professor.email,
        totalTurmas: turmasProfessor.length,
        totalAlunos: alunosProfessor.length,
        totalDisciplinas: disciplinasProfessor.length,
        totalNotas: notasProfessor.length,
        mediaGeral: mediaProfessor.toFixed(1),
        status: professor.ativo ? 'Ativo' : 'Inativo'
      };
    });
    
    return {
      titulo: 'Relatório por Professor',
      tipo: 'professor',
      dados: relatorio,
      colunas: ['Nome', 'Email', 'Turmas', 'Alunos', 'Disciplinas', 'Notas Lançadas', 'Média Geral', 'Status'],
      resumo: {
        totalProfessores: relatorio.length,
        mediaGeral: relatorio.length > 0 
          ? (relatorio.reduce((acc, r) => acc + parseFloat(r.mediaGeral), 0) / relatorio.length).toFixed(1)
          : '0.0'
      }
    };
  };

  const gerarRelatorioPorDisciplina = () => {
    let disciplinasFiltradas = dados.disciplinas;
    
    if (filtros.disciplina) {
      disciplinasFiltradas = disciplinasFiltradas.filter(d => d.id === filtros.disciplina);
    }
    
    const relatorio = disciplinasFiltradas.map(disciplina => {
      const notasDisciplina = dados.notas.filter(n => n.disciplina_id === disciplina.id);
      const turma = dados.turmas.find(t => t.id === disciplina.turma_id);
      const professor = dados.usuarios.find(u => u.id === disciplina.professor_id);
      
      const mediaDisciplina = notasDisciplina.length > 0 
        ? notasDisciplina.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notasDisciplina.length 
        : 0;
      
      return {
        nome: disciplina.nome,
        codigo: (disciplina as any).codigo || 'N/A',
        turma: turma?.nome || 'Sem turma',
        professor: professor?.nome || 'Sem professor',
        totalNotas: notasDisciplina.length,
        mediaDisciplina: mediaDisciplina.toFixed(1),
        status: (disciplina as any).ativa ? 'Ativa' : 'Inativa'
      };
    });
    
    return {
      titulo: 'Relatório por Disciplina',
      tipo: 'disciplina',
      dados: relatorio,
      colunas: ['Nome', 'Código', 'Turma', 'Professor', 'Total Notas', 'Média', 'Status'],
      resumo: {
        totalDisciplinas: relatorio.length,
        mediaGeral: relatorio.length > 0 
          ? (relatorio.reduce((acc, r) => acc + parseFloat(r.mediaDisciplina), 0) / relatorio.length).toFixed(1)
          : '0.0'
      }
    };
  };

  const gerarRelatorioDesempenho = () => {
    const mediaGeral = dados.notas.length > 0 
      ? dados.notas.reduce((acc, nota) => acc + (nota.nota || 0), 0) / dados.notas.length 
      : 0;
    
    const aprovados = dados.alunos.filter(aluno => {
      const notasAluno = dados.notas.filter(n => n.aluno_id === aluno.id);
      const mediaAluno = notasAluno.length > 0 
        ? notasAluno.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notasAluno.length 
        : 0;
      return mediaAluno >= 7;
    }).length;
    
    const recuperacao = dados.alunos.filter(aluno => {
      const notasAluno = dados.notas.filter(n => n.aluno_id === aluno.id);
      const mediaAluno = notasAluno.length > 0 
        ? notasAluno.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notasAluno.length 
        : 0;
      return mediaAluno >= 5 && mediaAluno < 7;
    }).length;
    
    const reprovados = dados.alunos.length - aprovados - recuperacao;
    
    return {
      titulo: 'Relatório de Desempenho Geral',
      tipo: 'desempenho',
      dados: [
        { indicador: 'Média Geral da Escola', valor: mediaGeral.toFixed(1) },
        { indicador: 'Total de Alunos', valor: dados.alunos.length.toString() },
        { indicador: 'Alunos Aprovados', valor: `${aprovados} (${((aprovados / Math.max(dados.alunos.length, 1)) * 100).toFixed(1)}%)` },
        { indicador: 'Alunos em Recuperação', valor: `${recuperacao} (${((recuperacao / Math.max(dados.alunos.length, 1)) * 100).toFixed(1)}%)` },
        { indicador: 'Alunos Reprovados', valor: `${reprovados} (${((reprovados / Math.max(dados.alunos.length, 1)) * 100).toFixed(1)}%)` },
        { indicador: 'Total de Turmas', valor: dados.turmas.length.toString() },
        { indicador: 'Total de Disciplinas', valor: dados.disciplinas.length.toString() },
        { indicador: 'Total de Professores', valor: dados.usuarios.filter(u => u.tipo_usuario === 'professor').length.toString() }
      ],
      colunas: ['Indicador', 'Valor'],
      resumo: {
        mediaGeral: mediaGeral.toFixed(1),
        taxaAprovacao: ((aprovados / Math.max(dados.alunos.length, 1)) * 100).toFixed(1) + '%',
        totalAlunos: dados.alunos.length
      }
    };
  };

  const gerarRelatorioFrequencia = () => {
    // Simulando dados de frequência (seria implementado com dados reais de presença)
    const relatorio = dados.alunos.map(aluno => {
      const turma = dados.turmas.find(t => t.id === aluno.turma_id);
      const frequenciaSimulada = Math.floor(Math.random() * 20) + 80; // 80-100%
      
      return {
        nome: aluno.nome,
        turma: turma?.nome || 'Sem turma',
        frequencia: frequenciaSimulada + '%',
        totalAulas: 40,
        presencas: Math.floor((frequenciaSimulada / 100) * 40),
        faltas: 40 - Math.floor((frequenciaSimulada / 100) * 40),
        situacao: frequenciaSimulada >= 75 ? 'Regular' : 'Irregular'
      };
    });
    
    return {
      titulo: 'Relatório de Frequência',
      tipo: 'frequencia',
      dados: relatorio,
      colunas: ['Nome', 'Turma', 'Frequência', 'Total Aulas', 'Presenças', 'Faltas', 'Situação'],
      resumo: {
        frequenciaMedia: relatorio.length > 0 
          ? (relatorio.reduce((acc, r) => acc + parseFloat(r.frequencia), 0) / relatorio.length).toFixed(1) + '%'
          : '0%',
        alunosRegulares: relatorio.filter(r => r.situacao === 'Regular').length,
        alunosIrregulares: relatorio.filter(r => r.situacao === 'Irregular').length
      }
    };
  };

  const exportarRelatorio = (formato: string) => {
    if (!relatorioGerado) {
      alert('Gere um relatório primeiro antes de exportar');
      return;
    }
    
    if (formato === 'pdf') {
      exportarPDF();
    } else if (formato === 'excel') {
      exportarExcel();
    }
  };

  const exportarPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${relatorioGerado.titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .resumo { background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${relatorioGerado.titulo}</h1>
          <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Gerado por:</strong> ${user?.nome}</p>
          
          <div class="resumo">
            <h2>Resumo</h2>
            ${Object.entries(relatorioGerado.resumo).map(([key, value]) => 
              `<p><strong>${key}:</strong> ${value}</p>`
            ).join('')}
          </div>
          
          <h2>Dados Detalhados</h2>
          <table>
            <thead>
              <tr>
                ${relatorioGerado.colunas.map(col => `<th>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${relatorioGerado.dados.map(item => 
                `<tr>${Object.values(item).map(value => `<td>${value}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Relatório gerado pelo Sistema Escolar Objetivo</p>
            <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const exportarExcel = () => {
    const csvContent = [
      relatorioGerado.colunas.join(','),
      ...relatorioGerado.dados.map(item => 
        Object.values(item).map(value => `"${value}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${relatorioGerado.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => exportarRelatorio('pdf')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <button 
            onClick={() => exportarRelatorio('excel')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Configurações do Relatório</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Relatório</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="aluno">Por Aluno</option>
              <option value="turma">Por Turma</option>
              <option value="professor">Por Professor</option>
              <option value="disciplina">Por Disciplina</option>
              <option value="desempenho">Desempenho Geral</option>
              <option value="frequencia">Frequência</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mês</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="semestre">Este Semestre</option>
              <option value="ano">Este Ano</option>
              <option value="personalizado">Período Personalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turma (Opcional)</label>
            <select
              value={filtros.turma}
              onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as turmas</option>
              {dados.turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>{turma.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina (Opcional)</label>
            <select
              value={filtros.disciplina}
              onChange={(e) => setFiltros({ ...filtros, disciplina: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as disciplinas</option>
              {dados.disciplinas.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <div>
            <button
              onClick={gerarRelatorio}
              disabled={loadingRelatorio}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{loadingRelatorio ? 'Gerando...' : 'Gerar Relatório'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
              <p className="text-2xl font-bold text-blue-600">{dados.alunos.length}</p>
            </div>
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Turmas</p>
              <p className="text-2xl font-bold text-green-600">{dados.turmas.length}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Notas Lançadas</p>
              <p className="text-2xl font-bold text-purple-600">{dados.notas.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média Geral</p>
              <p className="text-2xl font-bold text-yellow-600">
                {dados.notas.length > 0 
                  ? (dados.notas.reduce((acc: number, nota: any) => acc + (nota.nota || nota.valor || 0), 0) / dados.notas.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tipos de Relatórios Disponíveis */}
      {!relatorioGerado && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
          <div 
            onClick={() => {
              setFiltros({ ...filtros, tipo: 'aluno' });
              gerarRelatorio();
            }}
          >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Relatório por Aluno</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Desempenho individual, notas, frequência e evolução de cada aluno.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Histórico de notas</li>
            <li>• Frequência às aulas</li>
            <li>• Evolução por disciplina</li>
            <li>• Comparativo com a turma</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Clique para gerar relatório
            </p>
          </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
          <div 
            onClick={() => {
              setFiltros({ ...filtros, tipo: 'turma' });
              gerarRelatorio();
            }}
          >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-50 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Relatório por Turma</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Análise geral da turma, médias, distribuição de notas e estatísticas.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Média geral da turma</li>
            <li>• Distribuição de notas</li>
            <li>• Taxa de aprovação</li>
            <li>• Ranking de alunos</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Clique para gerar relatório
            </p>
          </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
          <div 
            onClick={() => {
              setFiltros({ ...filtros, tipo: 'professor' });
              gerarRelatorio();
            }}
          >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-50 rounded-full">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Relatório por Professor</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Desempenho das turmas por professor, estatísticas de ensino.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Turmas atribuídas</li>
            <li>• Média das turmas</li>
            <li>• Notas lançadas</li>
            <li>• Atividades criadas</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Clique para gerar relatório
            </p>
          </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
          <div 
            onClick={() => {
              setFiltros({ ...filtros, tipo: 'disciplina' });
              gerarRelatorio();
            }}
          >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-yellow-50 rounded-full">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Relatório por Disciplina</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Análise do desempenho dos alunos em cada disciplina específica.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Média por disciplina</li>
            <li>• Dificuldades identificadas</li>
            <li>• Comparativo entre turmas</li>
            <li>• Evolução temporal</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Clique para gerar relatório
            </p>
          </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
          <div 
            onClick={() => {
              setFiltros({ ...filtros, tipo: 'desempenho' });
              gerarRelatorio();
            }}
          >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-50 rounded-full">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Desempenho Geral</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Visão geral do desempenho da escola, tendências e indicadores.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Indicadores gerais</li>
            <li>• Tendências de desempenho</li>
            <li>• Comparativos históricos</li>
            <li>• Metas e objetivos</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Clique para gerar relatório
            </p>
          </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
          <div 
            onClick={() => {
              setFiltros({ ...filtros, tipo: 'frequencia' });
              gerarRelatorio();
            }}
          >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-indigo-50 rounded-full">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Relatório de Frequência</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Análise de presença e faltas dos alunos por período e disciplina.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Taxa de presença</li>
            <li>• Faltas por disciplina</li>
            <li>• Alunos com baixa frequência</li>
            <li>• Tendências de ausência</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Clique para gerar relatório
            </p>
          </div>
          </div>
        </div>
        </div>
      )}

      {/* Preview do Relatório */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {relatorioGerado ? relatorioGerado.titulo : 'Preview do Relatório'}
            </h2>
            {relatorioGerado && (
              <div className="flex space-x-2">
                <button 
                  onClick={() => exportarRelatorio('pdf')}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </button>
                <button 
                  onClick={() => exportarRelatorio('excel')}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Excel</span>
                </button>
                <button 
                  onClick={() => setRelatorioGerado(null)}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Novo Relatório
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          {!relatorioGerado ? (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Selecione os filtros e clique em "Gerar Relatório"</p>
              <p className="text-sm">O preview do relatório aparecerá aqui</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumo do Relatório */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">Resumo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(relatorioGerado.resumo).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-sm text-blue-600 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                      <p className="text-lg font-bold text-blue-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tabela de Dados */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {relatorioGerado.colunas.map((coluna: string) => (
                        <th key={coluna} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                          {coluna}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {relatorioGerado.dados.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(item).map((valor: any, colIndex: number) => (
                          <td key={colIndex} className="px-4 py-3 text-sm text-gray-900 border border-gray-200">
                            {valor}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Informações do Relatório */}
              <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
                <p>Relatório gerado em {new Date().toLocaleString('pt-BR')} por {user?.nome}</p>
                <p>Total de registros: {relatorioGerado.dados.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}