import React, { useState, useEffect } from 'react';
import { Users, Eye, BookOpen, Calendar, MessageSquare, BarChart3, GraduationCap, TrendingUp, Star, Zap, School, Clock, User, Phone, MessageCircle } from 'lucide-react';
import { LancarNotasModal } from '../Modals/LancarNotasModal';
import { EnviarRecadoModal } from '../Modals/EnviarRecadoModal';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import type { Turma, Aluno } from '../../lib/supabase';

interface TurmasTeacherPageProps {
  onPageChange?: (page: string) => void;
}

export function TurmasTeacherPage({ onPageChange }: TurmasTeacherPageProps) {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLancarNotasModal, setShowLancarNotasModal] = useState(false);
  const [showEnviarRecadoModal, setShowEnviarRecadoModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTurmas();
    }
  }, [user, isSupabaseConnected]);

  const fetchTurmas = async () => {
    try {
      const [turmasData, alunosData] = await Promise.all([
        dataService.getTurmas(),
        dataService.getAlunos()
      ]);

      setTurmas(turmasData);
      setAlunos(alunosData);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTurmaStats = (turmaId: string) => {
    const alunosDaTurma = alunos.filter(a => a.turma_id === turmaId);
    return {
      totalAlunos: alunosDaTurma.length,
      // Aqui você pode adicionar mais estatísticas como média de notas, frequência, etc.
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-gray-700">Carregando suas turmas...</p>
          <p className="text-lg text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Header Espetacular */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-blue-200 p-6 sm:p-8 lg:p-12 animate-slide-in-up hover:shadow-2xl transition-all duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl sm:rounded-3xl shadow-2xl mx-auto sm:mx-0 animate-float">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-glow">
                🏫 Minhas Turmas
              </h1>
              <p className="text-gray-700 mt-2 sm:mt-4 text-lg sm:text-xl lg:text-2xl font-bold">
                🚀 Gerencie suas turmas com eficiência máxima
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

      {/* Estatísticas Espetaculares */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-blue-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-blue-600 uppercase tracking-wider">🏫 Turmas</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-blue-700 animate-glow">{turmas.length}</p>
              <p className="text-xs sm:text-sm text-blue-500 font-bold">Atribuídas</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-green-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-green-600 uppercase tracking-wider">🎓 Alunos</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-green-700 animate-glow">
                {turmas.reduce((total, turma) => total + getTurmaStats(turma.id).totalAlunos, 0)}
              </p>
              <p className="text-xs sm:text-sm text-green-500 font-bold">Total</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-purple-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-purple-600 uppercase tracking-wider">📊 Média</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-purple-700 animate-glow">
                {turmas.length > 0 
                  ? Math.round(turmas.reduce((total, turma) => total + getTurmaStats(turma.id).totalAlunos, 0) / turmas.length)
                  : 0
                }
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
              <p className="text-xs sm:text-sm lg:text-base font-black text-amber-600 uppercase tracking-wider">⚡ Status</p>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-amber-700 animate-glow">Ativo</p>
              <p className="text-xs sm:text-sm text-amber-500 font-bold">Sistema</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de turmas espetacular */}
      {turmas.length === 0 ? (
        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-3xl shadow-2xl border-2 border-gray-200 p-12 sm:p-16 lg:p-20 text-center animate-slide-in-up">
          <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-fit mx-auto mb-8 animate-bounce-soft">
            <Users className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-6">🏫 Nenhuma turma atribuída</h3>
          <p className="text-gray-600 text-lg sm:text-xl font-semibold">Entre em contato com a administração para ter turmas atribuídas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {turmas.map((turma, index) => {
            const stats = getTurmaStats(turma.id);
            return (
              <div 
                key={turma.id} 
                className={`bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-blue-200 hover:shadow-2xl hover:border-blue-400 hover:scale-110 hover:rotate-1 transition-all duration-500 cursor-pointer group animate-scale-in`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => console.log('Ver detalhes da turma:', turma.nome)}
              >
                <div className="p-6 sm:p-8">
                  {/* Header da Turma */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-2xl animate-float">
                        {turma.nome.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">{turma.nome}</h3>
                        <p className="text-sm sm:text-base text-gray-600 font-bold">📅 {turma.ano_letivo}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs sm:text-sm text-green-600 font-bold">Ativa</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas da Turma */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-gray-700">👥 Alunos</span>
                      </div>
                      <span className="text-lg sm:text-xl font-black text-blue-600">{stats.totalAlunos}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-green-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-gray-700">📚 Disciplinas</span>
                      </div>
                      <span className="text-lg sm:text-xl font-black text-green-600">5</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-gray-700">📊 Média</span>
                      </div>
                      <span className="text-lg sm:text-xl font-black text-purple-600">8.2</span>
                    </div>
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
                            console.log('🔍 [TurmasTeacherPage] Navegando para presenca');
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

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEnviarRecadoModal(true);
                      }}
                      className="w-full flex items-center justify-center space-x-2 p-3 sm:p-4 text-sm sm:text-base text-white bg-gradient-to-r from-purple-500 to-purple-700 border-2 border-purple-300 rounded-xl sm:rounded-2xl hover:from-purple-600 hover:to-purple-800 hover:scale-105 hover:shadow-xl transition-all duration-300 font-black"
                    >
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>💌 Enviar Recado</span>
                    </button>
                  </div>

                  {/* Indicador de Clique */}
                  <div className="mt-6 pt-6 border-t-2 border-blue-200 text-center">
                    <p className="text-xs sm:text-sm text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity font-black bg-white px-4 py-2 rounded-xl shadow-lg">
                      ✨ Clique para ver detalhes completos da turma
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
                console.log('🔍 [TurmasTeacherPage] Ações Rápidas - Navegando para presenca');
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
                console.log('🔍 [TurmasTeacherPage] Ações Rápidas - Navegando para agenda');
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
    </div>
  );
}