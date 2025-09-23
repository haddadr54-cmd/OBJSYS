import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Configuração do Supabase (somente via variáveis de ambiente)
// Nunca deixe chaves embutidas no código-fonte versionado.
// Defina em: .env / .env.local
// VITE_SUPABASE_URL=...  |  VITE_SUPABASE_ANON_KEY=...
// ============================================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Em produção/preview sem variáveis, rodar em modo OFFLINE (fallback localDB)
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Use 'any' para evitar propagar nullability pelo arquivo todo; em runtime será null quando offline
export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: 'public'
      }
    })
  : (console.warn('⚠️ Supabase não configurado (VITE_SUPABASE_URL/ANON_KEY ausentes). Rodando em modo offline.'), null);

// IMPORTANTE: Não exponha a service role key no código do cliente.
// Se precisar de operações administrativas use um backend (ex: Express server) e
// carregue a chave lá via process.env.SUPABASE_SERVICE_ROLE_KEY.

// Tipos para o banco de dados
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  // senha (LEGACY): será removida após migração completa para Supabase Auth
  senha?: string;
  // Novo vínculo ao auth.users (pode ser nulo durante transição)
  auth_user_id?: string;
  tipo_usuario: 'pai' | 'professor' | 'admin';
  telefone?: string;
  avatar_url?: string;
  ativo: boolean;
  criado_em: string;
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
  destinatario_id?: string;
  enviado_por: string;
  autor?: Usuario;
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
}

export interface HorarioAula {
  id: string;
  turma_id: string;
  disciplina_id: string;
  professor_id?: string;
  dia_semana: number; // 1-7 (Segunda-Domingo)
  hora_inicio: string;
  hora_fim: string;
  sala?: string;
  observacoes?: string;
  ativo: boolean;
  criado_em: string;
  disciplina?: Disciplina;
  professor?: Usuario;
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
}

// Função para inicializar o banco de dados
export const initializeDatabase = async () => {
  try {
    console.log('%c🔄 Inicializando banco de dados Supabase...', 'color: blue; font-weight: bold');
    
    // Verificar se o Supabase está configurado
    if (!supabase) {
      throw new Error('Supabase não configurado - variáveis de ambiente não encontradas');
    }
    
    // Testar conexão com uma consulta simples
    const { error: connectionError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);
    
    if (connectionError && connectionError.code !== 'PGRST116') {
      throw new Error(`Erro de conexão: ${connectionError.message}`);
    }
    
    // Verificar se as tabelas existem e criar se necessário
    await createTablesIfNotExist();
    
    // Inserir dados iniciais se não existirem
    await insertInitialData();
    
    console.log('%c✅ Banco de dados inicializado com sucesso!', 'color: green; font-weight: bold');
    return true;
  } catch (error) {
    console.error('%c❌ Erro ao inicializar banco de dados:', 'color: red; font-weight: bold', error);
    throw error;
  }
};

// Função de login com Supabase
// LEGACY LOGIN: será removido após transição para Supabase Auth.
// Evite usar este método em novo código. Utilize authService.signIn.
export const signInWithSupabase = async (email: string, password: string): Promise<Usuario> => {
  console.warn('[signInWithSupabase] LEGACY - use authService.signIn assim que migração Auth finalizar.');
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('senha', password)
    .eq('ativo', true);
  
  if (error) {
    console.log('%c❌ Erro na consulta:', 'color: red', error);
    throw new Error('Erro interno do servidor');
  }

  if (!usuarios || usuarios.length === 0) {
    console.log('%c❌ Credenciais inválidas:', 'color: red', error);
    throw new Error('Credenciais inválidas');
  }

  const usuario = usuarios[0];

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    // Normalizar para lowercase para evitar problemas de comparação na UI
    tipo_usuario: (usuario.tipo_usuario || '').toLowerCase(),
    telefone: usuario.telefone,
    avatar_url: usuario.avatar_url,
    ativo: usuario.ativo,
    criado_em: usuario.criado_em
  };
};

