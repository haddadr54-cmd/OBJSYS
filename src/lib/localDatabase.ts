// Sistema de banco de dados local para demonstração
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo_usuario: 'pai' | 'professor' | 'admin';
  telefone?: string;
  avatar_url?: string;
  ativo: boolean;
  criado_em: string;
}

export interface Aluno {
  id: string;
  nome: string;
  data_nascimento: string;
  matricula: string;
  responsavel_id: string;
  turma_id: string;
  responsavel?: string;
  telefone_responsavel?: string;
  email_responsavel?: string;
  endereco?: string;
  observacoes?: string;
  foto_url?: string;
  criado_em: string;
}

export interface Turma {
  id: string;
  nome: string;
  serie: string;
  turno: 'Manhã' | 'Tarde' | 'Noite' | 'Integral';
  ano_letivo: string;
  professor_id: string;
  capacidade?: number;
  descricao?: string;
  ativa: boolean;
  observacoes?: string;
  criado_em: string;
}

export interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
  cor: string;
  descricao?: string;
  ativa: boolean;
  criado_em: string;
}

export interface Nota {
  id: string;
  aluno_id: string;
  disciplina_id: string;
  professor_id: string;
  valor: number;
  tipo: 'prova' | 'trabalho' | 'participacao' | 'recuperacao';
  descricao?: string;
  data_lancamento: string;
  bimestre: number;
  criado_em: string;
}

export interface ProvaTarefa {
  id: string;
  turma_id: string;
  disciplina_id: string;
  professor_id: string;
  titulo: string;
  descricao?: string;
  tipo: 'prova' | 'tarefa' | 'trabalho' | 'projeto';
  data_entrega: string;
  valor_total: number;
  anexo_url?: string;
  criado_em: string;
}

export interface Material {
  id: string;
  turma_id: string;
  disciplina_id: string;
  professor_id: string;
  titulo: string;
  descricao?: string;
  tipo: 'pdf' | 'video' | 'link' | 'imagem';
  url: string;
  tamanho_arquivo?: string;
  visivel: boolean;
  criado_em: string;
}

export interface Recado {
  id: string;
  autor_id: string;
  titulo: string;
  conteudo: string;
  tipo: 'geral' | 'turma' | 'individual';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  turma_id?: string;
  aluno_id?: string;
  data_envio: string;
  data_expiracao?: string;
  lido: boolean;
  criado_em: string;
}

export interface Presenca {
  id: string;
  aluno_id: string;
  disciplina_id: string;
  professor_id: string;
  data_aula: string;
  presente: boolean;
  justificativa?: string;
  criado_em: string;
}

// Tipagem explícita do snapshot de dados iniciais
type InitialData = {
  usuarios: Usuario[];
  turmas: Turma[];
  alunos: Aluno[];
  disciplinas: Disciplina[];
  notas: Nota[];
  provasTarefas: ProvaTarefa[];
  materiais: Material[];
  recados: Recado[];
  presencas: Presenca[];
};

