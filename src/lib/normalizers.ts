import type { Nota, ProvaTarefa, Recado, Usuario, Aluno, Disciplina, Material } from './supabase.types';

/*
  Centraliza funções de normalização para garantir que objetos vindos
  - do Supabase (com embeddeds / campos opcionais)
  - de um banco local/offline
  - ou de mocks
  tenham formato consistente para a UI.

  Regras gerais:
  - Datas sempre string ISO (ou undefined)
  - Campos numéricos com fallback sensato (ex: nota = 0)
  - Relacionamentos embutidos (aluno, disciplina, autor) renomeados para nomes de uso na UI quando necessário
  - Evita espalhar (obj as any) e optional chaining excessivo em toda a aplicação
*/

// Helpers ------------------------------------------------------------------
const toNumber = (value: any, fallback = 0): number => {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

const toDateString = (value: any): string | undefined => {
  if (!value) return undefined;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  } catch {
    return undefined;
  }
};

// Nota ---------------------------------------------------------------------
export const normalizeNota = (raw: any): Nota => {
  if (!raw) return raw as Nota;
  const notaValue = raw.nota != null ? toNumber(raw.nota, 0) : 0;
  const trimestreValue = raw.trimestre != null ? toNumber(raw.trimestre, 1) : 1;
  return {
    id: raw.id,
    aluno_id: raw.aluno_id ?? raw.alunoId,
    disciplina_id: raw.disciplina_id ?? raw.disciplinaId,
    nota: notaValue,
    comentario: raw.comentario ?? raw.observacoes ?? raw.comentario_nota,
    trimestre: trimestreValue,
    tipo: raw.tipo || raw.categoria || undefined,
    data_lancamento: toDateString(raw.data_lancamento || raw.lancada_em || raw.created_at),
    criado_em: raw.criado_em || raw.created_at || toDateString(new Date())!,
    aluno: raw.aluno,
    disciplina: raw.disciplina,
  } as Nota;
};

// Prova / Tarefa -----------------------------------------------------------
export const normalizeProvaTarefa = (raw: any): ProvaTarefa => {
  if (!raw) return raw as ProvaTarefa;
  return {
    id: raw.id,
    disciplina_id: raw.disciplina_id ?? raw.disciplinaId,
    titulo: raw.titulo || raw.nome || 'Avaliação',
    descricao: raw.descricao || raw.detalhes || undefined,
    tipo: raw.tipo === 'tarefa' || raw.tipo === 'prova' ? raw.tipo : (raw.tipo_avaliacao || 'prova'),
    data: toDateString(raw.data || raw.data_entrega || raw.data_prova)!,
    valor: raw.valor != null ? toNumber(raw.valor, undefined as unknown as number) : undefined,
    criado_em: raw.criado_em || raw.created_at || toDateString(new Date())!,
    disciplina: raw.disciplina,
  } as ProvaTarefa;
};

// Recado -------------------------------------------------------------------
export interface RecadoNormalizado extends Recado {
  remetente?: Usuario; // alias para autor
  anexos?: Array<{ id?: string; nome?: string; url?: string }>;
}

export const normalizeRecado = (raw: any): RecadoNormalizado => {
  if (!raw) return raw as RecadoNormalizado;
  const autor = raw.autor || raw.remetente || raw.usuario || undefined;
  const anexos = Array.isArray(raw.anexos)
    ? raw.anexos.map((a: any) => ({ id: a.id, nome: a.nome || a.filename || a.name, url: a.url }))
    : undefined;
  return {
    id: raw.id,
    titulo: raw.titulo || raw.assunto || 'Recado',
    conteudo: raw.conteudo || raw.mensagem || raw.texto || '',
    destinatario_tipo: raw.destinatario_tipo || raw.tipo_destinatario || 'geral',
    destinatario_id: raw.destinatario_id || raw.id_destinatario || undefined,
    enviado_por: raw.enviado_por || autor?.id || raw.usuario_id,
    data_envio: toDateString(raw.data_envio || raw.enviado_em || raw.created_at)!,
    criado_em: raw.criado_em || raw.created_at || toDateString(new Date())!,
    autor, // original embed se existir
    remetente: autor, // alias amigável para UI
    anexos,
  } as RecadoNormalizado;
};