// Criar tabelas se não existirem
const createTablesIfNotExist = async () => {
  try {
    // Verificar se a tabela usuarios existe
    const { error: usuariosError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);
    
    if (usuariosError && usuariosError.code === 'PGRST116') {
      console.log('⚠️ Tabelas não encontradas. Elas devem ser criadas via migrations.');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
    return false;
  }
};

// Inserir dados iniciais
const insertInitialData = async () => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, pulando inserção de dados iniciais');
      return;
    }
    
    // Verificar se já existem usuários
    const { data: existingUsers, error: checkError } = await supabase
      .from('usuarios')
      .select('email')
      .limit(1);
    
    if (checkError) {
      console.log('❌ Erro ao verificar usuários existentes (tabelas podem não existir ainda):', checkError.message);
      return;
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('✅ Dados já existem no banco');
      return;
    }
    
    console.log('📝 Inserindo dados iniciais...');
    
    // Inserir usuários
    const { data: usuariosData, error: userError } = await supabase
      .from('usuarios')
      .insert([
        {
          nome: 'João Silva',
          email: 'pai@escola.com',
          senha: '123456',
          tipo_usuario: 'pai',
          ativo: true
        },
        {
          nome: 'Maria Santos',
          email: 'professor@escola.com',
          senha: '123456',
          tipo_usuario: 'professor',
          ativo: true
        },
        {
          nome: 'Carlos Oliveira',
          email: 'admin@escola.com',
          senha: '123456',
          tipo_usuario: 'admin',
          ativo: true
        }
      ])
      .select();

    if (userError) {
      console.log('❌ Erro ao inserir usuários:', userError);
      return;
    }

    console.log('✅ Usuários inseridos:', usuariosData?.length);

    // Inserir turmas
    const { data: turmasData, error: turmaError } = await supabase
      .from('turmas')
      .insert([
        {
          nome: '5º Ano A',
          ano_letivo: '2024'
        },
        {
          nome: '3º Ano B',
          ano_letivo: '2024'
        },
        {
          nome: '4º Ano C',
          ano_letivo: '2024'
        }
      ])
      .select();

    if (turmaError) {
      console.log('❌ Erro ao inserir turmas:', turmaError);
      return;
    }

    console.log('✅ Turmas inseridas:', turmasData?.length);

    // Buscar IDs dos usuários e turmas para relacionamentos
  const paiUser = usuariosData?.find((u: any) => u.email === 'pai@escola.com');
  const professorUser = usuariosData?.find((u: any) => u.email === 'professor@escola.com');
  const turma1 = turmasData?.find((t: any) => t.nome === '5º Ano A');
  const turma2 = turmasData?.find((t: any) => t.nome === '3º Ano B');

    if (paiUser && turma1 && turma2) {
      // Inserir alunos
      const { data: alunosData, error: alunoError } = await supabase
        .from('alunos')
        .insert([
          {
            nome: 'Ana Silva',
            turma_id: turma1.id,
            responsavel_id: paiUser.id
          },
          {
            nome: 'Pedro Silva',
            turma_id: turma2.id,
            responsavel_id: paiUser.id
          }
        ])
        .select();

      if (alunoError) {
        console.log('❌ Erro ao inserir alunos:', alunoError);
      } else {
        console.log('✅ Alunos inseridos:', alunosData?.length);
      }
    }

    if (professorUser && turma1) {
      // Inserir disciplinas
      const { data: disciplinasData, error: disciplinaError } = await supabase
        .from('disciplinas')
        .insert([
          {
            nome: 'Matemática',
            turma_id: turma1.id,
            professor_id: professorUser.id
          },
          {
            nome: 'Português',
            turma_id: turma1.id,
            professor_id: professorUser.id
          }
        ])
        .select();

      if (disciplinaError) {
        console.log('❌ Erro ao inserir disciplinas:', disciplinaError);
      } else {
        console.log('✅ Disciplinas inseridas:', disciplinasData?.length);
      }
    }

    console.log('✅ Dados iniciais inseridos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error);
  }
};

// Funções de consulta
export const getAllUsuarios = async (): Promise<Usuario[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
};