// Dados iniciais do sistema
const initialData: InitialData = {
  usuarios: [
    {
      id: 'user-1',
      nome: 'João Silva',
      email: 'pai@escola.com',
      senha: '123456',
      tipo_usuario: 'pai' as const,
      telefone: '(11) 99999-9999',
      ativo: true,
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'user-2',
      nome: 'Maria Santos',
      email: 'professor@escola.com',
      senha: '123456',
      tipo_usuario: 'professor' as const,
      telefone: '(11) 88888-8888',
      ativo: true,
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'user-3',
      nome: 'Carlos Oliveira',
      email: 'admin@escola.com',
      senha: '123456',
      tipo_usuario: 'admin' as const,
      telefone: '(11) 77777-7777',
      ativo: true,
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'user-4',
      nome: 'Ana Costa',
      email: 'professor2@escola.com',
      senha: '123456',
      tipo_usuario: 'professor' as const,
      telefone: '(11) 66666-6666',
      ativo: true,
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'user-5',
      nome: 'Pedro Almeida',
      email: 'pai2@escola.com',
      senha: '123456',
      tipo_usuario: 'pai' as const,
      telefone: '(11) 55555-5555',
      ativo: true,
      criado_em: '2024-01-01T00:00:00Z'
    }
  ],
  turmas: [
    {
      id: 'turma-1',
      nome: '5º Ano A',
      serie: '5º Ano',
      turno: 'Manhã',
      ano_letivo: '2024',
      professor_id: 'user-2',
      capacidade: 30,
      descricao: 'Turma do 5º ano do ensino fundamental - Manhã',
      ativa: true,
      observacoes: '',
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'turma-2',
      nome: '3º Ano B',
      serie: '3º Ano',
      turno: 'Tarde',
      ano_letivo: '2024',
      professor_id: 'user-2',
      capacidade: 25,
      descricao: 'Turma do 3º ano do ensino fundamental - Tarde',
      ativa: true,
      observacoes: '',
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'turma-3',
      nome: '4º Ano C',
      serie: '4º Ano',
      turno: 'Manhã',
      ano_letivo: '2024',
      professor_id: 'user-4',
      capacidade: 28,
      descricao: 'Turma do 4º ano do ensino fundamental - Manhã',
      ativa: true,
      observacoes: 'Turma com foco em reforço de leitura',
      criado_em: '2024-01-01T00:00:00Z'
    }
  ],
  alunos: [
    {
      id: 'aluno-1',
      nome: 'Ana Silva',
      data_nascimento: '2010-05-15',
      matricula: '2024001',
      responsavel_id: 'user-1',
      turma_id: 'turma-1',
      responsavel: 'João Silva',
      telefone_responsavel: '(11) 99999-9999',
      email_responsavel: 'pai@escola.com',
      endereco: 'Rua das Flores, 123',
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'aluno-2',
      nome: 'Pedro Silva',
      data_nascimento: '2012-08-22',
      matricula: '2024002',
      responsavel_id: 'user-1',
      turma_id: 'turma-2',
      responsavel: 'João Silva',
      telefone_responsavel: '(11) 99999-9999',
      email_responsavel: 'pai@escola.com',
      endereco: 'Rua das Flores, 123',
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'aluno-3',
      nome: 'Maria Santos',
      data_nascimento: '2011-03-10',
      matricula: '2024003',
      responsavel_id: 'user-5',
      turma_id: 'turma-1',
      responsavel: 'Pedro Almeida',
      telefone_responsavel: '(11) 55555-5555',
      email_responsavel: 'pai2@escola.com',
      endereco: 'Av. Central, 456',
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'aluno-4',
      nome: 'João Oliveira',
      data_nascimento: '2010-12-05',
      matricula: '2024004',
      responsavel_id: 'user-5',
      turma_id: 'turma-1',
      responsavel: 'Pedro Almeida',
      telefone_responsavel: '(11) 55555-5555',
      email_responsavel: 'pai2@escola.com',
      endereco: 'Av. Central, 456',
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'aluno-5',
      nome: 'Lucas Costa',
      data_nascimento: '2011-07-18',
      matricula: '2024005',
      responsavel_id: 'user-5',
      turma_id: 'turma-3',
      responsavel: 'Pedro Almeida',
      telefone_responsavel: '(11) 55555-5555',
      email_responsavel: 'pai2@escola.com',
      endereco: 'Av. Central, 456',
      criado_em: '2024-01-01T00:00:00Z'
    }
  ],
  disciplinas: [
    {
      id: 'disc-1',
      nome: 'Matemática',
      codigo: 'MAT',
      cor: '#3B82F6',
      descricao: 'Disciplina de Matemática',
      ativa: true,
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'disc-2',
      nome: 'Português',
      codigo: 'POR',
      cor: '#10B981',
      descricao: 'Disciplina de Língua Portuguesa',
      ativa: true,
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'disc-3',
      nome: 'Ciências',
      codigo: 'CIE',
      cor: '#F59E0B',
      descricao: 'Disciplina de Ciências',
      ativa: true,
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'disc-4',
      nome: 'História',
      codigo: 'HIS',
      cor: '#8B5CF6',
      descricao: 'Disciplina de História',
      ativa: true,
      criado_em: '2024-01-01T00:00:00Z'
    },
    {
      id: 'disc-5',
      nome: 'Geografia',
      codigo: 'GEO',
      cor: '#EF4444',
      descricao: 'Disciplina de Geografia',
      ativa: true,
      criado_em: '2024-01-01T00:00:00Z'
    }
  ],
  notas: [
    {
      id: 'nota-1',
      aluno_id: 'aluno-1',
      disciplina_id: 'disc-1',
      professor_id: 'user-2',
      valor: 8.5,
      tipo: 'prova' as const,
      descricao: 'Prova de Frações',
      data_lancamento: '2024-01-15',
      bimestre: 1,
      criado_em: '2024-01-15T00:00:00Z'
    },
    {
      id: 'nota-2',
      aluno_id: 'aluno-1',
      disciplina_id: 'disc-2',
      professor_id: 'user-2',
      valor: 9.0,
      tipo: 'trabalho' as const,
      descricao: 'Redação sobre Meio Ambiente',
      data_lancamento: '2024-01-20',
      bimestre: 1,
      criado_em: '2024-01-20T00:00:00Z'
    },
    {
      id: 'nota-3',
      aluno_id: 'aluno-2',
      disciplina_id: 'disc-1',
      professor_id: 'user-2',
      valor: 7.5,
      tipo: 'prova' as const,
      descricao: 'Prova de Multiplicação',
      data_lancamento: '2024-01-18',
      bimestre: 1,
      criado_em: '2024-01-18T00:00:00Z'
    },
    {
      id: 'nota-4',
      aluno_id: 'aluno-3',
      disciplina_id: 'disc-1',
      professor_id: 'user-2',
      valor: 9.5,
      tipo: 'prova' as const,
      descricao: 'Prova de Frações',
      data_lancamento: '2024-01-15',
      bimestre: 1,
      criado_em: '2024-01-15T00:00:00Z'
    },
    {
      id: 'nota-5',
      aluno_id: 'aluno-4',
      disciplina_id: 'disc-2',
      professor_id: 'user-2',
      valor: 8.0,
      tipo: 'trabalho' as const,
      descricao: 'Interpretação de Texto',
      data_lancamento: '2024-01-22',
      bimestre: 1,
      criado_em: '2024-01-22T00:00:00Z'
    }
  ],
  provasTarefas: [
    {
      id: 'prova-1',
      turma_id: 'turma-1',
      disciplina_id: 'disc-1',
      professor_id: 'user-2',
      titulo: 'Prova de Matemática - Geometria',
      descricao: 'Prova sobre formas geométricas e perímetros',
      tipo: 'prova' as const,
      data_entrega: '2024-02-15',
      valor_total: 10,
      criado_em: '2024-01-25T00:00:00Z'
    },
    {
      id: 'tarefa-1',
      turma_id: 'turma-1',
      disciplina_id: 'disc-2',
      professor_id: 'user-2',
      titulo: 'Trabalho de Português - Poesia',
      descricao: 'Criar um poema sobre a natureza',
      tipo: 'trabalho' as const,
      data_entrega: '2024-02-20',
      valor_total: 10,
      criado_em: '2024-01-25T00:00:00Z'
    },
    {
      id: 'prova-2',
      turma_id: 'turma-2',
      disciplina_id: 'disc-3',
      professor_id: 'user-2',
      titulo: 'Prova de Ciências - Sistema Solar',
      descricao: 'Avaliação sobre planetas e estrelas',
      tipo: 'prova' as const,
      data_entrega: '2024-02-18',
      valor_total: 10,
      criado_em: '2024-01-25T00:00:00Z'
    }
  ],
  materiais: [
    {
      id: 'material-1',
      turma_id: 'turma-1',
      disciplina_id: 'disc-1',
      professor_id: 'user-2',
      titulo: 'Apostila de Frações',
      descricao: 'Material de apoio para estudar frações',
      tipo: 'pdf' as const,
      url: 'https://example.com/fracoes.pdf',
      tamanho_arquivo: '2.5 MB',
      visivel: true,
      criado_em: '2024-01-10T00:00:00Z'
    },
    {
      id: 'material-2',
      turma_id: 'turma-1',
      disciplina_id: 'disc-2',
      professor_id: 'user-2',
      titulo: 'Vídeo: Como fazer uma redação',
      descricao: 'Tutorial em vídeo sobre estrutura de redação',
      tipo: 'video' as const,
      url: 'https://youtube.com/watch?v=exemplo',
      visivel: true,
      criado_em: '2024-01-12T00:00:00Z'
    },
    {
      id: 'material-3',
      turma_id: 'turma-2',
      disciplina_id: 'disc-3',
      professor_id: 'user-2',
      titulo: 'Site Interativo - Sistema Solar',
      descricao: 'Site educativo sobre planetas',
      tipo: 'link' as const,
      url: 'https://sistemasolar.edu.br',
      visivel: true,
      criado_em: '2024-01-14T00:00:00Z'
    }
  ],
  recados: [
    {
      id: 'recado-1',
      autor_id: 'user-2',
      titulo: 'Reunião de Pais - 5º Ano',
      conteudo: 'Informamos que haverá reunião de pais no próximo sábado, dia 10/02, às 9h no auditório da escola. Compareçam!',
      tipo: 'turma' as const,
      prioridade: 'alta' as const,
      turma_id: 'turma-1',
      data_envio: '2024-01-25T00:00:00Z',
      lido: false,
      criado_em: '2024-01-25T00:00:00Z'
    },
    {
      id: 'recado-2',
      autor_id: 'user-3',
      titulo: 'Novo Sistema de Comunicação',
      conteudo: 'Estamos lançando nosso novo sistema de comunicação escola-família. Agora vocês podem acompanhar tudo online!',
      tipo: 'geral' as const,
      prioridade: 'normal' as const,
      data_envio: '2024-01-20T00:00:00Z',
      lido: true,
      criado_em: '2024-01-20T00:00:00Z'
    },
    {
      id: 'recado-3',
      autor_id: 'user-2',
      titulo: 'Lembrete: Material de Arte',
      conteudo: 'Não esqueçam de trazer o material de arte para a aula de amanhã: tinta, pincel e papel canson.',
      tipo: 'turma' as const,
      prioridade: 'normal' as const,
      turma_id: 'turma-1',
      data_envio: '2024-01-28T00:00:00Z',
      lido: false,
      criado_em: '2024-01-28T00:00:00Z'
    }
  ],
  presencas: [
    {
      id: 'presenca-1',
      aluno_id: 'aluno-1',
      disciplina_id: 'disc-1',
      professor_id: 'user-2',
      data_aula: '2024-01-29',
      presente: true,
      criado_em: '2024-01-29T00:00:00Z'
    },
    {
      id: 'presenca-2',
      aluno_id: 'aluno-2',
      disciplina_id: 'disc-1',
      professor_id: 'user-2',
      data_aula: '2024-01-29',
      presente: false,
      justificativa: 'Consulta médica',
      criado_em: '2024-01-29T00:00:00Z'
    },
    {
      id: 'presenca-3',
      aluno_id: 'aluno-3',
      disciplina_id: 'disc-1',
      professor_id: 'user-2',
      data_aula: '2024-01-29',
      presente: true,
      criado_em: '2024-01-29T00:00:00Z'
    }
  ]
};

