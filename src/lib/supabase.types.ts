// Centralized TypeScript interfaces for Supabase entities.
// Import these where needed instead of pulling full supabase client logic.

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string; // legacy
  auth_user_id?: string;
  tipo_usuario: 'pai' | 'professor' | 'admin';
  telefone?: string;
  avatar_url?: string;
  ativo: boolean;
  criado_em: string;
  // Campos opcionais usados em camadas de UI/agregações
  [key: string]: any; // fallback para campos projetados em selects (ex: contagens, joins ad-hoc)
}

export interface Turma {
  id: string;
  nome: string;
  ano_letivo: string;
  ativa: boolean;
  serie?: string;
  turno?: string;
  professor_id?: string;
  capacidade?: number;
  descricao?: string;
  observacoes?: string;
  criado_em: string;
}

export interface Aluno {
  id: string;
  nome: string;
  turma_id: string;
  responsavel_id: string | null;
  criado_em: string;
  data_nascimento?: string;
  matricula?: string;
  foto_url?: string;
  turma?: Turma;
  cpf?: string;
  responsavel?: {
    id?: string;
    nome?: string;
    telefone?: string;
    email?: string;
  } | null;
  [key: string]: any;
}

export interface Disciplina {
  id: string;
  nome: string;
  codigo?: string;
  cor?: string;
  descricao?: string;
  ativa?: boolean;
  turma_id: string;
  professor_id: string;
  criado_em: string;
}

export interface Nota {
  id: string;
  aluno_id: string;
  disciplina_id: string;
  trimestre: number;
  nota: number;
  comentario?: string;
  criado_em: string;
  aluno?: Aluno;
  disciplina?: Disciplina;
  // Campos adicionais utilizados em telas específicas
  tipo?: string;
  data_lancamento?: string;
  observacoes?: string;
  [key: string]: any;
}

export interface PeriodoLetivo {
  id: string;
  nome: string;
  tipo: 'bimestre' | 'trimestre' | 'semestre' | 'anual';
  data_inicio: string;
  data_fim: string;
  ano_letivo: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface ProvaTarefa {
  id: string;
  disciplina_id: string;
  titulo: string;
  tipo: 'prova' | 'tarefa';
  data: string;
  descricao?: string;
  criado_em: string;
  disciplina?: Disciplina;
  valor?: number; // pontuação máxima (UI)
  [key: string]: any;
}

export interface Material {
  id: string;
  disciplina_id: string;
  titulo: string;
  tipo: 'pdf' | 'video' | 'link';
  arquivo_url?: string;
  descricao?: string;
  criado_em: string;
  disciplina?: Disciplina;
}

export interface Recado {
  id: string;
  titulo: string;
  conteudo: string;
  data_envio: string;
  destinatario_tipo: 'aluno' | 'turma' | 'geral';
  destinatario_id?: string | null;
  enviado_por: string;
  autor?: Usuario;
  remetente?: { nome?: string } | null;
  anexos?: { id?: string; nome?: string; url?: string }[];
  [key: string]: any;
}

export interface Presenca {
  id: string;
  aluno_id: string;
  data_aula: string;
  presente: boolean;
  disciplina_id: string;
  criado_em: string;
  aluno?: Aluno;
  disciplina?: Disciplina;
  [key: string]: any;
}

export interface Visualizacao {
  id: string;
  usuario_id: string;
  item_tipo: 'recado' | 'prova_tarefa' | 'material';
  item_id: string;
  visualizado_em: string;
  ip_address?: string;
  user_agent?: string;
  criado_em: string;
  usuario?: Usuario;
  [key: string]: any;
}

export interface HorarioAula {
  id: string;
  turma_id: string;
  disciplina_id: string;
  professor_id?: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  sala?: string;
  observacoes?: string;
  ativo: boolean;
  criado_em: string;
  disciplina?: Disciplina;
  professor?: Usuario;
  [key: string]: any;
}

export interface TurmaDisciplina {
  id: string;
  turma_id: string;
  disciplina_id: string;
  professor_id?: string;
  carga_horaria_semanal: number;
  ativa: boolean;
  criado_em: string;
  disciplina?: Disciplina;
  professor?: Usuario;
  [key: string]: any;
}

// Decisão final de ano para alunos (após conclusão do ano letivo)
export interface DecisaoFinal {
  id: string;
  aluno_id: string;
  ano_letivo: number;
  status_final: 'pendente' | 'aprovado' | 'reprovado' | 'aprovado_conselho';
  justificativa?: string | null;
  decidido_por?: string | null; // usuario.id
  decidido_em?: string | null; // ISO
  created_at: string;
  updated_at: string;
  aluno?: Aluno;
  decidido_por_usuario?: Usuario;
  [key: string]: any;
}
