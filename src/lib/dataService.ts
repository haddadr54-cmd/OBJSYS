import { supabase } from './supabase';
import { localDB } from './localDatabase';
import type { Usuario, Aluno, Turma, Disciplina, Nota, ProvaTarefa, Material, Recado, Presenca } from './supabase';

// Interface para controle de permissões
interface UserPermissions {
  canViewAllUsers: boolean;
  canViewAllStudents: boolean;
  canViewAllClasses: boolean;
  canViewAllSubjects: boolean;
  canViewAllGrades: boolean;
  canViewAllMaterials: boolean;
  canViewAllMessages: boolean;
  canViewAllAttendance: boolean;
  canCreateUsers: boolean;
  canCreateStudents: boolean;
  canCreateClasses: boolean;
  canCreateSubjects: boolean;
  canCreateGrades: boolean;
  canCreateMaterials: boolean;
  canCreateMessages: boolean;
  canEditUsers: boolean;
  canEditStudents: boolean;
  canEditClasses: boolean;
  canEditSubjects: boolean;
  canDeleteUsers: boolean;
  canDeleteStudents: boolean;
  canDeleteClasses: boolean;
  canDeleteSubjects: boolean;
}

// Definir permissões por tipo de usuário
const getPermissions = (userType: string): UserPermissions => {
  switch (userType) {
    case 'admin':
      return {
        canViewAllUsers: true,
        canViewAllStudents: true,
        canViewAllClasses: true,
        canViewAllSubjects: true,
        canViewAllGrades: true,
        canViewAllMaterials: true,
        canViewAllMessages: true,
        canViewAllAttendance: true,
        canCreateUsers: true,
        canCreateStudents: true,
        canCreateClasses: true,
        canCreateSubjects: true,
        canCreateGrades: true,
        canCreateMaterials: true,
        canCreateMessages: true,
        canEditUsers: true,
        canEditStudents: true,
        canEditClasses: true,
        canEditSubjects: true,
        canDeleteUsers: true,
        canDeleteStudents: true,
        canDeleteClasses: true,
        canDeleteSubjects: true,
      };
    case 'professor':
      return {
        canViewAllUsers: false,
        canViewAllStudents: false, // Apenas alunos das suas turmas
        canViewAllClasses: false, // Apenas suas turmas
        canViewAllSubjects: false, // Apenas suas disciplinas
        canViewAllGrades: false, // Apenas notas que lançou
        canViewAllMaterials: false, // Apenas materiais que criou
        canViewAllMessages: false, // Apenas recados que enviou
        canViewAllAttendance: false, // Apenas presença das suas turmas
        canCreateUsers: false,
        canCreateStudents: false,
        canCreateClasses: false,
        canCreateSubjects: false,
        canCreateGrades: true,
        canCreateMaterials: true,
        canCreateMessages: true,
        canEditUsers: false,
        canEditStudents: false,
        canEditClasses: false,
        canEditSubjects: false,
        canDeleteUsers: false,
        canDeleteStudents: false,
        canDeleteClasses: false,
        canDeleteSubjects: false,
      };
    case 'pai':
      return {
        canViewAllUsers: false,
        canViewAllStudents: false, // Apenas seus filhos
        canViewAllClasses: false, // Apenas turmas dos filhos
        canViewAllSubjects: false, // Apenas disciplinas dos filhos
        canViewAllGrades: false, // Apenas notas dos filhos
        canViewAllMaterials: false, // Apenas materiais das turmas dos filhos
        canViewAllMessages: false, // Apenas recados direcionados
        canViewAllAttendance: false, // Apenas presença dos filhos
        canCreateUsers: false,
        canCreateStudents: false,
        canCreateClasses: false,
        canCreateSubjects: false,
        canCreateGrades: false,
        canCreateMaterials: false,
        canCreateMessages: false,
        canEditUsers: false,
        canEditStudents: false,
        canEditClasses: false,
        canEditSubjects: false,
        canDeleteUsers: false,
        canDeleteStudents: false,
        canDeleteClasses: false,
        canDeleteSubjects: false,
      };
    default:
      // Sem permissões por padrão
      return {
        canViewAllUsers: false,
        canViewAllStudents: false,
        canViewAllClasses: false,
        canViewAllSubjects: false,
        canViewAllGrades: false,
        canViewAllMaterials: false,
        canViewAllMessages: false,
        canViewAllAttendance: false,
        canCreateUsers: false,
        canCreateStudents: false,
        canCreateClasses: false,
        canCreateSubjects: false,
        canCreateGrades: false,
        canCreateMaterials: false,
        canCreateMessages: false,
        canEditUsers: false,
        canEditStudents: false,
        canEditClasses: false,
        canEditSubjects: false,
        canDeleteUsers: false,
        canDeleteStudents: false,
        canDeleteClasses: false,
        canDeleteSubjects: false,
      };
  }
};