// Classe para gerenciar o banco de dados local
class LocalDatabase {
  private data: InitialData;

  constructor() {
    // Carregar dados do localStorage ou usar dados iniciais
    const savedData = localStorage.getItem('schoolSystemData');
    this.data = savedData ? JSON.parse(savedData) : initialData;
  }

  private save() {
    localStorage.setItem('schoolSystemData', JSON.stringify(this.data));
  }

  // Métodos para Usuários
  getUsuarios(): Usuario[] {
    return this.data.usuarios;
  }

  getUsuarioByEmail(email: string): Usuario | null {
    return this.data.usuarios.find(u => u.email === email) || null;
  }

  getUsuarioById(id: string): Usuario | null {
    return this.data.usuarios.find(u => u.id === id) || null;
  }

  createUsuario(usuario: Omit<Usuario, 'id' | 'criado_em'>): Usuario {
    const newUsuario: Usuario = {
      ...usuario,
      id: `user-${Date.now()}`,
      criado_em: new Date().toISOString()
    };
  this.data.usuarios.push(newUsuario);
    this.save();
    return newUsuario;
  }

  updateUsuario(id: string, updates: Partial<Usuario>): Usuario | null {
    const index = this.data.usuarios.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    this.data.usuarios[index] = { ...this.data.usuarios[index], ...updates };
    this.save();
    return this.data.usuarios[index];
  }