// Funções para configurações globais
export const getGlobalConfig = async (chave: string): Promise<any> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando null');
      return null;
    }
    
    const { data, error } = await supabase
      .from('configuracoes_globais')
      .select('valor')
      .eq('chave', chave)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data ? data.valor : null;
  } catch (error) {
    console.error(`Erro ao buscar configuração ${chave}:`, error);
    return null;
  }
};

export const saveGlobalConfig = async (chave: string, valor: any): Promise<boolean> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, não é possível salvar configuração');
      return false;
    }
    
    const { error } = await supabase
      .from('configuracoes_globais')
      .upsert({ 
        chave, 
        valor,
        ultima_atualizacao: new Date().toISOString()
      }, { onConflict: 'chave' });

    if (error) throw error;
    
    console.log(`✅ Configuração ${chave} salva com sucesso`);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar configuração ${chave}:`, error);
    return false;
  }
};

export const getAllGlobalConfigs = async (): Promise<Record<string, any>> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando objeto vazio');
      return {};
    }
    
    const { data, error } = await supabase
      .from('configuracoes_globais')
      .select('chave, valor');

    if (error) throw error;
    
    const configs: Record<string, any> = {};
    data?.forEach((item: any) => {
      configs[item.chave] = item.valor;
    });
    
    return configs;
  } catch (error) {
    console.error('Erro ao buscar todas as configurações:', error);
    return {};
  }
};

export const getAllAlunos = async (): Promise<Aluno[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('alunos')
      .select(`
        *,
        turma:turmas(*)
      `)
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return [];
  }
};

export const getAllTurmas = async (): Promise<Turma[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    return [];
  }
};

export const getAllDisciplinas = async (): Promise<Disciplina[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('disciplinas')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar disciplinas:', error);
    return [];
  }
};

export const getAllNotas = async (): Promise<Nota[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('notas')
      .select(`
        *,
        aluno:alunos(*),
        disciplina:disciplinas(*)
      `)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return [];
  }
};

export const getAllProvasTarefas = async (): Promise<ProvaTarefa[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('provas_tarefas')
      .select(`
        *,
        disciplina:disciplinas(*)
      `)
      .order('data', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar provas/tarefas:', error);
    return [];
  }
};

export const getAllMateriais = async (): Promise<Material[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('materiais')
      .select(`
        *,
        disciplina:disciplinas(*)
      `)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    return [];
  }
};

export const getAlunosByResponsavel = async (responsavelId: string): Promise<Aluno[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('alunos')
      .select(`
        *,
        turma:turmas(*)
      `)
      .eq('responsavel_id', responsavelId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return [];
  }
};

export const getTurmasByProfessor = async (professorId: string): Promise<Turma[]> => {
  try {
    type DisciplinaTurmaRow = { turma: Turma } | { turma: null };
    const { data, error } = await supabase
      .from('disciplinas')
      .select('turma:turmas(*)')
      .eq('professor_id', professorId);

    if (error) throw error;

    const rows = (data ?? []) as unknown as DisciplinaTurmaRow[];
    const turmas = rows.map(r => r.turma).filter((t): t is Turma => !!t);
    // Unicidade via Map para evitar problemas de comparação
    const turmasUnicas = Array.from(new Map(turmas.map(t => [t.id, t])).values());
    return turmasUnicas;
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    return [];
  }
};

export const getNotasByAluno = async (alunoId: string): Promise<Nota[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('notas')
      .select(`
        *,
        aluno:alunos(*),
        disciplina:disciplinas(*)
      `)
      .eq('aluno_id', alunoId)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return [];
  }
};

// Buscar nota específica (com aluno e disciplina) - usado após edição pontual
export const getNotaById = async (notaId: string): Promise<Nota | null> => {
  try {
    const { data, error } = await supabase
      .from('notas')
      .select(`
        *,
        aluno:alunos(*),
        disciplina:disciplinas(*)
      `)
      .eq('id', notaId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (e) {
    console.error('Erro ao buscar nota por ID:', e);
    return null;
  }
};

// Notas associadas a um professor (via disciplinas que ele ministra)
export const getNotasByProfessor = async (professorId: string): Promise<Nota[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    // Buscar disciplinas do professor
    const { data: disciplinas, error: discError } = await supabase
      .from('disciplinas')
      .select('id')
      .eq('professor_id', professorId);
    if (discError) throw discError;
    if (!disciplinas || disciplinas.length === 0) return [];
  const disciplinaIds = disciplinas.map((d: any) => d.id);
    const { data, error } = await supabase
      .from('notas')
      .select(`
        *,
        aluno:alunos(*),
        disciplina:disciplinas(*)
      `)
      .in('disciplina_id', disciplinaIds)
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar notas do professor:', error);
    return [];
  }
};

// Recados visíveis para um usuário (pai/professor/admin)
export const getRecadosForUser = async (userId: string, userType: string): Promise<Recado[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    let query = supabase
      .from('recados')
      .select(`
        *,
        autor:usuarios!enviado_por(*)
      `);
    if (userType === 'pai') {
      // Pais veem recados gerais, da(s) turma(s) dos filhos e individuais
      const { data: alunos } = await supabase
        .from('alunos')
        .select('id, turma_id')
        .eq('responsavel_id', userId);
      if (alunos && alunos.length > 0) {
  const turmaIds = alunos.map((a: any) => a.turma_id);
  const alunoIds = alunos.map((a: any) => a.id);
        query = query.or(`destinatario_tipo.eq.geral,and(destinatario_tipo.eq.turma,destinatario_id.in.(${turmaIds.join(',')})),and(destinatario_tipo.eq.aluno,destinatario_id.in.(${alunoIds.join(',')}))`);
      } else {
        query = query.eq('destinatario_tipo', 'geral');
      }
    } else if (userType === 'professor') {
      // Professores veem recados que criaram
      query = query.eq('enviado_por', userId);
    }
    // Admins veem todos os recados
    const { data, error } = await query.order('data_envio', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar recados:', error);
    return [];
  }
};

// Funções de criação
export const createNota = async (nota: Omit<Nota, 'id' | 'criado_em'>): Promise<Nota | null> => {
  try {
    const { data, error } = await supabase
      .from('notas')
      .insert([nota])
      .select(`
        *,
        aluno:alunos(*),
        disciplina:disciplinas(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    return null;
  }
};

