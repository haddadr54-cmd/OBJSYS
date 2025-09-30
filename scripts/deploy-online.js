#!/usr/bin/env node

/**
 * Script de deploy ONLINE com Supabase - Sistema Objetivo Educacional
 * Este script prepara o deploy com configuração para banco de dados real
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🌐 DEPLOY SISTEMA OBJETIVO - MODO ONLINE COM SUPABASE');
console.log('=====================================================');

async function deployOnlineToDiscloud() {
  try {
    // 1. Limpar deploy anterior
    const deployDir = join(projectRoot, 'deploy-online-discloud');
    if (existsSync(deployDir)) {
      console.log('🧹 Limpando deploy anterior...');
      rmSync(deployDir, { recursive: true, force: true });
    }

    // 2. Criar diretório de deploy
    console.log('📁 Criando diretório de deploy online...');
    mkdirSync(deployDir, { recursive: true });

    // 3. Build da aplicação
    console.log('🔨 Fazendo build da aplicação...');
    execSync('npm run build', { 
      cwd: projectRoot, 
      stdio: 'inherit'
    });

    // 4. Copiar arquivos necessários
    console.log('📋 Copiando arquivos para deploy online...');
    
    // Copiar dist completo
    execSync(`xcopy "${join(projectRoot, 'dist')}" "${join(deployDir, 'dist')}" /E /I /Q`, { 
      stdio: 'inherit',
      shell: 'cmd.exe'
    });

    // Copiar index.js (servidor)
    copyFileSync(join(projectRoot, 'index.js'), join(deployDir, 'index.js'));

    // Copiar package.json de produção
    copyFileSync(join(projectRoot, 'package-deploy.json'), join(deployDir, 'package.json'));

    // 5. Criar discloud.config otimizado para produção
    const discloudConfig = `NAME=sistema-objetivo-online
TYPE=site
MAIN=index.js
RAM=1024
VERSION=latest
AVATAR=https://cdn.icon-icons.com/icons2/2596/PNG/512/school_icon_155154.png`;

    writeFileSync(join(deployDir, 'discloud.config'), discloudConfig);

    // 6. Criar arquivo de variáveis de ambiente de exemplo
    const envExample = `# ===================================================
# CONFIGURAÇÃO SUPABASE - SISTEMA OBJETIVO EDUCACIONAL
# ===================================================
# 
# INSTRUÇÕES:
# 1. Crie um projeto no Supabase (https://supabase.com)
# 2. Copie as credenciais abaixo
# 3. Configure no painel do Discloud em "Variáveis de Ambiente"
#
# ===================================================

# URL do seu projeto Supabase
VITE_SUPABASE_URL=https://SEU-PROJETO-ID.supabase.co

# Chave pública (anon key) do Supabase
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Opcional: Environment
NODE_ENV=production

# ===================================================
# APÓS CONFIGURAR:
# 1. Execute os scripts SQL (schema.sql e seed-data.sql)
# 2. Sistema funcionará com dados persistentes na nuvem!
# 3. Todos os usuários compartilharão os mesmos dados
# 4. Atualizações em tempo real ativas
# ===================================================`;

    writeFileSync(join(deployDir, '.env.example'), envExample);

    // 7. Copiar scripts SQL
    mkdirSync(join(deployDir, 'sql'), { recursive: true });
    copyFileSync(join(projectRoot, 'supabase', 'schema.sql'), join(deployDir, 'sql', 'schema.sql'));
    copyFileSync(join(projectRoot, 'supabase', 'seed-data.sql'), join(deployDir, 'sql', 'seed-data.sql'));

    // 8. Criar README detalhado para produção
    const readmeContent = `# 🌐 Sistema Objetivo Educacional - Deploy Online

## 🎯 DEPLOY PARA PRODUÇÃO COM SUPABASE

Este é o pacote de deploy configurado para funcionar com banco de dados online.

### 📋 CONFIGURAÇÃO NECESSÁRIA

#### 1. **Criar Projeto Supabase**
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto: \`sistema-objetivo-educacional\`
4. Escolha região: \`South America (São Paulo)\`
5. Aguarde a criação (~2 minutos)

#### 2. **Executar Scripts SQL**
No painel do Supabase, vá em **SQL Editor** e execute na ordem:

1. **schema.sql** - Cria todas as tabelas e estrutura
2. **seed-data.sql** - Insere dados iniciais de demonstração

#### 3. **Obter Credenciais**
No painel do Supabase, vá em **Settings > API**:
- Project URL: \`https://xxxxxxxx.supabase.co\`
- Project API Key (anon public): \`eyJhbGciOiJIUzI1NiIs...\`

#### 4. **Configurar no Discloud**
No painel do Discloud, adicione as variáveis de ambiente:

\`\`\`
VITE_SUPABASE_URL=https://SEU-PROJETO-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
\`\`\`

### 🎉 RESULTADO

Após configurado, o sistema terá:

- ✅ **Dados Persistentes**: Informações salvas na nuvem
- ✅ **Tempo Real**: Atualizações instantâneas entre usuários
- ✅ **Multi-usuário**: Admins, professores e pais compartilham dados
- ✅ **Backup Automático**: Supabase faz backup dos dados
- ✅ **Sincronização**: Funciona em qualquer dispositivo
- ✅ **Performance**: PostgreSQL otimizado na nuvem

### 👥 USUÁRIOS DE TESTE

Após executar os scripts SQL, você terá:

| Tipo | Email | Senha | Descrição |
|------|-------|-------|-----------|
| Admin | admin@objetivo.com | admin123 | Administrador completo |
| Professor | professor@objetivo.com | prof123 | Professor com turmas |
| Pai | pai@objetivo.com | pai123 | Responsável com filhos |

### 📊 DADOS INCLUSOS

- **7 usuários** (admin, professores, pais)
- **7 alunos** distribuídos em 4 turmas
- **8 disciplinas** (Matemática, Português, História, Geografia)
- **Notas e presenças** de exemplo
- **Recados** para demonstração
- **Materiais** de estudo
- **Provas e tarefas** programadas

### 🔄 MODO HÍBRIDO

O sistema funciona de forma inteligente:

- **Com Supabase configurado**: Modo online completo
- **Sem Supabase**: Fallback para dados locais (demo)

### 💰 CUSTO SUPABASE

- **Gratuito**: 500MB storage + 50.000 requests/mês
- **Suficiente para**: Escola com até 200 alunos
- **Upgrade**: Apenas se necessário (R$ 100/mês para escolas grandes)

### 🚀 VANTAGENS DA VERSÃO ONLINE

1. **Colaboração Real**: Professores lançam notas, pais veem imediatamente
2. **Sincronização**: Dados sempre atualizados em todos os dispositivos  
3. **Backup**: Nunca perde informações
4. **Escalabilidade**: Suporta crescimento da escola
5. **Relatórios**: Dados centralizados para análises
6. **Comunicação**: Recados e avisos em tempo real

---

**Versão**: ${new Date().toISOString()}
**Modo**: Produção Online com Supabase
**Status**: ✅ Pronto para escola real`;

    writeFileSync(join(deployDir, 'README-ONLINE.md'), readmeContent);

    // 9. Criar script de configuração automática
    const configScript = `#!/bin/bash
# Script de configuração automática do Supabase

echo "🌐 CONFIGURAÇÃO AUTOMÁTICA - SISTEMA OBJETIVO"
echo "============================================="
echo ""
echo "📋 PASSOS PARA CONFIGURAR:"
echo ""
echo "1. ✅ Crie projeto no Supabase (https://supabase.com)"
echo "2. ✅ Execute schema.sql no SQL Editor"
echo "3. ✅ Execute seed-data.sql no SQL Editor" 
echo "4. ✅ Configure as variáveis no Discloud:"
echo ""
echo "   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=sua-chave-aqui"
echo ""
echo "5. ✅ Redefine o app no painel do Discloud"
echo ""
echo "🎉 Sistema funcionará com dados persistentes!"
echo ""
echo "👥 USUÁRIOS DE TESTE:"
echo "   Admin: admin@objetivo.com / admin123"
echo "   Professor: professor@objetivo.com / prof123"  
echo "   Pai: pai@objetivo.com / pai123"
echo ""`;

    writeFileSync(join(deployDir, 'CONFIGURAR.sh'), configScript);

    console.log('✅ Deploy online preparado com sucesso!');
    console.log(`📦 Arquivos em: ${deployDir}`);
    console.log('');
    console.log('🌐 DEPLOY ONLINE - FUNCIONALIDADES:');
    console.log('  ✅ Banco PostgreSQL na nuvem (Supabase)');
    console.log('  ✅ Dados persistentes e sincronizados');
    console.log('  ✅ Tempo real entre usuários');
    console.log('  ✅ Backup automático');
    console.log('  ✅ Multi-usuário (admin/professor/pai)');
    console.log('  ✅ 1024MB RAM (otimizado para produção)');
    console.log('');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. Comprima a pasta deploy-online-discloud');
    console.log('2. Crie projeto no Supabase');
    console.log('3. Execute os scripts SQL');
    console.log('4. Configure as variáveis no Discloud');
    console.log('5. Faça upload do ZIP no Discloud');
    console.log('');
    console.log('🎯 Sistema pronto para escola real!');

  } catch (error) {
    console.error('❌ Erro no deploy online:', error.message);
    process.exit(1);
  }
}

// Executar deploy online
deployOnlineToDiscloud();