  deleteUsuario(id: string): boolean {
    const index = this.data.usuarios.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.data.usuarios.splice(index, 1);
    this.save();
    return true;
  }

  // Métodos para Alunos
  getAlunos(): Aluno[] {
    return this.data.alunos;
  }

  getAlunosByResponsavel(responsavelId: string): Aluno[] {
    return this.data.alunos.filter(a => a.responsavel_id === responsavelId);
  }

  getAlunosByTurma(turmaId: string): Aluno[] {
    return this.data.alunos.filter(a => a.turma_id === turmaId);
  }

  createAluno(aluno: Omit<Aluno, 'id' | 'criado_em'>): Aluno {
    const newAluno: Aluno = {
      ...aluno,
      id: `aluno-${Date.now()}`,
      criado_em: new Date().toISOString()
    };
    this.data.alunos.push(newAluno);
    this.save();
    return newAluno;
  }

  updateAluno(id: string, updates: Partial<Aluno>): Aluno | null {
    const index = this.data.alunos.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    this.data.alunos[index] = { ...this.data.alunos[index], ...updates };
    this.save();
    return this.data.alunos[index];
  }

  deleteAluno(id: string): boolean {
    const index = this.data.alunos.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    this.data.alunos.splice(index, 1);
    this.save();
    return true;
  }

