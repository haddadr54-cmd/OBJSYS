import { FC } from 'react';
import { X, User, GraduationCap, Users, Calendar, Phone, Mail, FileText, Clock, Star, Award, MessageCircle } from 'lucide-react';
import type { Aluno, Turma, Usuario } from '../../lib/supabase.types';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Aluno | null;
  turma?: Turma;
  responsavel?: Usuario;
}

export const StudentDetailModal: FC<StudentDetailModalProps> = ({ isOpen, onClose, student, turma, responsavel }) => {
  if (!isOpen || !student) return null;

  // Função para extrair informações do responsável (compatibilidade local/supabase)
  const getResponsavelInfo = () => {
    if (responsavel) {
      return {
        nome: responsavel.nome,
        email: responsavel.email,
        telefone: responsavel.telefone
      };
    }
    
    // Fallback para dados do localDatabase
    const alunoAny = student as any;
    return {
      nome: alunoAny.responsavel || 'Não informado',
      email: alunoAny.email_responsavel || 'Não informado',
      telefone: alunoAny.telefone_responsavel || 'Não informado'
    };
  };

  const responsavelInfo = getResponsavelInfo();

  const buildWhatsappLink = (phone?: string, message?: string) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    const withCC = digits.startsWith('55') ? digits : `55${digits}`;
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${withCC}${text}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getIdadeAproximada = () => {
    if (!student.data_nascimento) return 'Não informada';
    
    try {
      const nascimento = new Date(student.data_nascimento);
      const hoje = new Date();
      const idade = hoje.getFullYear() - nascimento.getFullYear();
      const mesNascimento = nascimento.getMonth();
      const mesAtual = hoje.getMonth();
      
      if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
        return `${idade - 1} anos`;
      }
      
      return `${idade} anos`;
    } catch {
      return 'Não calculável';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-300"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="pr-16">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                {student.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black">{student.nome}</h2>
                <p className="text-blue-100 flex items-center mt-1">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {turma?.nome || 'Sem turma definida'}
                </p>
                <p className="text-blue-200 text-sm">
                  Matrícula: {student.matricula || 'Não informada'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Informações Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dados do Aluno */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  👨‍🎓 Informações do Aluno
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                    <p className="text-gray-800 font-semibold text-lg">{student.nome}</p>
                  </div>
                  
                  {student.data_nascimento && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                        <p className="text-gray-800 flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {formatDate(student.data_nascimento)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Idade</label>
                        <p className="text-gray-800 font-medium">{getIdadeAproximada()}</p>
                      </div>
                    </div>
                  )}
                  
                  {student.cpf && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">CPF</label>
                      <p className="text-gray-800 font-mono">{student.cpf}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Matrícula</label>
                    <p className="text-gray-800 font-mono bg-blue-100 px-2 py-1 rounded">
                      {student.matricula || 'Não definida'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Acadêmicas */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
                  🏫 Informações Acadêmicas
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Turma</label>
                    <div className="mt-1">
                      {turma ? (
                        <div className="bg-purple-100 rounded-lg p-3">
                          <p className="text-gray-800 font-semibold">{turma.nome}</p>
                          <p className="text-sm text-gray-600">Ano Letivo: {turma.ano_letivo}</p>
                          {turma.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{turma.descricao}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Nenhuma turma definida</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Award className="h-4 w-4 mr-1" />
                        Ativo
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cadastrado em</label>
                    <p className="text-gray-800 flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {formatDateTime(student.criado_em)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Responsável */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                👨‍👩‍👧‍👦 Responsável
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="text-gray-800 font-semibold flex items-center">
                    <User className="h-4 w-4 mr-1 text-gray-500" />
                    {responsavelInfo.nome}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">E-mail</label>
                  <p className="text-gray-800 flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="break-all">{responsavelInfo.email}</span>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-500" />
                      {responsavelInfo.telefone}
                    </p>
                    {responsavelInfo.telefone && responsavelInfo.telefone !== 'Não informado' && (
                      <a
                        href={buildWhatsappLink(responsavelInfo.telefone, `Olá ${responsavelInfo.nome}!`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200"
                        title="Abrir WhatsApp"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Ações do Responsável */}
              <div className="mt-4 pt-4 border-t border-green-200">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Ações Disponíveis:</h4>
                <div className="flex flex-wrap gap-2">
                  {responsavelInfo.telefone !== 'Não informado' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      📱 WhatsApp disponível
                    </span>
                  )}
                  {responsavelInfo.email !== 'Não informado' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      📧 E-mail disponível
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Informações Técnicas */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                ⚙️ Informações Técnicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID do Aluno</label>
                  <p className="text-gray-800 font-mono text-sm bg-gray-200 px-2 py-1 rounded break-all">
                    {student.id}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">ID da Turma</label>
                  <p className="text-gray-800 font-mono text-sm bg-gray-200 px-2 py-1 rounded break-all">
                    {student.turma_id || 'Não definido'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">ID do Responsável</label>
                  <p className="text-gray-800 font-mono text-sm bg-gray-200 px-2 py-1 rounded break-all">
                    {student.responsavel_id || 'Não definido'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Cadastro</label>
                  <p className="text-gray-800 text-sm">
                    {new Date(student.criado_em).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Resumo de Ações */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-600" />
                🎯 Ações Disponíveis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Gestão do Aluno:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Editar dados pessoais (✏️)</li>
                    <li>• Gerenciar matrícula</li>
                    <li>• Alterar turma</li>
                    <li>• Visualizar histórico acadêmico</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Comunicação:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Enviar WhatsApp ao responsável (💬)</li>
                    <li>• Enviar comunicados</li>
                    <li>• Agendar reuniões</li>
                    <li>• Relatórios personalizados</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              // Aqui poderia abrir o modal de edição
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Editar Aluno
          </button>
        </div>
      </div>
    </div>
  );
};