// Editar nota existente (somente admin ou professor responsável pela disciplina)
export const editarNota = async (
  notaId: string,
  updates: Partial<Pick<Nota, 'nota' | 'comentario' | 'trimestre'>>,
  usuario: Pick<Usuario, 'id' | 'tipo_usuario'>
): Promise<Nota | null> => {
  try {
    // Validações de entrada
    if (updates.nota !== undefined) {
      if (typeof updates.nota !== 'number' || isNaN(updates.nota) || updates.nota < 0 || updates.nota > 10) {
        throw new Error('Valor de nota inválido. Deve estar entre 0 e 10.');
      }
    }
    if (updates.trimestre !== undefined) {
      if (typeof updates.trimestre !== 'number' || updates.trimestre < 1 || updates.trimestre > 4) {
        throw new Error('Trimestre inválido. Deve estar entre 1 e 4.');
      }
    }

    // Buscar a nota com a disciplina para checar permissão
    const { data: notaExistente, error: fetchError } = await supabase
      .from('notas')
      .select('id, disciplina_id, aluno_id, disciplina:disciplinas(professor_id)')
      .eq('id', notaId)
      .single();

    if (fetchError) throw fetchError;
    if (!notaExistente) {
      console.warn('Nota não encontrada para edição:', notaId);
      return null;
    }

    // Checagem de permissão
    const isAdmin = usuario.tipo_usuario === 'admin';
    let professorIdDaDisciplina = (notaExistente as any).disciplina?.professor_id;
    // Fallback: se o embed não trouxe professor_id, buscar disciplina diretamente
    if (!professorIdDaDisciplina) {
      try {
        const { data: disciplinaLookup } = await supabase
          .from('disciplinas')
          .select('id, professor_id')
          .eq('id', (notaExistente as any).disciplina_id)
          .maybeSingle();
        if (disciplinaLookup) {
          professorIdDaDisciplina = (disciplinaLookup as any).professor_id;
        }
      } catch (e) {
        console.warn('[editarNota] Fallback disciplina lookup falhou:', e);
      }
    }
    const isProfessorResponsavel = usuario.tipo_usuario === 'professor' && professorIdDaDisciplina === usuario.id;

    if (!isAdmin && !isProfessorResponsavel) {
      console.warn('[editarNota] Permissão negada', {
        usuarioId: usuario.id,
        usuarioTipo: usuario.tipo_usuario,
        professorIdDaDisciplina,
        motivo: 'não é admin nem professor responsável'
      });
      return null; // manter retorno nulo para compatibilidade
    }

    // Sanitizar campos permitidos
    const allowed: Record<string, any> = {};
    if (updates.nota !== undefined) allowed.nota = updates.nota;
    if (updates.comentario !== undefined) allowed.comentario = updates.comentario;
    if (updates.trimestre !== undefined) allowed.trimestre = updates.trimestre;

    if (Object.keys(allowed).length === 0) {
      console.warn('Nenhuma alteração válida fornecida para editarNota');
      return null;
    }

    const { data: notaAtualizada, error: updateError } = await supabase
      .from('notas')
      .update(allowed)
      .eq('id', notaId)
      .select(`
        *,
        aluno:alunos(*),
        disciplina:disciplinas(*)
      `)
      .single();

    if (updateError) throw updateError;
    return notaAtualizada;
  } catch (error) {
    console.error('Erro ao editar nota:', error);
    return null; // manter contrato atual
  }
};

