import { supabase } from './supabase';
import type { Usuario } from './supabase';

/*
  authService
  - Nova camada de autenticação baseada em Supabase Auth.
  - Em fase de transição: se não encontrar registro em usuarios por auth_user_id, tenta fallback (legacy).
*/

export interface AuthResult {
  usuario: Usuario | null;
  sessionUserId: string | null;
}

async function fetchUsuarioByAuthUserId(authUserId: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();
  if (error) {
    console.warn('[authService] fetchUsuarioByAuthUserId error', error.message);
    return null;
  }
  return data as Usuario | null;
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  // Tenta Supabase Auth primeiro
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) {
    console.warn('[authService] Supabase Auth falhou, retornando erro', authError.message);
    throw authError;
  }
  const authUserId = authData.user?.id || null;
  let usuario: Usuario | null = null;
  if (authUserId) {
    usuario = await fetchUsuarioByAuthUserId(authUserId);
  }
  return { usuario, sessionUserId: authUserId };
}

export async function getCurrentSessionUsuario(): Promise<Usuario | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const authUserId = sessionData.session?.user?.id;
  if (!authUserId) return null;
  return await fetchUsuarioByAuthUserId(authUserId);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Provisionamento: quando usuário autenticou via Auth mas ainda não tem vínculo
// (Implementação futura: chamada backend com service role)
export async function needsProvision(usuario: Usuario | null): Promise<boolean> {
  return !usuario; // simples por enquanto
}