// Classe principal para gerenciamento centralizado de dados
class DataService {
  private user: Usuario | null = null;
  private permissions: UserPermissions;
  private isSupabaseConnected: boolean;
  private cachedPermissionIds: string[] = [];

  constructor(user: Usuario | null, isSupabaseConnected: boolean = false) {
    this.user = user;
    this.isSupabaseConnected = isSupabaseConnected;
    this.permissions = user ? getPermissions(user.tipo_usuario) : getPermissions('');
  }

  // Carregar permissões do Supabase (quando conectado) ou do localStorage/defaults
  async loadPermissions(): Promise<void> {
    if (!this.user) {
      this.cachedPermissionIds = [];
      return;
    }

    // tentar Supabase primeiro
    if (this.isSupabaseConnected) {
      try {
        const { getPermissionCategories, getUserPermissionOverrides } = await import('./supabase');
        const categories = await getPermissionCategories();
        const matching = categories.find((c: any) => c.id === this.user!.tipo_usuario);
        const overrides = await getUserPermissionOverrides(this.user.id);
        if (matching && Array.isArray(matching.permissions)) {
          this.cachedPermissionIds = Array.from(new Set([...(matching.permissions || []), ...(overrides || [])]));
          return;
        }
      } catch (e) {
        console.warn('Erro ao carregar permissões do Supabase:', e);
      }
    }

    // fallback para localStorage/defaults
    try {
      const savedCategories = localStorage.getItem('userCategories');
      if (savedCategories) {
        const parsed: any[] = JSON.parse(savedCategories);
        const matching = parsed.find(c => c.id === this.user!.tipo_usuario);
        if (matching && Array.isArray(matching.permissions)) {
          const savedOverrides = localStorage.getItem('userPermissionOverrides');
          let overrides: string[] = [];
          if (savedOverrides) {
            try {
              const parsedOverrides = JSON.parse(savedOverrides) as any[];
              const userOverride = parsedOverrides.find(o => o.userId === this.user!.id);
              if (userOverride && Array.isArray(userOverride.overrides)) {
                overrides = userOverride.overrides;
              }
            } catch (e) {
              // ignore
            }
          }
          this.cachedPermissionIds = Array.from(new Set([...(matching.permissions || []), ...overrides]));
          return;
        }
      }
    } catch (e) {
      console.warn('Erro ao ler categorias/overrides do localStorage:', e);
    }

    // fallback para mapa padrão
    const defaultMap: Record<string, string[]> = {
      admin: ['grades_view', 'grades_create', 'grades_edit', 'grades_delete'],
      professor: ['grades_view', 'grades_create', 'grades_edit'],
      pai: ['grades_view']
    };
    this.cachedPermissionIds = defaultMap[this.user.tipo_usuario] || [];
  }

  // Método para verificar permissões
  private checkPermission(permission: keyof UserPermissions): boolean {
    return this.permissions[permission];
  }