// Função auxiliar para diagnosticar problemas de permissão/edição de nota
export const debugNotaPermissao = async (notaId: string) => {
  try {
    const { data: nota, error } = await supabase
      .from('notas')
      .select('id, disciplina_id, aluno_id, disciplina:disciplinas(id, professor_id)')
      .eq('id', notaId)
      .maybeSingle();
    if (error) {
      console.error('[debugNotaPermissao] Erro ao buscar nota:', error);
      return null;
    }
    console.log('[debugNotaPermissao] Nota encontrada:', nota);
    return nota;
  } catch (e) {
    console.error('[debugNotaPermissao] Erro inesperado:', e);
    return null;
  }
};

// Helper interno para checar se usuário pode gerenciar (editar/excluir) uma nota
const podeGerenciarNota = async (notaId: string, usuario: Pick<Usuario, 'id' | 'tipo_usuario'>): Promise<{
  permitido: boolean;
  disciplinaId?: string;
}> => {
  try {
    const { data: notaExistente, error } = await supabase
      .from('notas')
      .select('id, disciplina_id, disciplina:disciplinas(professor_id)')
      .eq('id', notaId)
      .maybeSingle();

    if (error || !notaExistente) {
      return { permitido: false };
    }
    const professorIdDaDisciplina = (notaExistente as any).disciplina?.professor_id;
    const isAdmin = usuario.tipo_usuario === 'admin';
    const isProfessorResponsavel = usuario.tipo_usuario === 'professor' && professorIdDaDisciplina === usuario.id;
    return { permitido: isAdmin || isProfessorResponsavel, disciplinaId: (notaExistente as any).disciplina_id };
  } catch {
    return { permitido: false };
  }
};

