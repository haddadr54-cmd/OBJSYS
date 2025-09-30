import { useState, useEffect } from 'react';
import { GraduationCap, Search, Filter, MessageSquare, BookOpen, Calendar, MessageCircle, Users, Star, Zap, BarChart3 } from 'lucide-react';
import { LancarNotasModal } from '../Modals/LancarNotasModal';
import { EnviarRecadoModal } from '../Modals/EnviarRecadoModal';
import { VerAlunosModal } from '../Modals/VerAlunosModal';
import { useAuth } from '../../contexts/auth';
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
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null); // Usado em verPerfilCompleto

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

  // Helper: montar link para abrir WhatsApp com mensagem
  const buildWhatsappLink = (phone?: string, message?: string) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    const withCC = digits.startsWith('55') ? digits : `55${digits}`;
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${withCC}${text}`;
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

  // const enviarRecado = (aluno: Aluno) => {
  //   console.log('Enviar recado para:', aluno.nome);
  //   // Implementar envio de recado
  // };

  // const verNotas = (aluno: Aluno) => {
  //   console.log('Ver notas de:', aluno.nome);
  //   // Implementar visualização de notas
  // };

  const verPerfilCompleto = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setShowAlunoDetailModal(true);
  };

  // const marcarPresenca = (aluno: Aluno) => {
  //   console.log('Marcar presença de:', aluno.nome);
  //   // Implementar marcação de presença
  // };

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

      {/* Lista de alunos - formato lista vertical */}
      {alunosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center border border-gray-200">
          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum aluno encontrado</h3>
          <p className="text-gray-500">Ajuste os filtros ou verifique se há alunos nas suas turmas.</p>
        </div>
      ) : (
  <ul className="divide-y divide-gray-100 bg-white rounded-2xl shadow-lg border border-gray-200">
          {alunosFiltrados.map((aluno) => {
            const alunoComDetalhes = getAlunoWithDetails(aluno);
            return (
              <li key={aluno.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-8 py-7 hover:bg-gray-50 transition cursor-pointer text-base">
                <div className="flex items-center gap-6 min-w-0 w-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-black text-2xl">
                    {aluno.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <button type="button" className="font-bold text-gray-900 truncate max-w-xs underline hover:text-emerald-700 focus:outline-none" onClick={e => { e.stopPropagation(); verPerfilCompleto(aluno); }}>
                        {aluno.nome}
                      </button>
                      {alunoComDetalhes.turma?.nome && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">{alunoComDetalhes.turma?.nome}</span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-semibold border border-green-100">Ativo</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Responsável: <span className="font-semibold text-gray-800">{alunoComDetalhes.responsavel?.nome || 'Não informado'}</span></span>
                      {alunoComDetalhes.responsavel?.email && (
                        <span>Email: <span className="font-semibold text-blue-700">{alunoComDetalhes.responsavel.email}</span></span>
                      )}
                      {alunoComDetalhes.responsavel?.telefone && (
                        <span>Tel: <span className="font-semibold text-purple-700">{alunoComDetalhes.responsavel.telefone}</span></span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                  <button onClick={e => { e.stopPropagation(); setShowLancarNotasModal(true); }} className="px-3 py-1 bg-blue-600 text-white rounded font-bold text-xs hover:bg-blue-700">Notas</button>
                  <button onClick={e => { e.stopPropagation(); if (onPageChange) { onPageChange('presenca'); }}} className="px-3 py-1 bg-green-600 text-white rounded font-bold text-xs hover:bg-green-700">Presença</button>
                  <button onClick={e => { e.stopPropagation(); setShowEnviarRecadoModal(true); }} className="px-3 py-1 bg-purple-600 text-white rounded font-bold text-xs hover:bg-purple-700">Recado</button>
                  {(alunoComDetalhes.responsavel?.telefone || (aluno as any).telefone_responsavel) && (
                    <a href={buildWhatsappLink(alunoComDetalhes.responsavel?.telefone || (aluno as any).telefone_responsavel, `Olá ${alunoComDetalhes.responsavel?.nome || ''}! Sou o(a) Prof. ${user?.nome}. Sobre o aluno ${aluno.nome}.`)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="px-3 py-1 bg-emerald-600 text-white rounded font-bold text-xs hover:bg-emerald-700 flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
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
        aluno={selectedAluno || undefined}
        onClose={() => {
          setShowAlunoDetailModal(false);
          setSelectedAluno(null);
        }}
      />
    </div>
  );
}