  // Métodos para Turmas
  getTurmas(): Turma[] {
  return this.data.turmas;
  }

  getTurmasByProfessor(professorId: string): Turma[] {
  return this.data.turmas.filter(t => t.professor_id === professorId);
  }

  createTurma(turma: Omit<Turma, 'id' | 'criado_em'>): Turma {
    const newTurma: Turma = {
      ...turma,
      id: `turma-${Date.now()}`,
      criado_em: new Date().toISOString()
    };
  this.data.turmas.push(newTurma);
    this.save();
    return newTurma;
  }

  updateTurma(id: string, updates: Partial<Turma>): Turma | null {
    const index = this.data.turmas.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.data.turmas[index] = { ...this.data.turmas[index], ...updates };
    this.save();
  return this.data.turmas[index];
  }

  deleteTurma(id: string): boolean {
    const index = this.data.turmas.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.data.turmas.splice(index, 1);
    this.save();
    return true;
  }

  // Métodos para Disciplinas
  getDisciplinas(): Disciplina[] {
    return this.data.disciplinas;
  }

  createDisciplina(disciplina: Omit<Disciplina, 'id' | 'criado_em'>): Disciplina {
    const newDisciplina: Disciplina = {
      ...disciplina,
      id: `disc-${Date.now()}`,
      criado_em: new Date().toISOString()
    };
  this.data.disciplinas.push(newDisciplina);
    this.save();
    return newDisciplina;
  }

  updateDisciplina(id: string, updates: Partial<Disciplina>): Disciplina | null {
    const index = this.data.disciplinas.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    this.data.disciplinas[index] = { ...this.data.disciplinas[index], ...updates };
    this.save();
    return this.data.disciplinas[index];
  }

  deleteDisciplina(id: string): boolean {
    const index = this.data.disciplinas.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    this.data.disciplinas.splice(index, 1);
    this.save();
    return true;
  }

  // Métodos para Notas
  getNotas(): Nota[] {
    return this.data.notas;
  }

  getNotasByAluno(alunoId: string): Nota[] {
    return this.data.notas.filter(n => n.aluno_id === alunoId);
  }

  getNotasByProfessor(professorId: string): Nota[] {
    return this.data.notas.filter(n => n.professor_id === professorId);
  }

  createNota(nota: Omit<Nota, 'id' | 'criado_em'>): Nota {
    const newNota: Nota = {
      ...nota,
      id: `nota-${Date.now()}`,
      criado_em: new Date().toISOString()
    };
  this.data.notas.push(newNota);
    this.save();
    return newNota;
  }

  updateNota(id: string, updates: Partial<Nota>): Nota | null {
    const index = this.data.notas.findIndex(n => n.id === id);
    if (index === -1) return null;
    
  this.data.notas[index] = { ...this.data.notas[index], ...updates } as Nota;
    this.save();
    return this.data.notas[index];
  }

  deleteNota(id: string): boolean {
    const index = this.data.notas.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    this.data.notas.splice(index, 1);
    this.save();
    return true;
  }

  // Métodos para Provas/Tarefas
  getProvasTarefas(): ProvaTarefa[] {
    return this.data.provasTarefas;
  }

  getProvasTarefasByTurma(turmaId: string): ProvaTarefa[] {
    return this.data.provasTarefas.filter(p => p.turma_id === turmaId);
  }

  createProvaTarefa(provaTarefa: Omit<ProvaTarefa, 'id' | 'criado_em'>): ProvaTarefa {
    const newProvaTarefa: ProvaTarefa = {
      ...provaTarefa,
      id: `prova-${Date.now()}`,
      criado_em: new Date().toISOString()
    };
  this.data.provasTarefas.push(newProvaTarefa);
    this.save();
    return newProvaTarefa;
  }

  // Métodos para Materiais
  getMateriais(): Material[] {
    return this.data.materiais;
  }

  getMateriaisByTurma(turmaId: string): Material[] {
    return this.data.materiais.filter(m => m.turma_id === turmaId);
  }