// Excluir nota (somente admin ou professor responsável)
export const deleteNota = async (
  notaId: string,
  usuario: Pick<Usuario, 'id' | 'tipo_usuario'>
): Promise<boolean> => {
  try {
    const { permitido } = await podeGerenciarNota(notaId, usuario);
    if (!permitido) {
      console.warn('Usuário sem permissão para excluir a nota', { notaId, usuario });
      return false;
    }

    const { error } = await supabase
      .from('notas')
      .delete()
      .eq('id', notaId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir nota:', error);
    return false;
  }
};

export const createRecado = async (recado: Omit<Recado, 'id' | 'data_envio'>): Promise<Recado | null> => {
  try {
    const { data, error } = await supabase
      .from('recados')
      .insert([{
        ...recado,
        data_envio: new Date().toISOString()
      }])
      .select(`
        *,
        autor:usuarios!enviado_por(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar recado:', error);
    return null;
  }
};

export const updateRecado = async (id: string, updates: Partial<Recado>): Promise<Recado | null> => {
  try {
    const { data, error } = await supabase
      .from('recados')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        autor:usuarios!enviado_por(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar recado:', error);
    return null;
  }
};

export const deleteRecado = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('recados')
      .delete()
      .eq('id', id);

    if (error) throw error;
    // Broadcast redundante para garantir remoção em clientes que perderam o evento DELETE.
    try {
      await supabase.channel('recados_broadcast').send({
        type: 'broadcast',
        event: 'recado_deleted',
        payload: { id }
      });
    } catch (e) {
      console.warn('[deleteRecado] Falha ao enviar broadcast (não crítico):', e);
    }
    return true;
  } catch (error) {
    console.error('Erro ao excluir recado:', error);
    return false;
  }
};

// Bulk delete recados (enviando broadcasts individuais para redundância)
export const bulkDeleteRecados = async (ids: string[]): Promise<{ successIds: string[]; failedIds: string[] }> => {
  const successIds: string[] = [];
  const failedIds: string[] = [];
  try {
    if (ids.length === 0) return { successIds, failedIds };
    // Real-time vai emitir um DELETE por linha. Ainda assim fazemos broadcast redundante.
    const { data, error } = await supabase
      .from('recados')
      .delete()
      .in('id', ids)
      .select('id');
    if (error) throw error;
  const deletedIds = (data || []).map((r: any) => (r as any).id);
    ids.forEach(id => {
      if (deletedIds.includes(id)) successIds.push(id); else failedIds.push(id);
    });
    // Broadcast redundante
    for (const id of successIds) {
      try {
        await supabase.channel('recados_broadcast').send({
          type: 'broadcast',
          event: 'recado_deleted',
          payload: { id }
        });
      } catch (e) {
        console.warn('[bulkDeleteRecados] Falha broadcast id', id, e);
      }
    }
    return { successIds, failedIds };
  } catch (e) {
    console.error('Erro bulkDeleteRecados:', e);
    // fallback: tentar deletar individualmente o que restar
    for (const id of ids) {
      try {
        const ok = await deleteRecado(id);
        if (ok) successIds.push(id); else failedIds.push(id);
      } catch {
        failedIds.push(id);
      }
    }
    return { successIds, failedIds };
  }
};

export const createProvaTarefa = async (provaTarefa: Omit<ProvaTarefa, 'id' | 'criado_em'>): Promise<ProvaTarefa | null> => {
  try {
    const { data, error } = await supabase
      .from('provas_tarefas')
      .insert([provaTarefa])
      .select(`
        *,
        disciplina:disciplinas(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar prova/tarefa:', error);
    return null;
  }
};

export const createMaterial = async (material: Omit<Material, 'id' | 'criado_em'>): Promise<Material | null> => {
  try {
    const { data, error } = await supabase
      .from('materiais')
      .insert([material])
      .select(`
        *,
        disciplina:disciplinas(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar material:', error);
    return null;
  }
};

export const createUsuario = async (usuario: Omit<Usuario, 'id' | 'criado_em'>): Promise<Usuario | null> => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([usuario])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return null;
  }
};

export const createAluno = async (aluno: Omit<Aluno, 'id' | 'criado_em'>): Promise<Aluno | null> => {
  try {
    const { data, error } = await supabase
      .from('alunos')
      .insert([aluno])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    return null;
  }
};

export const createTurma = async (turma: Omit<Turma, 'id' | 'criado_em'>): Promise<Turma | null> => {
  try {
    const { data, error } = await supabase
      .from('turmas')
      .insert([turma])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    return null;
  }
};

export const createDisciplina = async (disciplina: Omit<Disciplina, 'id' | 'criado_em'>): Promise<Disciplina | null> => {
  try {
    const { data, error } = await supabase
      .from('disciplinas')
      .insert([disciplina])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    return null;
  }
};

// Funções para presença
export const createPresenca = async (presenca: Omit<Presenca, 'id' | 'criado_em'>): Promise<Presenca | null> => {
  try {
    const { data, error } = await supabase
      .from('presencas')
      .insert([presenca])
      .select(`
        *,
        aluno:alunos(*),
        disciplina:disciplinas(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar presença:', error);
    return null;
  }
};

export const getPresencasByTurmaData = async (turmaId: string, data: string, disciplinaId: string): Promise<Presenca[]> => {
  try {
    const { data: presencas, error } = await supabase
      .from('presencas')
      .select(`
        *,
        aluno:alunos(*),
        disciplina:disciplinas(*)
      `)
      .eq('data_aula', data)
      .eq('disciplina_id', disciplinaId);

    if (error) throw error;
    
    // Filtrar por turma através dos alunos
  const presencasDaTurma = presencas?.filter((p: any) => p.aluno?.turma_id === turmaId) || [];
    return presencasDaTurma;
  } catch (error) {
    console.error('Erro ao buscar presenças:', error);
    return [];
  }
};

export const updatePresenca = async (id: string, updates: Partial<Presenca>): Promise<Presenca | null> => {
  try {
    const { data, error } = await supabase
      .from('presencas')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        aluno:alunos(*),
        disciplina:disciplinas(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar presença:', error);
    return null;
  }
};

// Funções de atualização
export const updateUsuario = async (id: string, updates: Partial<Usuario>): Promise<Usuario | null> => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return null;
  }
};

export const updateAluno = async (id: string, updates: Partial<Aluno>): Promise<Aluno | null> => {
  try {
    const { data, error } = await supabase
      .from('alunos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return null;
  }
};

export const updateTurma = async (id: string, updates: Partial<Turma>): Promise<Turma | null> => {
  try {
    const { data, error } = await supabase
      .from('turmas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    return null;
  }
};

export const updateDisciplina = async (id: string, updates: Partial<Disciplina>): Promise<Disciplina | null> => {
  try {
    const { data, error } = await supabase
      .from('disciplinas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar disciplina:', error);
    return null;
  }
};

export const deleteDisciplina = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('disciplinas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir disciplina:', error);
    return false;
  }
};

export const updateProvaTarefa = async (id: string, updates: Partial<ProvaTarefa>): Promise<ProvaTarefa | null> => {
  try {
    const { data, error } = await supabase
      .from('provas_tarefas')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        disciplina:disciplinas(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar prova/tarefa:', error);
    return null;
  }
};

export const updateMaterial = async (id: string, updates: Partial<Material>): Promise<Material | null> => {
  try {
    const { data, error } = await supabase
      .from('materiais')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        disciplina:disciplinas(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar material:', error);
    return null;
  }
};

// Funções de exclusão
export const deleteUsuario = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return false;
  }
};

export const deleteAluno = async (id: string): Promise<boolean> => {
  try {
    // Primeiro, excluir todas as notas associadas ao aluno
    const { error: notasError } = await supabase
      .from('notas')
      .delete()
      .eq('aluno_id', id);

    if (notasError) {
      console.error('Erro ao excluir notas do aluno:', notasError);
      throw notasError;
    }

    // Excluir todas as presenças associadas ao aluno
    const { error: presencasError } = await supabase
      .from('presencas')
      .delete()
      .eq('aluno_id', id);

    if (presencasError) {
      console.error('Erro ao excluir presenças do aluno:', presencasError);
      throw presencasError;
    }

    // Agora excluir o aluno
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    return false;
  }
};

export const deleteTurma = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('turmas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir turma:', error);
    return false;
  }
};

export const deleteProvaTarefa = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('provas_tarefas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir prova/tarefa:', error);
    return false;
  }
};

