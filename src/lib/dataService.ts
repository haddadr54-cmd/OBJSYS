// Offline DB direct imports (localDatabase.ts) vs online Supabase (supabase.ts, both are 
import { localDB } from './localDatabase';
import type { Usuario, Aluno, Turma, Disciplina, Nota, ProvaTarefa, Material, Recado, Presenca, PeriodoLetivo, DecisaoFinal } from './supabase.types';
import { getPermissionsForRole } from './permissions';
import { 
  mapOfflineNotaToOnline,
  mapOfflineRecadoToOnline,
  mapOfflineMaterialToOnline,
  mapOfflineProvaTarefaToOnline
} from './mappers';

// Interface para controle de permissões
// Using central permissions module now (legacy interface kept for backward compatibility types)
type LegacyPermission = ReturnType<typeof getPermissionsForRole>;
type UserPermissions = LegacyPermission;

// Classe principal para gerenciamento centralizado de dados
// Cache simples para evitar múltiplos dynamic imports simultâneos do mesmo módulo
let supabaseModulePromise: Promise<typeof import('./supabase')> | null = null;
function loadSupabaseModule() {
  if (!supabaseModulePromise) {
    supabaseModulePromise = import('./supabase');
  }
  return supabaseModulePromise;
}



class DataService {
  private user: Usuario | null = null;
  private permissions: UserPermissions; // migrating to centralized permissions
  private isSupabaseConnected: boolean;

  constructor(user: Usuario | null, isSupabaseConnected: boolean = false) {
    this.user = user;
    this.isSupabaseConnected = isSupabaseConnected;
  // Prefer centralized permissions module; fallback to legacy
  this.permissions = user ? (getPermissionsForRole(user.tipo_usuario) as any) : (getPermissionsForRole('') as any);
  }

  // Função auxiliar para converter dados do localDB para formato Supabase
  private convertLocalAlunosToSupabaseFormat(localAlunos: any[]): Aluno[] {
    return localAlunos.map(aluno => ({
      ...aluno,
      responsavel: aluno.responsavel ? {
        id: aluno.responsavel_id,
        nome: aluno.responsavel,
        telefone: aluno.telefone_responsavel,
        email: aluno.email_responsavel
      } : null
    }));
  }

  // Método para verificar permissões
  private checkPermission(permission: keyof UserPermissions): boolean {
    return this.permissions[permission];
  }

  // Método para lançar erro de permissão
  private throwPermissionError(action: string): never {
    throw new Error(`Usuário não tem permissão para: ${action}`);
  }

  // ==================== USUÁRIOS ====================
  async getUsuarios(): Promise<Usuario[]> {
    if (!this.checkPermission('canViewAllUsers')) {
      this.throwPermissionError('visualizar todos os usuários');
    }

    if (this.isSupabaseConnected) {
  const { getAllUsuarios } = await loadSupabaseModule();
      return await getAllUsuarios();
    } else {
      return localDB.getUsuarios();
    }
  }