  createMaterial(material: Omit<Material, 'id' | 'criado_em'>): Material {
    const newMaterial: Material = {
      ...material,
      id: `material-${Date.now()}`,
      criado_em: new Date().toISOString()
    };
  this.data.materiais.push(newMaterial);
    this.save();
    return newMaterial;
  }

  // Métodos para Recados
  getRecados(): Recado[] {
    return this.data.recados;
  }

  getRecadosForUser(userId: string, userType: string): Recado[] {
    if (userType === 'admin') {
      return this.data.recados;
    }
    
    if (userType === 'pai') {
      const alunos = this.getAlunosByResponsavel(userId);
      const turmaIds = alunos.map(a => a.turma_id);
      const alunoIds = alunos.map(a => a.id);
      
      return this.data.recados.filter((r) => {
        if (r.tipo === 'geral') return true;
        if (r.tipo === 'turma') return !!r.turma_id && turmaIds.includes(r.turma_id);
        if (r.tipo === 'individual') return !!r.aluno_id && alunoIds.includes(r.aluno_id);
        return false;
      });
    }
    
    return this.data.recados.filter(r => r.autor_id === userId);
  }

  createRecado(recado: Omit<Recado, 'id' | 'criado_em'>): Recado {
  const newRecado: Recado = {
      ...recado,
      id: `recado-${Date.now()}`,
      criado_em: new Date().toISOString()
    };
  this.data.recados.push(newRecado);
    this.save();
    return newRecado;
  }

  deleteRecado(id: string): boolean {
  const index = this.data.recados.findIndex((r) => r.id === id);
    if (index === -1) return false;
  this.data.recados.splice(index, 1);
    this.save();
    return true;
  }

  // Métodos para Presenças
  getPresencas(): Presenca[] {
    return this.data.presencas;
  }

  getPresencasByAluno(alunoId: string): Presenca[] {
    return this.data.presencas.filter(p => p.aluno_id === alunoId);
  }

  createPresenca(presenca: Omit<Presenca, 'id' | 'criado_em'>): Presenca {
    const newPresenca: Presenca = {
      ...presenca,
      id: `presenca-${Date.now()}`,
      criado_em: new Date().toISOString()
    };
    this.data.presencas.push(newPresenca);
    this.save();
    return newPresenca;
  }

  // Métodos auxiliares para joins
  getAlunoWithTurma(alunoId: string) {
    const aluno = this.data.alunos.find(a => a.id === alunoId);
    if (!aluno) return null;
    
    const turma = this.data.turmas.find(t => t.id === aluno.turma_id);
    return { ...aluno, turma };
  }

  getNotaWithDetails(notaId: string) {
    const nota = this.data.notas.find(n => n.id === notaId);
    if (!nota) return null;
    
    const aluno = this.data.alunos.find(a => a.id === nota.aluno_id);
    const disciplina = this.data.disciplinas.find(d => d.id === nota.disciplina_id);
    const professor = this.data.usuarios.find(u => u.id === nota.professor_id);
    
    return { ...nota, aluno, disciplina, professor };
  }

  getProvaTarefaWithDetails(provaId: string) {
    const prova = this.data.provasTarefas.find(p => p.id === provaId);
    if (!prova) return null;
    
    const turma = this.data.turmas.find(t => t.id === prova.turma_id);
    const disciplina = this.data.disciplinas.find(d => d.id === prova.disciplina_id);
    const professor = this.data.usuarios.find(u => u.id === prova.professor_id);
    
    return { ...prova, turma, disciplina, professor };
  }

  getMaterialWithDetails(materialId: string) {
    const material = this.data.materiais.find(m => m.id === materialId);
    if (!material) return null;
    
    const turma = this.data.turmas.find(t => t.id === material.turma_id);
    const disciplina = this.data.disciplinas.find(d => d.id === material.disciplina_id);
    const professor = this.data.usuarios.find(u => u.id === material.professor_id);
    
    return { ...material, turma, disciplina, professor };
  }

  getRecadoWithDetails(recadoId: string) {
    const recado = this.data.recados.find(r => r.id === recadoId);
    if (!recado) return null;
    
    const autor = this.data.usuarios.find(u => u.id === recado.autor_id);
    const turma = recado.turma_id ? this.data.turmas.find(t => t.id === recado.turma_id) : null;
    const aluno = recado.aluno_id ? this.data.alunos.find(a => a.id === recado.aluno_id) : null;
    
    return { ...recado, autor, turma, aluno };
  }
}

// Instância singleton do banco de dados
export const localDB = new LocalDatabase();