export const deleteMaterial = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('materiais')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir material:', error);
    return false;
  }
};

// Funções para visualizações
export const registrarVisualizacao = async (
  itemTipo: 'recado' | 'prova_tarefa' | 'material',
  itemId: string
): Promise<boolean> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, não é possível registrar visualização');
      return false;
    }

    const { error } = await supabase.rpc('registrar_visualizacao', {
      p_item_tipo: itemTipo,
      p_item_id: itemId,
      p_ip_address: null,
      p_user_agent: navigator.userAgent
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
    return false;
  }
};

export const getVisualizacoesByItem = async (
  itemTipo: 'recado' | 'prova_tarefa' | 'material',
  itemId: string
): Promise<Visualizacao[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio de visualizações');
      return [];
    }

    const { data, error } = await supabase
      .from('visualizacoes')
      .select(`
        *,
        usuario:usuarios(*)
      `)
      .eq('item_tipo', itemTipo)
      .eq('item_id', itemId)
      .order('visualizado_em', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar visualizações:', error);
    return [];
  }
};

export const getVisualizacoesByUsuario = async (usuarioId: string): Promise<Visualizacao[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio de visualizações');
      return [];
    }

    const { data, error } = await supabase
      .from('visualizacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('visualizado_em', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar visualizações do usuário:', error);
    return [];
  }
};