  async createUsuario(userData: Omit<Usuario, 'id' | 'criado_em'>): Promise<Usuario | null> {
    if (!this.checkPermission('canCreateUsers')) {
      this.throwPermissionError('criar usuários');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

  const { createUsuario } = await loadSupabaseModule();
    return await createUsuario(userData);
  }

  async updateUsuario(id: string, updates: Partial<Usuario>): Promise<Usuario | null> {
    if (!this.checkPermission('canEditUsers')) {
      this.throwPermissionError('editar usuários');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

  const { updateUsuario } = await loadSupabaseModule();
    return await updateUsuario(id, updates);
  }

  async deleteUsuario(id: string): Promise<boolean> {
    if (!this.checkPermission('canDeleteUsers')) {
      this.throwPermissionError('excluir usuários');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

  const { deleteUsuario } = await loadSupabaseModule();
    return await deleteUsuario(id);
  }

  // ==================== ALUNOS ====================
  async getAlunos(): Promise<Aluno[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
  const { getAllAlunos, getAlunosByResponsavel, getTurmasByProfessor } = await loadSupabaseModule();
      
      if (this.permissions.canViewAllStudents) {
        // Admin vê todos os alunos
        return await getAllAlunos();
      } else if (this.user.tipo_usuario === 'professor') {
        // Professor vê apenas alunos das suas turmas
        const turmas = await getTurmasByProfessor(this.user.id);
        const turmaIds = turmas.map(t => t.id);
        const todosAlunos = await getAllAlunos();
        return todosAlunos.filter(a => turmaIds.includes(a.turma_id));
      } else if (this.user.tipo_usuario === 'pai') {
        // Pai vê apenas seus filhos
        return await getAlunosByResponsavel(this.user.id);
      }
    } else {
      const { localDB } = await import('./localDatabase');
      let localAlunos: any[] = [];
      
      if (this.permissions.canViewAllStudents) {
        localAlunos = localDB.getAlunos();
      } else if (this.user.tipo_usuario === 'professor') {
        const turmas = localDB.getTurmasByProfessor(this.user.id);
        const turmaIds = turmas.map(t => t.id);
        localAlunos = localDB.getAlunos().filter(a => turmaIds.includes(a.turma_id));
      } else if (this.user.tipo_usuario === 'pai') {
        localAlunos = localDB.getAlunosByResponsavel(this.user.id);
      }

      // Converter formato local para formato Supabase
      return this.convertLocalAlunosToSupabaseFormat(localAlunos);
    }

    return [];
  }

  async createAluno(alunoData: Omit<Aluno, 'id' | 'criado_em'>): Promise<Aluno | null> {
    if (!this.checkPermission('canCreateStudents')) {
      this.throwPermissionError('criar alunos');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

  const { createAluno } = await loadSupabaseModule();
    return await createAluno(alunoData);
  }

  async updateAluno(id: string, updates: Partial<Aluno>): Promise<Aluno | null> {
    if (!this.checkPermission('canEditStudents')) {
      this.throwPermissionError('editar alunos');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

  const { updateAluno } = await loadSupabaseModule();
    return await updateAluno(id, updates);
  }

  async deleteAluno(id: string): Promise<boolean> {
    if (!this.checkPermission('canDeleteStudents')) {
      this.throwPermissionError('excluir alunos');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

  const { deleteAluno } = await loadSupabaseModule();
    return await deleteAluno(id);
  }

  // ==================== TURMAS ====================
  async getTurmas(): Promise<Turma[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
  const { getAllTurmas, getTurmasByProfessor, getAlunosByResponsavel } = await loadSupabaseModule();
      
      if (this.permissions.canViewAllClasses) {
        // Admin vê todas as turmas
        return await getAllTurmas();
      } else if (this.user.tipo_usuario === 'professor') {
        // Professor vê apenas suas turmas
        return await getTurmasByProfessor(this.user.id);
      } else if (this.user.tipo_usuario === 'pai') {
        // Pai vê apenas turmas dos filhos
        const alunos = await getAlunosByResponsavel(this.user.id);
        const turmaIds = [...new Set(alunos.map(a => a.turma_id))];
        const todasTurmas = await getAllTurmas();
        return todasTurmas.filter(t => turmaIds.includes(t.id));
      }
    } else {
      const { localDB } = await import('./localDatabase');
      if (this.permissions.canViewAllClasses) {
        return localDB.getTurmas();
      } else if (this.user.tipo_usuario === 'professor') {
        return localDB.getTurmasByProfessor(this.user.id);
      } else if (this.user.tipo_usuario === 'pai') {
        const alunos = localDB.getAlunosByResponsavel(this.user.id);
        const turmaIds = [...new Set(alunos.map(a => a.turma_id))];
        return localDB.getTurmas().filter(t => turmaIds.includes(t.id));
      }
    }

    return [];
  }

  async createTurma(turmaData: Omit<Turma, 'id' | 'criado_em'>): Promise<Turma | null> {
    if (!this.checkPermission('canCreateClasses')) {
      this.throwPermissionError('criar turmas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

  const { createTurma } = await loadSupabaseModule();
    // Remove professor_id as it doesn't exist in the Supabase schema
    const { professor_id, ...supabaseData } = turmaData as any;
    return await createTurma(supabaseData);
  }

  async updateTurma(id: string, updates: Partial<Turma>): Promise<Turma | null> {
    if (!this.checkPermission('canEditClasses')) {
      this.throwPermissionError('editar turmas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

  const { updateTurma } = await loadSupabaseModule();
    // Remove professor_id as it doesn't exist in the Supabase schema
    const { professor_id, ...supabaseUpdates } = updates as any;
    return await updateTurma(id, supabaseUpdates);
  }

  async deleteTurma(id: string): Promise<boolean> {
    if (!this.checkPermission('canDeleteClasses')) {
      this.throwPermissionError('excluir turmas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

  const { deleteTurma } = await loadSupabaseModule();
    return await deleteTurma(id);
  }

  // ==================== DISCIPLINAS ====================
  async getDisciplinas(): Promise<Disciplina[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
  const { getAllDisciplinas, getAlunosByResponsavel } = await loadSupabaseModule();
      
      if (this.permissions.canViewAllSubjects) {
        // Admin vê todas as disciplinas
        return await getAllDisciplinas();
      } else if (this.user.tipo_usuario === 'professor') {
        // Professor vê apenas suas disciplinas
        const todasDisciplinas = await getAllDisciplinas();
        return todasDisciplinas.filter(d => d.professor_id === this.user!.id);
      } else if (this.user.tipo_usuario === 'pai') {
        // Pai vê apenas disciplinas das turmas dos filhos
        const alunos = await getAlunosByResponsavel(this.user.id);
        const turmaIds = [...new Set(alunos.map(a => a.turma_id))];
        const todasDisciplinas = await getAllDisciplinas();
        return todasDisciplinas.filter(d => turmaIds.includes(d.turma_id));
      }
    } else {
      const mapDisciplina = (d: any): Disciplina => ({
        id: d.id,
        nome: d.nome,
        codigo: d.codigo,
        cor: d.cor,
        descricao: d.descricao,
        ativa: d.ativa,
        turma_id: d.turma_id || 'offline-turma',
        professor_id: d.professor_id || 'offline-prof',
        criado_em: d.criado_em
      });
      const todas = localDB.getDisciplinas().map(mapDisciplina);
      if (this.permissions.canViewAllSubjects) return todas;
      if (this.user.tipo_usuario === 'professor') return todas.filter(d => d.professor_id === this.user!.id || d.professor_id.startsWith('offline'));
      if (this.user.tipo_usuario === 'pai') {
        const alunos = localDB.getAlunosByResponsavel(this.user.id);
        const turmaIds = new Set(alunos.map(a => a.turma_id));
        return todas.filter(d => turmaIds.has(d.turma_id));
      }
    }

    return [];
  }

  async createDisciplina(disciplinaData: Omit<Disciplina, 'id' | 'criado_em'>): Promise<Disciplina | null> {
    if (!this.checkPermission('canCreateSubjects')) {
      this.throwPermissionError('criar disciplinas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

  const { createDisciplina } = await loadSupabaseModule();
    return await createDisciplina(disciplinaData);
  }

  async updateDisciplina(id: string, updates: Partial<Disciplina>): Promise<Disciplina | null> {
    if (!this.checkPermission('canEditSubjects')) {
      this.throwPermissionError('editar disciplinas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

  const { updateDisciplina } = await loadSupabaseModule();
    return await updateDisciplina(id, updates);
  }

  async deleteDisciplina(id: string): Promise<boolean> {
    if (!this.checkPermission('canDeleteSubjects')) {
      this.throwPermissionError('excluir disciplinas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

  const { deleteDisciplina } = await loadSupabaseModule();
    return await deleteDisciplina(id);
  }

  // ==================== NOTAS ====================
  async getNotas(): Promise<Nota[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
  const { getAllNotas, getNotasByProfessor, getAlunosByResponsavel, getNotasByAluno } = await loadSupabaseModule();
      
      if (this.permissions.canViewAllGrades) {
        // Admin vê todas as notas
        return await getAllNotas();
      } else if (this.user.tipo_usuario === 'professor') {
        // Professor vê apenas notas que lançou
        return await getNotasByProfessor(this.user.id);
      } else if (this.user.tipo_usuario === 'pai') {
        // Pai vê apenas notas dos filhos
        const alunos = await getAlunosByResponsavel(this.user.id);
        const todasNotas: Nota[] = [];
        for (const aluno of alunos) {
          const notasAluno = await getNotasByAluno(aluno.id);
          todasNotas.push(...notasAluno);
        }
        return todasNotas;
      }
    } else {
      const todas = localDB.getNotas().map(mapOfflineNotaToOnline);
      if (this.permissions.canViewAllGrades) return todas;
      if (this.user.tipo_usuario === 'professor') return todas; // offline simplificação
      if (this.user.tipo_usuario === 'pai') {
        const alunos = localDB.getAlunosByResponsavel(this.user.id);
        const alunoIds = new Set(alunos.map(a => a.id));
        console.log('👨‍👩‍👧‍👦 [DataService] Carregando notas para pai:', {
          alunos: alunos.length,
          totalNotas: todas.length
        });
        const notasFiltradas = todas.filter(n => alunoIds.has(n.aluno_id));
        console.log('👨‍👩‍👧‍👦 [DataService] Notas encontradas:', notasFiltradas.length);
        return notasFiltradas;
      }
    }

    return [];
  }

  async createNota(notaData: Omit<Nota, 'id' | 'criado_em'>): Promise<Nota | null> {
    if (!this.checkPermission('canCreateGrades')) {
      this.throwPermissionError('criar notas');
    }

    if (!this.isSupabaseConnected) {
      // Offline support: persist nota in localDB and map back to online shape
      // Map Nota (online) -> localDatabase.Nota (offline)
      const offlinePayload: any = {
        aluno_id: notaData.aluno_id,
        disciplina_id: notaData.disciplina_id,
        professor_id: this.user?.id || 'offline-prof',
        valor: notaData.nota,
        tipo: (notaData as any).tipo || 'prova',
        descricao: notaData.comentario || '',
        data_lancamento: new Date().toISOString().slice(0, 10),
        bimestre: typeof notaData.trimestre === 'number' ? notaData.trimestre : 0
      };
      const created = localDB.createNota(offlinePayload);
      // Map offline -> online Nota
      return mapOfflineNotaToOnline(created);
    }

  const { createNota } = await loadSupabaseModule();
    return await createNota(notaData);
  }

  // Atualizar nota (admin ou professor responsável). No offline qualquer professor/admin pode.
  async updateNota(
    notaId: string,
    updates: Partial<Pick<Nota, 'nota' | 'comentario' | 'trimestre'>>
  ): Promise<Nota | null> {
    if (!this.user || (this.user.tipo_usuario !== 'admin' && this.user.tipo_usuario !== 'professor')) {
      this.throwPermissionError('editar notas');
    }

    // Validações básicas
    if (updates.nota !== undefined) {
      if (typeof updates.nota !== 'number' || isNaN(updates.nota) || updates.nota < 0 || updates.nota > 10) {
        throw new Error('Valor de nota inválido (0-10).');
      }
    }
    if (updates.trimestre !== undefined) {
      if (typeof updates.trimestre !== 'number' || updates.trimestre < 1 || updates.trimestre > 4) {
        throw new Error('Trimestre inválido (1-4).');
      }
    }

    if (this.isSupabaseConnected) {
  const { editarNota } = await loadSupabaseModule();
      return await editarNota(
        notaId,
        updates,
        { id: this.user.id, tipo_usuario: this.user.tipo_usuario }
      );
    } else {
      // Offline: atualizar diretamente no localDB
      const offlineNotas: any[] = localDB.getNotas();
      const idx = offlineNotas.findIndex(n => n.id === notaId);
      if (idx === -1) return null;
      const current = offlineNotas[idx];
      if (updates.nota !== undefined) current.valor = updates.nota;
      if (updates.comentario !== undefined) current.descricao = updates.comentario;
      if (updates.trimestre !== undefined) current.bimestre = updates.trimestre;
      // Persistir
      localStorage.setItem('schoolSystemData', JSON.stringify((localDB as any).data));
      // Mapear para shape Nota
      const mapped: Nota = {
        id: current.id,
        aluno_id: current.aluno_id,
        disciplina_id: current.disciplina_id,
        trimestre: current.bimestre,
        nota: current.valor,
        comentario: current.descricao,
        criado_em: current.criado_em
      };
      return mapped;
    }
  }

  // Excluir nota
  async deleteNota(notaId: string): Promise<boolean> {
    if (!this.user || (this.user.tipo_usuario !== 'admin' && this.user.tipo_usuario !== 'professor')) {
      this.throwPermissionError('excluir notas');
    }

    if (this.isSupabaseConnected) {
  const { deleteNota } = await loadSupabaseModule();
      return await deleteNota(notaId, { id: this.user.id, tipo_usuario: this.user.tipo_usuario });
    } else {
      const offlineNotas: any[] = localDB.getNotas();
      const idx = offlineNotas.findIndex(n => n.id === notaId);
      if (idx === -1) return false;
      offlineNotas.splice(idx, 1);
      localStorage.setItem('schoolSystemData', JSON.stringify((localDB as any).data));
      return true;
    }
  }

  // ==================== PROVAS/TAREFAS ====================
  async getProvasTarefas(): Promise<ProvaTarefa[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
  const { getAllProvasTarefas, getAlunosByResponsavel } = await loadSupabaseModule();
      
      const todasProvas = await getAllProvasTarefas();
      
      if (this.user.tipo_usuario === 'admin') {
        // Admin vê todas as provas/tarefas
        return todasProvas;
      } else if (this.user.tipo_usuario === 'professor') {
        // Professor vê apenas suas provas/tarefas
        return todasProvas.filter(p => {
          const disciplina = p.disciplina;
          return disciplina && disciplina.professor_id === this.user!.id;
        });
      } else if (this.user.tipo_usuario === 'pai') {
        // Pai vê apenas provas/tarefas das turmas dos filhos
        const alunos = await getAlunosByResponsavel(this.user.id);
        const turmaIds = alunos.map(a => a.turma_id);
        return todasProvas.filter(p => {
          const disciplina = p.disciplina;
          return disciplina && turmaIds.includes(disciplina.turma_id);
        });
      }
    } else {
      const todas = localDB.getProvasTarefas().map(mapOfflineProvaTarefaToOnline);
      if (this.user.tipo_usuario === 'admin') return todas;
      if (this.user.tipo_usuario === 'professor') return todas;
      if (this.user.tipo_usuario === 'pai') return todas; // simplificação offline
    }

    return [];
  }

  async createProvaTarefa(provaData: Omit<ProvaTarefa, 'id' | 'criado_em'>): Promise<ProvaTarefa | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('criar provas/tarefas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

  const { createProvaTarefa } = await loadSupabaseModule();
    return await createProvaTarefa(provaData);
  }

  async updateProvaTarefa(id: string, updates: Partial<ProvaTarefa>): Promise<ProvaTarefa | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('editar provas/tarefas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

  const { updateProvaTarefa } = await loadSupabaseModule();
    return await updateProvaTarefa(id, updates);
  }

  async deleteProvaTarefa(id: string): Promise<boolean> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('excluir provas/tarefas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

  const { deleteProvaTarefa } = await loadSupabaseModule();
    return await deleteProvaTarefa(id);
  }

  // ==================== MATERIAIS ====================
  async getMateriais(): Promise<Material[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
  const { getAllMateriais, getAlunosByResponsavel } = await loadSupabaseModule();
      
      const todosMateriais = await getAllMateriais();
      
      if (this.user.tipo_usuario === 'admin') {
        // Admin vê todos os materiais
        return todosMateriais;
      } else if (this.user.tipo_usuario === 'professor') {
        // Professor vê apenas seus materiais
        return todosMateriais.filter(m => {
          const disciplina = m.disciplina;
          return disciplina && disciplina.professor_id === this.user!.id;
        });
      } else if (this.user.tipo_usuario === 'pai') {
        // Pai vê apenas materiais das turmas dos filhos
        const alunos = await getAlunosByResponsavel(this.user.id);
        const turmaIds = alunos.map(a => a.turma_id);
        return todosMateriais.filter(m => {
          const disciplina = m.disciplina;
          return disciplina && turmaIds.includes(disciplina.turma_id);
        });
      }
    } else {
      const { localDB } = await import('./localDatabase');
      const todosMateriais = localDB.getMateriais().map(mapOfflineMaterialToOnline);
      return todosMateriais; // Simplificação offline
    }

    return [];
  }

  async createMaterial(materialData: Omit<Material, 'id' | 'criado_em'>): Promise<Material | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('criar materiais');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

  const { createMaterial } = await loadSupabaseModule();
    return await createMaterial(materialData);
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<Material | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('editar materiais');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

  const { updateMaterial } = await loadSupabaseModule();
    return await updateMaterial(id, updates);
  }

  async deleteMaterial(id: string): Promise<boolean> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('excluir materiais');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

  const { deleteMaterial } = await loadSupabaseModule();
    return await deleteMaterial(id);
  }

  // ==================== RECADOS ====================
  async getRecados(): Promise<Recado[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
  const { getRecadosForUser } = await loadSupabaseModule();
      return await getRecadosForUser(this.user.id, this.user.tipo_usuario);
    } else {
      const { localDB } = await import('./localDatabase');
      return localDB.getRecados().map(mapOfflineRecadoToOnline);
    }
  }

  async createRecado(recadoData: Omit<Recado, 'id' | 'data_envio'>): Promise<Recado | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('criar recados');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

  const { createRecado } = await loadSupabaseModule();
    return await createRecado(recadoData);
  }

  async updateRecado(id: string, updates: Partial<Recado>): Promise<Recado | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('editar recados');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

  const { updateRecado } = await loadSupabaseModule();
    return await updateRecado(id, updates);
  }

  async deleteRecado(id: string): Promise<boolean> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('excluir recados');
    }
    if (this.isSupabaseConnected) {
  const { deleteRecado } = await loadSupabaseModule();
      return await deleteRecado(id);
    } else {
      const { localDB } = await import('./localDatabase');
      return localDB.deleteRecado(id);
    }
  }

  async bulkDeleteRecados(ids: string[]): Promise<{ successIds: string[]; failedIds: string[] }> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('excluir recados');
    }
    if (this.isSupabaseConnected) {
  const { bulkDeleteRecados } = await loadSupabaseModule();
      return await bulkDeleteRecados(ids);
    } else {
      const { localDB } = await import('./localDatabase');
      const successIds: string[] = [];
      const failedIds: string[] = [];
      ids.forEach(id => {
        const ok = localDB.deleteRecado(id);
        if (ok) successIds.push(id); else failedIds.push(id);
      });
      return { successIds, failedIds };
    }
  }

  // ==================== PRESENÇAS ====================
  async getPresencas(): Promise<Presenca[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
  // Futuro: importar funções de presenças específicas quando implementado
      
      if (this.user.tipo_usuario === 'admin') {
        // Admin vê todas as presenças
        // Implementar quando necessário
        return [];
      } else if (this.user.tipo_usuario === 'professor') {
        // Professor vê presenças das suas turmas
        // Implementar quando necessário
        return [];
      } else if (this.user.tipo_usuario === 'pai') {
        // Implementação futura para presenças de filhos via Supabase
        return [];
      }
    } else {
      if (this.user.tipo_usuario === 'admin') {
        return localDB.getPresencas();
      } else if (this.user.tipo_usuario === 'professor') {
        return localDB.getPresencas().filter(p => p.professor_id === this.user!.id);
      } else if (this.user.tipo_usuario === 'pai') {
        const alunos = localDB.getAlunosByResponsavel(this.user.id);
        const alunoIds = alunos.map(a => a.id);
        return localDB.getPresencas().filter(p => alunoIds.includes(p.aluno_id));
      }
    }

    return [];
  }

  async createPresenca(presencaData: Omit<Presenca, 'id' | 'criado_em'>): Promise<Presenca | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('registrar presenças');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

    const { createPresenca } = await loadSupabaseModule();
    return await createPresenca(presencaData);
  }

  async updatePresenca(id: string, updates: Partial<Presenca>): Promise<Presenca | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('atualizar presenças');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

    const { updatePresenca } = await loadSupabaseModule();
    return await updatePresenca(id, updates);
  }

