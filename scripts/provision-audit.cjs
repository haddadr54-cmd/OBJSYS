#!/usr/bin/env node
/*
  Script: provision-audit.cjs
  Objetivo: Auditar provisionamento entre auth.users e tabela usuarios.
   - Lista usuarios sem auth_user_id
   - Lista auth.users sem correspondência em usuarios
   - Sugere próximos passos
  Uso: node scripts/provision-audit.cjs
*/
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necessário service role para ler auth.users
if (!url || !service){
  console.error('Defina SUPABASE_URL (ou VITE_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY para auditoria.');
  process.exit(1);
}

const supabase = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

(async()=>{
  console.log('[provision-audit] Iniciando auditoria...');

  // 1. Usuarios sem auth_user_id
  const { data: usuariosSemVinculo, error: errUsuarios } = await supabase
    .from('usuarios')
    .select('id, email, tipo_usuario')
    .is('auth_user_id', null);
  if (errUsuarios){
    console.error('Erro buscando usuarios sem vinculo:', errUsuarios.message);
  }

  // 2. auth.users sem correspondência
  const { data: authUsers, error: errAuth } = await supabase.auth.admin.listUsers();
  if (errAuth){
    console.error('Erro listando auth.users:', errAuth.message);
  }
  const authList = (authUsers?.users || []).map(u => ({ id: u.id, email: u.email?.toLowerCase() }));

  // Buscar todos usuarios para matching
  const { data: allUsuarios } = await supabase.from('usuarios').select('id, email, auth_user_id');
  const usuariosByEmail = new Map((allUsuarios||[]).map(u => [u.email.toLowerCase(), u]));

  const authSemCorrespondencia = authList.filter(a => {
    const u = usuariosByEmail.get(a.email || '');
    return !u || !u.auth_user_id;
  });

  console.log('\n=== Usuarios sem auth_user_id ===');
  if (!usuariosSemVinculo || usuariosSemVinculo.length === 0) console.log('Todos vinculados ✅'); else console.table(usuariosSemVinculo);

  console.log('\n=== auth.users sem correspondência ou sem vinculo em usuarios ===');
  if (authSemCorrespondencia.length === 0) console.log('Todos correspondidos ✅'); else console.table(authSemCorrespondencia);

  console.log('\nPróximos passos sugeridos:');
  if (usuariosSemVinculo && usuariosSemVinculo.length > 0){
    console.log('- Criar contas Auth para emails acima OU ajustar emails para matching automático.');
  }
  if (authSemCorrespondencia.length > 0){
    console.log('- Criar linhas em usuarios para contas Auth listadas ou remover contas órfãs se não usadas.');
  }
  console.log('- Após reconciliação, reexecutar o script para confirmar.');
})();