export const getEstatisticasVisualizacao = async (
  itemTipo: 'recado' | 'prova_tarefa' | 'material',
  itemId: string
): Promise<{
  totalVisualizacoes: number;
  usuariosUnicos: number;
  ultimaVisualizacao?: string;
  primeiraVisualizacao?: string;
}> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando estatísticas padrão');
      return {
        totalVisualizacoes: 0,
        usuariosUnicos: 0
      };
    }

    const { data, error } = await supabase
      .from('visualizacoes')
      .select('usuario_id, visualizado_em')
      .eq('item_tipo', itemTipo)
      .eq('item_id', itemId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        totalVisualizacoes: 0,
        usuariosUnicos: 0
      };
    }

  const usuariosUnicos = new Set(data.map((v: any) => v.usuario_id)).size;
  const datas = data.map((v: any) => v.visualizado_em).sort();

    return {
      totalVisualizacoes: data.length,
      usuariosUnicos,
      primeiraVisualizacao: datas[0],
      ultimaVisualizacao: datas[datas.length - 1]
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      totalVisualizacoes: 0,
      usuariosUnicos: 0
    };
  }
};

// Funções para horários de aula
export const getHorariosByTurma = async (turmaId: string): Promise<HorarioAula[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('horarios_aula')
      .select(`
        *,
        disciplina:disciplinas(*),
        professor:usuarios(*)
      `)
      .eq('turma_id', turmaId)
      .eq('ativo', true)
      .order('dia_semana')
      .order('hora_inicio');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    return [];
  }
};

export const createHorarioAula = async (horario: Omit<HorarioAula, 'id' | 'criado_em'>): Promise<HorarioAula | null> => {
  try {
    const { data, error } = await supabase
      .from('horarios_aula')
      .insert([horario])
      .select(`
        *,
        disciplina:disciplinas(*),
        professor:usuarios(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar horário:', error);
    return null;
  }
};

export const updateHorarioAula = async (id: string, updates: Partial<HorarioAula>): Promise<HorarioAula | null> => {
  try {
    const { data, error } = await supabase
      .from('horarios_aula')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        disciplina:disciplinas(*),
        professor:usuarios(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar horário:', error);
    return null;
  }
};

export const deleteHorarioAula = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('horarios_aula')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir horário:', error);
    return false;
  }
};

// Funções para turma disciplinas
export const getTurmaDisciplinas = async (turmaId: string): Promise<TurmaDisciplina[]> => {
  try {
    if (!supabase) {
      console.warn('Supabase não configurado, retornando array vazio');
      return [];
    }
    
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .select(`
        *,
        disciplina:disciplinas(*),
        professor:usuarios(*)
      `)
      .eq('turma_id', turmaId)
      .eq('ativa', true)
      .order('disciplina(nome)');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar disciplinas da turma:', error);
    return [];
  }
};

export const createTurmaDisciplina = async (turmaDisciplina: Omit<TurmaDisciplina, 'id' | 'criado_em'>): Promise<TurmaDisciplina | null> => {
  try {
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .insert([turmaDisciplina])
      .select(`
        *,
        disciplina:disciplinas(*),
        professor:usuarios(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar turma disciplina:', error);
    return null;
  }
};

export const updateTurmaDisciplina = async (id: string, updates: Partial<TurmaDisciplina>): Promise<TurmaDisciplina | null> => {
  try {
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        disciplina:disciplinas(*),
        professor:usuarios(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar turma disciplina:', error);
    return null;
  }
};

export const deleteTurmaDisciplina = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('turma_disciplinas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir turma disciplina:', error);
    return false;
  }
};