  // Obter permissões por ID (ex.: 'grades_edit', 'grades_delete') combinando categorias salvas e overrides
  private getEffectivePermissionIds(): string[] {
    if (!this.user) return [];
    if (this.cachedPermissionIds && this.cachedPermissionIds.length > 0) return this.cachedPermissionIds;

    // se cache vazio, preencher com algum fallback rápido
    const defaultMap: Record<string, string[]> = {
      admin: ['grades_view', 'grades_create', 'grades_edit', 'grades_delete'],
      professor: ['grades_view', 'grades_create', 'grades_edit'],
      pai: ['grades_view']
    };
    return defaultMap[this.user.tipo_usuario] || [];
  }

  
  // Checa se o usuário possui a permissão identificada por um ID (ex: 'grades_edit')
  hasPermissionId(permissionId: string): boolean {
    if (!this.user) return false;
    // admin sempre tem todas as permissões
    if (this.user.tipo_usuario === 'admin') return true;
    const perms = this.getEffectivePermissionIds();
    return perms.includes(permissionId);
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
      const { getAllUsuarios } = await import('./supabase');
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

    const { createUsuario } = await import('./supabase');
    return await createUsuario(userData);
  }

  async updateUsuario(id: string, updates: Partial<Usuario>): Promise<Usuario | null> {
    if (!this.checkPermission('canEditUsers')) {
      this.throwPermissionError('editar usuários');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

    const { updateUsuario } = await import('./supabase');
    return await updateUsuario(id, updates);
  }

  async deleteUsuario(id: string): Promise<boolean> {
    if (!this.checkPermission('canDeleteUsers')) {
      this.throwPermissionError('excluir usuários');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

    const { deleteUsuario } = await import('./supabase');
    return await deleteUsuario(id);
  }

  // ==================== ALUNOS ====================
  async getAlunos(): Promise<Aluno[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
      const { getAllAlunos, getAlunosByResponsavel, getTurmasByProfessor } = await import('./supabase');
      
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
      if (this.permissions.canViewAllStudents) {
        return localDB.getAlunos();
      } else if (this.user.tipo_usuario === 'professor') {
        const turmas = localDB.getTurmasByProfessor(this.user.id);
        const turmaIds = turmas.map(t => t.id);
        return localDB.getAlunos().filter(a => turmaIds.includes(a.turma_id));
      } else if (this.user.tipo_usuario === 'pai') {
        return localDB.getAlunosByResponsavel(this.user.id);
      }
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

    const { createAluno } = await import('./supabase');
    return await createAluno(alunoData);
  }

  async updateAluno(id: string, updates: Partial<Aluno>): Promise<Aluno | null> {
    if (!this.checkPermission('canEditStudents')) {
      this.throwPermissionError('editar alunos');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

    const { updateAluno } = await import('./supabase');
    return await updateAluno(id, updates);
  }

  async deleteAluno(id: string): Promise<boolean> {
    if (!this.checkPermission('canDeleteStudents')) {
      this.throwPermissionError('excluir alunos');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

    const { deleteAluno } = await import('./supabase');
    return await deleteAluno(id);
  }

  // ==================== TURMAS ====================
  async getTurmas(): Promise<Turma[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
      const { getAllTurmas, getTurmasByProfessor, getAlunosByResponsavel } = await import('./supabase');
      
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

    const { createTurma } = await import('./supabase');
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

    const { updateTurma } = await import('./supabase');
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

    const { deleteTurma } = await import('./supabase');
    return await deleteTurma(id);
  }

  // ==================== DISCIPLINAS ====================
  async getDisciplinas(): Promise<Disciplina[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
      const { getAllDisciplinas, getAlunosByResponsavel } = await import('./supabase');
      
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
      const { localDB } = await import('./localDatabase');
      if (this.permissions.canViewAllSubjects) {
        return localDB.getDisciplinas();
      } else if (this.user.tipo_usuario === 'professor') {
        return localDB.getDisciplinas().filter(d => d.professor_id === this.user!.id);
      } else if (this.user.tipo_usuario === 'pai') {
        const alunos = localDB.getAlunosByResponsavel(this.user.id);
        const turmaIds = [...new Set(alunos.map(a => a.turma_id))];
        return localDB.getDisciplinas().filter(d => turmaIds.includes(d.turma_id));
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

    const { createDisciplina } = await import('./supabase');
    return await createDisciplina(disciplinaData);
  }

  async updateDisciplina(id: string, updates: Partial<Disciplina>): Promise<Disciplina | null> {
    if (!this.checkPermission('canEditSubjects')) {
      this.throwPermissionError('editar disciplinas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

    const { updateDisciplina } = await import('./supabase');
    return await updateDisciplina(id, updates);
  }

  async deleteDisciplina(id: string): Promise<boolean> {
    if (!this.checkPermission('canDeleteSubjects')) {
      this.throwPermissionError('excluir disciplinas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

    const { deleteDisciplina } = await import('./supabase');
    return await deleteDisciplina(id);
  }

  // ==================== NOTAS ====================
  async getNotas(): Promise<Nota[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
      const { getAllNotas, getNotasByProfessor, getAlunosByResponsavel, getNotasByAluno } = await import('./supabase');
      
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
      const { localDB } = await import('./localDatabase');
      if (this.permissions.canViewAllGrades) {
        return localDB.getNotas();
      } else if (this.user.tipo_usuario === 'professor') {
        return localDB.getNotasByProfessor(this.user.id);
      } else if (this.user.tipo_usuario === 'pai') {
        const alunos = localDB.getAlunosByResponsavel(this.user.id);
        const alunoIds = alunos.map(a => a.id);
        return localDB.getNotas().filter(n => alunoIds.includes(n.aluno_id));
      }
    }

    return [];
  }

  async createNota(notaData: Omit<Nota, 'id' | 'criado_em'>): Promise<Nota | null> {
    if (!this.checkPermission('canCreateGrades')) {
      this.throwPermissionError('criar notas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

    const { createNota } = await import('./supabase');
    return await createNota(notaData);
  }

  async updateNota(id: string, updates: Partial<Nota>): Promise<Nota | null> {
    if (!this.hasPermissionId('grades_edit')) {
      this.throwPermissionError('editar notas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Opera\u00e7\u00e3o de atualiza\u00e7\u00e3o requer conex\u00e3o com Supabase. Verifique sua conex\u00e3o.');
    }

    const { updateNota } = await import('./supabase');
    return await updateNota(id, updates);
  }

  async deleteNota(id: string): Promise<boolean> {
    // Apenas admin e professor com permiss\u00f5es apropriadas podem excluir
    if (!this.hasPermissionId('grades_delete')) {
      // allow delete if explicit grades_delete permission (PermissoesPage defines grades_delete)
      if (!this.getPermissions().canViewAllGrades) {
        this.throwPermissionError('excluir notas');
      }
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Opera\u00e7\u00e3o de exclus\u00e3o requer conex\u00e3o com Supabase. Verifique sua conex\u00e3o.');
    }

    const { deleteNota } = await import('./supabase');
    return await deleteNota(id);
  }

  // ==================== PROVAS/TAREFAS ====================
  async getProvasTarefas(): Promise<ProvaTarefa[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
      const { getAllProvasTarefas, getAlunosByResponsavel } = await import('./supabase');
      
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
      const { localDB } = await import('./localDatabase');
      const todasProvas = localDB.getProvasTarefas();
      
      if (this.user.tipo_usuario === 'admin') {
        return todasProvas;
      } else if (this.user.tipo_usuario === 'professor') {
        return todasProvas.filter(p => p.professor_id === this.user!.id);
      } else if (this.user.tipo_usuario === 'pai') {
        const alunos = localDB.getAlunosByResponsavel(this.user.id);
        const turmaIds = alunos.map(a => a.turma_id);
        return todasProvas.filter(p => turmaIds.includes(p.turma_id));
      }
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

    const { createProvaTarefa } = await import('./supabase');
    return await createProvaTarefa(provaData);
  }

  async updateProvaTarefa(id: string, updates: Partial<ProvaTarefa>): Promise<ProvaTarefa | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('editar provas/tarefas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

    const { updateProvaTarefa } = await import('./supabase');
    return await updateProvaTarefa(id, updates);
  }

  async deleteProvaTarefa(id: string): Promise<boolean> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('excluir provas/tarefas');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

    const { deleteProvaTarefa } = await import('./supabase');
    return await deleteProvaTarefa(id);
  }

  // ==================== MATERIAIS ====================
  async getMateriais(): Promise<Material[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
      const { getAllMateriais, getAlunosByResponsavel } = await import('./supabase');
      
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
      const todosMateriais = localDB.getMateriais();
      
      if (this.user.tipo_usuario === 'admin') {
        return todosMateriais;
      } else if (this.user.tipo_usuario === 'professor') {
        return todosMateriais.filter(m => m.professor_id === this.user!.id);
      } else if (this.user.tipo_usuario === 'pai') {
        const alunos = localDB.getAlunosByResponsavel(this.user.id);
        const turmaIds = alunos.map(a => a.turma_id);
        return todosMateriais.filter(m => turmaIds.includes(m.turma_id));
      }
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

    const { createMaterial } = await import('./supabase');
    return await createMaterial(materialData);
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<Material | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('editar materiais');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de atualização requer conexão com Supabase. Verifique sua conexão.');
    }

    const { updateMaterial } = await import('./supabase');
    return await updateMaterial(id, updates);
  }

  async deleteMaterial(id: string): Promise<boolean> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('excluir materiais');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de exclusão requer conexão com Supabase. Verifique sua conexão.');
    }

    const { deleteMaterial } = await import('./supabase');
    return await deleteMaterial(id);
  }

  // ==================== RECADOS ====================
  async getRecados(): Promise<Recado[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
      const { getRecadosForUser } = await import('./supabase');
      return await getRecadosForUser(this.user.id, this.user.tipo_usuario);
    } else {
      const { localDB } = await import('./localDatabase');
      return localDB.getRecadosForUser(this.user.id, this.user.tipo_usuario);
    }
  }

  async createRecado(recadoData: Omit<Recado, 'id' | 'data_envio'>): Promise<Recado | null> {
    if (!this.user || this.user.tipo_usuario === 'pai') {
      this.throwPermissionError('criar recados');
    }

    if (!this.isSupabaseConnected) {
      throw new Error('Operação de criação requer conexão com Supabase. Verifique sua conexão.');
    }

    const { createRecado } = await import('./supabase');
    return await createRecado(recadoData);
  }

  // ==================== PRESENÇAS ====================
  async getPresencas(): Promise<Presenca[]> {
    if (!this.user) return [];

    if (this.isSupabaseConnected) {
      const { getAlunosByResponsavel } = await import('./supabase');
      
      if (this.user.tipo_usuario === 'admin') {
        // Admin vê todas as presenças
        // Implementar quando necessário
        return [];
      } else if (this.user.tipo_usuario === 'professor') {
        // Professor vê presenças das suas turmas
        // Implementar quando necessário
        return [];
      } else if (this.user.tipo_usuario === 'pai') {
        // Pai vê apenas presenças dos filhos
        const alunos = await getAlunosByResponsavel(this.user.id);
        const alunoIds = alunos.map(a => a.id);
        // Implementar busca de presenças por aluno
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

    const { createPresenca } = await import('./supabase');
    return await createPresenca(presencaData);
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
}

// Factory function para criar instância do DataService
export const createDataService = (user: Usuario | null, isSupabaseConnected: boolean = false): DataService => {
  return new DataService(user, isSupabaseConnected);
};

// Hook para usar o DataService nos componentes
export const useDataService = (user: Usuario | null, isSupabaseConnected: boolean = false): DataService => {
  return createDataService(user, isSupabaseConnected);
};