// Aluno --------------------------------------------------------------------
export const normalizeAluno = (raw: any): Aluno => {
  if (!raw) return raw as Aluno;
  return {
    id: raw.id,
    nome: raw.nome,
    turma_id: raw.turma_id ?? raw.turmaId,
    responsavel_id: raw.responsavel_id ?? raw.responsavelId,
    data_nascimento: raw.data_nascimento || raw.nascimento || undefined,
    cpf: raw.cpf || raw.documento || undefined,
    matricula: raw.matricula || raw.codigo_matricula || undefined,
    criado_em: raw.criado_em || raw.created_at || toDateString(new Date())!,
    turma: raw.turma,
    responsavel: raw.responsavel,
  } as Aluno;
};

// Material -----------------------------------------------------------------
export const normalizeMaterial = (raw: any): Material => {
  if (!raw) return raw as Material;
  // Derivar tipo (fallback para 'pdf') usando heurísticas simples
  const url = raw.url || raw.link || raw.arquivo_url;
  let tipo: Material['tipo'] = 'pdf';
  if (raw.tipo && ['pdf', 'video', 'link'].includes(raw.tipo)) {
    tipo = raw.tipo;
  } else if (url) {
    if (/youtube|vimeo|\.mp4$/i.test(url)) tipo = 'video';
    else if (/^https?:\/\//i.test(url) && !/\.pdf$/i.test(url)) tipo = 'link';
  }
  return {
    id: raw.id,
    disciplina_id: raw.disciplina_id ?? raw.disciplinaId,
    titulo: raw.titulo || raw.nome || 'Material',
    tipo,
    arquivo_url: url,
    descricao: raw.descricao || raw.detalhes || undefined,
    criado_em: raw.criado_em || raw.created_at || toDateString(new Date())!,
    disciplina: raw.disciplina,
  } as Material;
};

// Disciplina ---------------------------------------------------------------
export const normalizeDisciplina = (raw: any): Disciplina => {
  if (!raw) return raw as Disciplina;
  return {
    id: raw.id,
    nome: raw.nome || raw.titulo || 'Disciplina',
    turma_id: raw.turma_id ?? raw.turmaId,
    professor_id: raw.professor_id ?? raw.professorId,
    cor: raw.cor || raw.color || undefined,
    criado_em: raw.criado_em || raw.created_at || toDateString(new Date())!,
    turma: raw.turma,
    professor: raw.professor,
  } as Disciplina;
};

// Coleções -----------------------------------------------------------------
export const normalizeNotas = (list: any[]): Nota[] => list.map(normalizeNota);
export const normalizeProvasTarefas = (list: any[]): ProvaTarefa[] => list.map(normalizeProvaTarefa);
export const normalizeRecados = (list: any[]): RecadoNormalizado[] => list.map(normalizeRecado);
export const normalizeAlunos = (list: any[]): Aluno[] => list.map(normalizeAluno);
export const normalizeMateriais = (list: any[]): Material[] => list.map(normalizeMaterial);
export const normalizeDisciplinas = (list: any[]): Disciplina[] => list.map(normalizeDisciplina);

// Pipeline utilitário genérico ---------------------------------------------
export const withIndex = <T extends { id?: string }>(list: T[]): (T & { _idx: number })[] =>
  list.map((item, i) => ({ ...item, _idx: i }));

// Exemplo de uso (documentação rápida):
// const notasUI = withIndex(normalizeNotas(rawNotas));
// const recadosUI = normalizeRecados(rawRecados).filter(r => r.destinatario_tipo === 'geral');
