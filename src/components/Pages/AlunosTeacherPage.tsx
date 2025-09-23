import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, Filter, Eye, MessageSquare, BookOpen, Calendar, MessageCircle, Users, TrendingUp, Star, Zap, User, Phone, Mail, BarChart3 } from 'lucide-react';
import { LancarNotasModal } from '../Modals/LancarNotasModal';
import { EnviarRecadoModal } from '../Modals/EnviarRecadoModal';
import { VerAlunosModal } from '../Modals/VerAlunosModal';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import type { Turma, Aluno, Usuario } from '../../lib/supabase';

interface AlunosTeacherPageProps {
  onPageChange?: (page: string) => void;
}

export function AlunosTeacherPage({ onPageChange }: AlunosTeacherPageProps) {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [responsaveis, setResponsaveis] = useState<Usuario[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    turma: ''
  });
  const [loading, setLoading] = useState(true);
  const [showLancarNotasModal, setShowLancarNotasModal] = useState(false);
  const [showEnviarRecadoModal, setShowEnviarRecadoModal] = useState(false);
  const [showAlunoDetailModal, setShowAlunoDetailModal] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, isSupabaseConnected]);

  const fetchData = async () => {
    try {
      const [turmasData, alunosData, usuariosData] = await Promise.all([
        dataService.getTurmas(),
        dataService.getAlunos(),
        dataService.getPermissions().canViewAllUsers ? dataService.getUsuarios() : []
      ]);
      
      const responsaveisData = usuariosData.filter(u => u.tipo_usuario === 'pai');

      setTurmas(turmasData);
      setAlunos(alunosData);
      setResponsaveis(responsaveisData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppToResponsavel = async (aluno: Aluno) => {
    const alunoComDetalhes = getAlunoWithDetails(aluno);
    const responsavel = alunoComDetalhes.responsavel;
    
    if (!responsavel?.telefone) {
      alert('O responsável deste aluno não possui telefone cadastrado.');
      return;
    }

    const message = `Olá ${responsavel.nome}! Esta é uma mensagem do Professor ${user?.nome} sobre seu filho(a) ${aluno.nome}.`;
    
    try {
      // Formatar número para Z-API (apenas números)
      const cleanNumber = responsavel.telefone.replace(/\D/g, '');
      
      const response = await fetch('https://api.z-api.io/instances/3E77C41E18874016EF0E2676AA920B85/token/485FD874492F6CFAAC3069AD/send-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanNumber,
          message: message
        })
      });
      
      const data = await response.json();
      
      if (response.ok && !data.error) {
        alert(`✅ Mensagem enviada com sucesso para ${responsavel.nome} (responsável por ${aluno.nome})!`);
      } else {
        alert(`❌ Erro ao enviar mensagem: ${data.message || data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      alert('❌ Erro ao enviar mensagem via WhatsApp');
    }
  };

  const getAlunoWithDetails = (aluno: Aluno) => {
    const turma = turmas.find(t => t.id === aluno.turma_id);
    const responsavel = responsaveis.find(r => String(r.id) === String(aluno.responsavel_id));
    return { ...aluno, turma, responsavel };
  };

  const alunosFiltrados = alunos.filter(aluno => {
    const matchBusca = !filtros.busca || 
      aluno.nome.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchTurma = !filtros.turma || aluno.turma_id === filtros.turma;
    
    return matchBusca && matchTurma;
  });

  const enviarRecado = (aluno: Aluno) => {
    console.log('Enviar recado para:', aluno.nome);
    // Implementar envio de recado
  };

  const verNotas = (aluno: Aluno) => {
    console.log('Ver notas de:', aluno.nome);
    // Implementar visualização de notas
  };

  const verPerfilCompleto = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setShowAlunoDetailModal(true);
  };

  const marcarPresenca = (aluno: Aluno) => {
    console.log('Marcar presença de:', aluno.nome);
    // Implementar marcação de presença
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-gray-700">Carregando seus alunos...</p>
          <p className="text-lg text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Header Espetacular */}
      <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-green-200 p-6 sm:p-8 lg:p-12 animate-slide-in-up hover:shadow-2xl transition-all duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl shadow-2xl mx-auto sm:mx-0 animate-float">
              <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent animate-glow">
                🎓 Meus Alunos
              </h1>
              <p className="text-gray-700 mt-2 sm:mt-4 text-lg sm:text-xl lg:text-2xl font-bold">
                🌟 Acompanhe o desenvolvimento de cada estudante
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            <div className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl text-lg font-black shadow-xl animate-bounce-soft">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">✅ Sistema Ativo</span>
              <span className="sm:hidden">✅ Ativo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Modernos */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-gray-200 p-6 sm:p-8 animate-slide-in-up delay-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
            <Filter className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">🔍 Filtros Inteligentes</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="🔎 Buscar por nome do aluno..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            />
          </div>
          <select
            value={filtros.turma}
            onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <option value="">🏫 Todas as turmas</option>
            {turmas.map(turma => (
              <option key={turma.id} value={turma.id}>{turma.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estatísticas Espetaculares */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-blue-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-blue-600 uppercase tracking-wider">🎓 Alunos</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-blue-700 animate-glow">{alunos.length}</p>
              <p className="text-xs sm:text-sm text-blue-500 font-bold">Total</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-green-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-green-600 uppercase tracking-wider">🏫 Turmas</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-green-700 animate-glow">{turmas.length}</p>
              <p className="text-xs sm:text-sm text-green-500 font-bold">Atribuídas</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-purple-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-purple-600 uppercase tracking-wider">📊 Média</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-purple-700 animate-glow">
                {turmas.length > 0 ? Math.round(alunos.length / turmas.length) : 0}
              </p>
              <p className="text-xs sm:text-sm text-purple-500 font-bold">Por turma</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-amber-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-amber-600 uppercase tracking-wider">⭐ Status</p>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-amber-700 animate-glow">Excelente</p>
              <p className="text-xs sm:text-sm text-amber-500 font-bold">Desempenho</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de alunos espetacular */}
      {alunosFiltrados.length === 0 ? (
        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-3xl shadow-2xl border-2 border-gray-200 p-12 sm:p-16 lg:p-20 text-center animate-slide-in-up">
          <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-fit mx-auto mb-8 animate-bounce-soft">
            <GraduationCap className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-6">🎓 Nenhum aluno encontrado</h3>
          <p className="text-gray-600 text-lg sm:text-xl font-semibold">Ajuste os filtros ou verifique se há alunos nas suas turmas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {alunosFiltrados.map((aluno, index) => {
            const alunoComDetalhes = getAlunoWithDetails(aluno);
            return (
              <div 
                key={aluno.id} 
                className={`bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-green-200 hover:shadow-2xl hover:border-green-400 hover:scale-110 hover:rotate-1 transition-all duration-500 cursor-pointer group animate-scale-in`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => verPerfilCompleto(aluno)}
              >
                <div className="p-6 sm:p-8">
                  {/* Header do Aluno */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-2xl animate-float">
                        {aluno.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-green-700 transition-colors leading-tight">{aluno.nome}</h3>
                        <p className="text-sm sm:text-base text-gray-600 font-bold">🏫 {alunoComDetalhes.turma?.nome}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs sm:text-sm text-green-600 font-bold">Ativo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações do Aluno */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-green-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-gray-700">👨‍👩‍👧‍👦 Responsável</span>
                      </div>
                      <span className="text-sm sm:text-base font-black text-green-600 truncate max-w-24">
                        {alunoComDetalhes.responsavel?.nome || 'Não informado'}
                      </span>
                    </div>

                    {alunoComDetalhes.responsavel?.email && (
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="text-sm sm:text-base font-bold text-gray-700">📧 Email</span>
                        </div>
                        <span className="text-xs sm:text-sm text-blue-600 font-semibold truncate max-w-32">
                          {alunoComDetalhes.responsavel.email}
                        </span>
                      </div>
                    )}

                    {alunoComDetalhes.responsavel?.telefone && (
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Phone className="h-5 w-5 text-purple-600" />
                          </div>
                          <span className="text-sm sm:text-base font-bold text-gray-700">📱 Telefone</span>
                        </div>
                        <span className="text-sm sm:text-base text-purple-600 font-semibold">
                          {alunoComDetalhes.responsavel.telefone}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ações Rápidas Espetaculares */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLancarNotasModal(true);
                        }}
                        className="flex items-center justify-center space-x-2 p-3 sm:p-4 text-sm sm:text-base text-white bg-gradient-to-r from-blue-500 to-blue-700 border-2 border-blue-300 rounded-xl sm:rounded-2xl hover:from-blue-600 hover:to-blue-800 hover:scale-110 hover:shadow-xl transition-all duration-300 font-black"
                      >
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Notas</span>
                        <span className="sm:hidden">📝</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onPageChange) {
                            console.log('🔍 [AlunosTeacherPage] Navegando para presenca');
                            onPageChange('presenca');
                          } else {
                            console.error('❌ onPageChange não está disponível');
                          }
                        }}
                        className="flex items-center justify-center space-x-2 p-3 sm:p-4 text-sm sm:text-base text-white bg-gradient-to-r from-green-500 to-green-700 border-2 border-green-300 rounded-xl sm:rounded-2xl hover:from-green-600 hover:to-green-800 hover:scale-110 hover:shadow-xl transition-all duration-300 font-black"
                      >
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Presença</span>
                        <span className="sm:hidden">✅</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEnviarRecadoModal(true);
                        }}
                        className="flex items-center justify-center space-x-2 p-3 sm:p-4 text-sm sm:text-base text-white bg-gradient-to-r from-purple-500 to-purple-700 border-2 border-purple-300 rounded-xl sm:rounded-2xl hover:from-purple-600 hover:to-purple-800 hover:scale-110 hover:shadow-xl transition-all duration-300 font-black"
                      >
                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Recado</span>
                        <span className="sm:hidden">💌</span>
                      </button>
                      {(alunoComDetalhes.responsavel?.telefone || (aluno as any).telefone_responsavel) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            sendWhatsAppToResponsavel(aluno);
                          }}
                          className="flex items-center justify-center space-x-2 p-3 sm:p-4 text-sm sm:text-base text-white bg-gradient-to-r from-green-500 to-emerald-600 border-2 border-green-300 rounded-xl sm:rounded-2xl hover:from-green-600 hover:to-emerald-700 hover:scale-110 hover:shadow-xl transition-all duration-300 font-black"
                        >
                          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                          <span className="sm:hidden">📱</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Indicador de Clique */}
                  <div className="mt-6 pt-6 border-t-2 border-green-200 text-center">
                    <p className="text-xs sm:text-sm text-green-700 opacity-0 group-hover:opacity-100 transition-opacity font-black bg-white px-4 py-2 rounded-xl shadow-lg">
                      ✨ Clique para ver perfil completo do aluno
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ações Rápidas Globais */}
      <div className="bg-gradient-to-br from-white via-yellow-50 to-orange-50 rounded-3xl shadow-2xl border-2 border-yellow-200 p-8 sm:p-12 animate-slide-in-up delay-300">
        <div className="flex items-center space-x-6 mb-8">
          <div className="p-4 sm:p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl sm:rounded-3xl shadow-2xl animate-bounce-soft">
            <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              ⚡ Ações Rápidas
            </h2>
            <p className="text-gray-700 font-bold text-lg sm:text-xl">Acesso direto às funções mais usadas</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <button
            onClick={() => setShowLancarNotasModal(true)}
            className="p-6 sm:p-8 bg-white border-2 border-blue-200 rounded-2xl sm:rounded-3xl hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:scale-110 text-center group"
          >
            <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mx-auto mb-4 w-fit group-hover:scale-125 transition-transform shadow-xl">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <span className="text-sm sm:text-base font-black text-blue-900">📝 Lançar Notas</span>
          </button>
          
          <button
            onClick={() => {
              if (onPageChange) {
                console.log('🔍 [AlunosTeacherPage] Ações Rápidas - Navegando para presenca');
                onPageChange('presenca');
              } else {
                console.error('❌ onPageChange não está disponível nas Ações Rápidas');
              }
            }}
            className="p-6 sm:p-8 bg-white border-2 border-green-200 rounded-2xl sm:rounded-3xl hover:border-green-400 hover:shadow-2xl transition-all duration-300 hover:scale-110 text-center group"
          >
            <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-4 w-fit group-hover:scale-125 transition-transform shadow-xl">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <span className="text-sm sm:text-base font-black text-green-900">✅ Presença</span>
          </button>
          
          <button
            onClick={() => {
              if (onPageChange) {
                console.log('🔍 [AlunosTeacherPage] Ações Rápidas - Navegando para agenda');
                onPageChange('agenda');
              } else {
                console.error('❌ onPageChange não está disponível nas Ações Rápidas');
              }
            }}
            className="p-6 sm:p-8 bg-white border-2 border-purple-200 rounded-2xl sm:rounded-3xl hover:border-purple-400 hover:shadow-2xl transition-all duration-300 hover:scale-110 text-center group"
          >
            <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl mx-auto mb-4 w-fit group-hover:scale-125 transition-transform shadow-xl">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <span className="text-sm sm:text-base font-black text-purple-900">📅 Agenda</span>
          </button>
          
          <button
            onClick={() => setShowEnviarRecadoModal(true)}
            className="p-6 sm:p-8 bg-white border-2 border-pink-200 rounded-2xl sm:rounded-3xl hover:border-pink-400 hover:shadow-2xl transition-all duration-300 hover:scale-110 text-center group"
          >
            <div className="p-4 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl mx-auto mb-4 w-fit group-hover:scale-125 transition-transform shadow-xl">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <span className="text-sm sm:text-base font-black text-pink-900">💌 Recados</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <LancarNotasModal
        isOpen={showLancarNotasModal}
        onClose={() => setShowLancarNotasModal(false)}
        onSave={() => setShowLancarNotasModal(false)}
      />

      <EnviarRecadoModal
        isOpen={showEnviarRecadoModal}
        onClose={() => setShowEnviarRecadoModal(false)}
        onSave={() => setShowEnviarRecadoModal(false)}
      />

      <VerAlunosModal
        isOpen={showAlunoDetailModal}
        onClose={() => {
          setShowAlunoDetailModal(false);
          setSelectedAluno(null);
        }}
      />
    </div>
  );
}