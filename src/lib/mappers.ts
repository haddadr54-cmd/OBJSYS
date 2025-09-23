// Centralized mapping between offline (localDB) shapes and online (Supabase) shapes
// This reduces duplicated ad-hoc conversions scattered across components and dataService.
// Add new mappings here as entities evolve.

import type { Nota, Recado, Material, ProvaTarefa } from './supabase';

// Offline nota shape example (value guessing from current localDatabase usage):
// { id, aluno_id, disciplina_id, bimestre, valor, descricao, criado_em }
export const mapOfflineNotaToOnline = (n: any): Nota => ({
  id: n.id,
  aluno_id: n.aluno_id,
  disciplina_id: n.disciplina_id,
  trimestre: n.bimestre,
  nota: n.valor,
  comentario: n.descricao,
  criado_em: n.criado_em
});

export const applyNotaUpdatesOffline = (offline: any, updates: Partial<Pick<Nota,'nota'|'comentario'|'trimestre'>>) => {
  if (updates.nota !== undefined) offline.valor = updates.nota;
  if (updates.comentario !== undefined) offline.descricao = updates.comentario;
  if (updates.trimestre !== undefined) offline.bimestre = updates.trimestre;
  return offline;
};

// Offline recado shape: { id, titulo, conteudo, data_envio|criado_em, tipo('individual'|'turma'|'geral'), aluno_id|turma_id, autor_id }
export const mapOfflineRecadoToOnline = (r: any): Recado => ({
  id: r.id,
  titulo: r.titulo,
  conteudo: r.conteudo,
  data_envio: r.data_envio || r.criado_em,
  destinatario_tipo: r.tipo === 'individual' ? 'aluno' : (r.tipo === 'turma' ? 'turma' : 'geral'),
  destinatario_id: r.aluno_id || r.turma_id,
  enviado_por: r.autor_id,
  autor: undefined
});

// Offline material shape: { id, disciplina_id, titulo, tipo, url, descricao, criado_em }
export const mapOfflineMaterialToOnline = (m: any): Material => ({
  id: m.id,
  disciplina_id: m.disciplina_id,
  titulo: m.titulo,
  tipo: m.tipo === 'imagem' ? 'link' : m.tipo,
  arquivo_url: m.url,
  descricao: m.descricao,
  criado_em: m.criado_em
});

// Offline prova/tarefa shape: { id, disciplina_id, titulo, tipo('prova'|'tarefa'), data_entrega, descricao, criado_em }
export const mapOfflineProvaTarefaToOnline = (p: any): ProvaTarefa => ({
  id: p.id,
  disciplina_id: p.disciplina_id,
  titulo: p.titulo,
  tipo: p.tipo === 'prova' ? 'prova' : 'tarefa',
  data: p.data_entrega,
  descricao: p.descricao,
  criado_em: p.criado_em
});

export const offlineMappers = {
  nota: mapOfflineNotaToOnline,
  recado: mapOfflineRecadoToOnline,
  material: mapOfflineMaterialToOnline,
  provaTarefa: mapOfflineProvaTarefaToOnline
};