  async getPresencasByTurmaData(turmaId: string, data: string, disciplinaId: string): Promise<Presenca[]> {
    if (!this.user) return [];

    if (!this.checkPermission('canViewAllAttendance')) {
      this.throwPermissionError('visualizar presenças');
    }

    if (this.isSupabaseConnected) {
      const { getPresencasByTurmaData } = await loadSupabaseModule();
      return await getPresencasByTurmaData(turmaId, data, disciplinaId);
    } else {
      // Fallback offline - buscar do localDB
      const presencas = localDB.getPresencas();
      const alunos = localDB.getAlunos();
      
      return presencas.filter(p => {
        const aluno = alunos.find(a => a.id === p.aluno_id);
        return aluno?.turma_id === turmaId && 
               p.data_aula === data && 
               p.disciplina_id === disciplinaId;
      });
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================
  
  // Verificar se usuário pode acessar dados de um aluno específico
  async canAccessStudent(studentId: string): Promise<boolean> {
    if (!this.user) return false;
    
    if (this.permissions.canViewAllStudents) return true;
    
    if (this.user.tipo_usuario === 'pai') {
      const alunos = await this.getAlunos();
      return alunos.some(a => a.id === studentId);
    }
    
    if (this.user.tipo_usuario === 'professor') {
      const alunos = await this.getAlunos();
      return alunos.some(a => a.id === studentId);
    }
    
    return false;
  }

  // Verificar se usuário pode acessar dados de uma turma específica
  async canAccessClass(classId: string): Promise<boolean> {
    if (!this.user) return false;
    
    if (this.permissions.canViewAllClasses) return true;
    
    const turmas = await this.getTurmas();
    return turmas.some(t => t.id === classId);
  }

  // Verificar se usuário pode acessar dados de uma disciplina específica
  async canAccessSubject(subjectId: string): Promise<boolean> {
    if (!this.user) return false;
    
    if (this.permissions.canViewAllSubjects) return true;
    
    const disciplinas = await this.getDisciplinas();
    return disciplinas.some(d => d.id === subjectId);
  }

  // Obter estatísticas baseadas nas permissões do usuário
  async getStats() {
    const [usuarios, alunos, turmas, disciplinas, notas] = await Promise.all([
      this.permissions.canViewAllUsers ? this.getUsuarios().catch(() => []) : [],
      this.getAlunos(),
      this.getTurmas(),
      this.getDisciplinas(),
      this.getNotas()
    ]);

    return {
      totalUsuarios: usuarios.length,
      totalAlunos: alunos.length,
      totalTurmas: turmas.length,
      totalDisciplinas: disciplinas.length,
      totalNotas: notas.length,
      mediaGeral: notas.length > 0 
        ? notas.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notas.length 
        : 0,
      usuariosPorTipo: {
        admin: usuarios.filter(u => u.tipo_usuario === 'admin').length,
        professor: usuarios.filter(u => u.tipo_usuario === 'professor').length,
        pai: usuarios.filter(u => u.tipo_usuario === 'pai').length,
      }
    };
  }

  // Obter permissões do usuário atual
  getPermissions(): UserPermissions {
    return this.permissions;
  }

  // Calcular média de um aluno
  calcularMediaAluno(alunoId: string, notas: Nota[], disciplinaId?: string): number {
    let notasAluno = notas.filter(n => n.aluno_id === alunoId);
    if (disciplinaId) {
      notasAluno = notasAluno.filter(n => n.disciplina_id === disciplinaId);
    }
    if (notasAluno.length === 0) return 0;
    return notasAluno.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notasAluno.length;
  }

  // ==================== DECISÃO FINAL DO ANO ====================

  // Identificar alunos pendentes ao final do ano letivo (média final < média mínima)
  async getAlunosPendentesAno(anoLetivo?: number): Promise<{ aluno: Aluno; mediaGeral: number }[]> {
    const ano = anoLetivo ?? new Date().getFullYear();
    const [alunos, notas] = await Promise.all([this.getAlunos(), this.getNotas()]);

    // filtrar notas do ano
    const notasAno = notas.filter(n => {
      const d = new Date(n.criado_em || n.data_lancamento || new Date());
      return d.getFullYear() === ano;
    });

    // calcular média por aluno (todas disciplinas)
    const resultados: { aluno: Aluno; mediaGeral: number }[] = alunos.map(aluno => {
      const media = this.calcularMediaAluno(aluno.id, notasAno as any);
      return { aluno, mediaGeral: media };
    });

    // média mínima definida em gradeConfig
    const { MEDIA_MINIMA_APROVACAO } = await import('./gradeConfig');
    return resultados.filter(r => r.mediaGeral < MEDIA_MINIMA_APROVACAO);
  }

  // CRUD Decisão Final (requer Supabase)
  async getDecisoesFinais(anoLetivo?: number): Promise<DecisaoFinal[]> {
    if (!this.isSupabaseConnected) return [];
    const { supabase } = await loadSupabaseModule();
    let query = supabase.from('decisoes_finais').select('*');
    if (anoLetivo) query = query.eq('ano_letivo', anoLetivo);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) { console.error('Erro ao buscar decisões finais:', error); return []; }
    return data || [];
  }

  async upsertDecisaoFinal(payload: Omit<DecisaoFinal, 'id'|'created_at'|'updated_at'> & { id?: string }): Promise<DecisaoFinal | null> {
    if (!this.isSupabaseConnected) throw new Error('Operação requer conexão com Supabase.');
    if (!this.user) throw new Error('Usuário não autenticado.');
    const { supabase } = await loadSupabaseModule();
    const row = {
      ...payload,
      decidido_por: payload.decidido_por ?? this.user.id,
      decidido_em: payload.decidido_em ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
    const { data, error } = await supabase
      .from('decisoes_finais')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) { console.error('Erro upsert decisão final:', error); throw error; }
    return data;
  }

  // Alertas para dashboards: alunos pendentes no ano corrente e sem decisão final
  async getAlertasPendenciasFinais(anoLetivo?: number) {
    const ano = anoLetivo ?? new Date().getFullYear();
    const [pendentes, decisoes] = await Promise.all([
      this.getAlunosPendentesAno(ano),
      this.getDecisoesFinais(ano)
    ]);
    const comDecisao = new Set(decisoes.map(d => d.aluno_id));
    const pendentesSemDecisao = pendentes.filter(p => !comDecisao.has(p.aluno.id));
    return {
      ano,
      totalPendentes: pendentes.length,
      totalSemDecisao: pendentesSemDecisao.length,
      pendentesSemDecisao
    };
  }

  // Criar registros 'pendente' para todos os alunos sem decisão no ano
  async seedPendenciasFinais(anoLetivo?: number): Promise<{ created: number }> {
    const ano = anoLetivo ?? new Date().getFullYear();
    if (!this.isSupabaseConnected) {
      // Sem supabase, apenas retorna contagem prevista
      const alertas = await this.getAlertasPendenciasFinais(ano);
      return { created: alertas.totalSemDecisao };
    }
    const alertas = await this.getAlertasPendenciasFinais(ano);
    let created = 0;
    for (const item of alertas.pendentesSemDecisao) {
      await this.upsertDecisaoFinal({
        aluno_id: item.aluno.id,
        ano_letivo: ano,
        status_final: 'pendente',
        justificativa: null,
        decidido_por: this.user?.id ?? null,
        decidido_em: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        id: undefined as any
      } as any);
      created++;
    }
    return { created };
  }

  // ==================== MÉTODOS PARA PERÍODOS LETIVOS ====================

  // Obter todos os períodos letivos
  async getPeriodosLetivos(): Promise<PeriodoLetivo[]> {
    if (!this.isSupabaseConnected) {
      // Para desenvolvimento local, retorna dados mock
      return [
        {
          id: '1',
          nome: '1º Bimestre 2024',
          tipo: 'bimestre',
          data_inicio: '2024-02-01',
          data_fim: '2024-04-15',
          ano_letivo: 2024,
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          nome: '2º Bimestre 2024',
          tipo: 'bimestre',
          data_inicio: '2024-04-16',
          data_fim: '2024-06-30',
          ano_letivo: 2024,
          ativo: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }

    // Com Supabase conectado
    const { supabase } = await loadSupabaseModule();
    const { data, error } = await supabase
      .from('periodos_letivos')
      .select('*')
      .order('ano_letivo', { ascending: false })
      .order('data_inicio', { ascending: true });

    if (error) {
      console.error('Erro ao buscar períodos letivos:', error);
      return [];
    }

    return data || [];
  }

  // Criar novo período letivo
  async createPeriodoLetivo(periodoData: Omit<PeriodoLetivo, 'id' | 'created_at' | 'updated_at'>): Promise<PeriodoLetivo | null> {
    if (!this.permissions.canManageSystem) {
      throw new Error('Sem permissão para criar períodos letivos');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

    const { supabase } = await loadSupabaseModule();
    const { data, error } = await supabase
      .from('periodos_letivos')
      .insert([{
        ...periodoData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar período letivo:', error);
      throw error;
    }

    return data;
  }

  // Atualizar período letivo existente
  async updatePeriodoLetivo(id: string, periodoData: Partial<PeriodoLetivo>): Promise<PeriodoLetivo | null> {
    if (!this.permissions.canManageSystem) {
      throw new Error('Sem permissão para atualizar períodos letivos');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

    const { supabase } = await loadSupabaseModule();
    const { data, error } = await supabase
      .from('periodos_letivos')
      .update({
        ...periodoData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar período letivo:', error);
      throw error;
    }

    return data;
  }

  // Excluir período letivo
  async deletePeriodoLetivo(id: string): Promise<boolean> {
    if (!this.permissions.canManageSystem) {
      throw new Error('Sem permissão para excluir períodos letivos');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

    const { supabase } = await loadSupabaseModule();
    const { error } = await supabase
      .from('periodos_letivos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir período letivo:', error);
      throw error;
    }

    return true;
  }

  // Ativar um período letivo específico (desativa os outros)
  async ativarPeriodoLetivo(id: string): Promise<boolean> {
    if (!this.permissions.canManageSystem) {
      throw new Error('Sem permissão para ativar períodos letivos');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de ativação requer conexão com Supabase. Verifique sua conexão.');
    }

    const { supabase } = await loadSupabaseModule();
    
    // Primeiro desativa todos os períodos
    await supabase
      .from('periodos_letivos')
      .update({ ativo: false, updated_at: new Date().toISOString() });

    // Depois ativa apenas o período selecionado
    const { error } = await supabase
      .from('periodos_letivos')
      .update({ ativo: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao ativar período letivo:', error);
      throw error;
    }

    return true;
  }

  // Obter período letivo ativo atual
  async getPeriodoLetivoAtivo(): Promise<PeriodoLetivo | null> {
    const periodos = await this.getPeriodosLetivos();
    return periodos.find(p => p.ativo) || null;
  }
}

// Factory function para criar instância do DataService
export const createDataService = (user: Usuario | null, isSupabaseConnected: boolean = false): DataService => {
  return new DataService(user, isSupabaseConnected);
};

// Hook para usar o DataService nos componentes
export const useDataService = (user: Usuario | null, isSupabaseConnected: boolean = false): DataService => {
  return createDataService(user, isSupabaseConnected);
};