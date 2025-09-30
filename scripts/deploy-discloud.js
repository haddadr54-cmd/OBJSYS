#!/usr/bin/env node

/**
 * Script automatizado de deploy para o Discloud
 * Sistema Objetivo Educacional
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 DEPLOY SISTEMA OBJETIVO EDUCACIONAL - DISCLOUD');
console.log('================================================');

async function deployToDiscloud() {
  try {
    // 1. Limpar deploy anterior
    const deployDir = join(projectRoot, 'deploy-discloud');
    if (existsSync(deployDir)) {
      console.log('🧹 Limpando deploy anterior...');
      rmSync(deployDir, { recursive: true, force: true });
    }

    // 2. Criar diretório de deploy
    console.log('📁 Criando diretório de deploy...');
    mkdirSync(deployDir, { recursive: true });

    // 3. Build da aplicação
    console.log('🔨 Fazendo build da aplicação...');
    execSync('npm run build', { 
      cwd: projectRoot, 
      stdio: 'inherit'
    });

    // 4. Copiar arquivos necessários
    console.log('📋 Copiando arquivos para deploy...');
    
    // Copiar dist completo
    execSync(`xcopy "${join(projectRoot, 'dist')}" "${join(deployDir, 'dist')}" /E /I /Q`, { 
      stdio: 'inherit',
      shell: 'cmd.exe'
    });

    // Copiar index.js (servidor)
    copyFileSync(join(projectRoot, 'index.js'), join(deployDir, 'index.js'));

    // Copiar package.json de produção
    copyFileSync(join(projectRoot, 'package-deploy.json'), join(deployDir, 'package.json'));

    // Copiar discloud.config
    copyFileSync(join(projectRoot, 'discloud.config'), join(deployDir, 'discloud.config'));

    // Copiar logo se existir
    const logoPath = join(projectRoot, 'public', 'logo-objetivo.png');
    if (existsSync(logoPath)) {
      copyFileSync(logoPath, join(deployDir, 'logo-objetivo.png'));
    }

    // 5. Criar arquivo README para o deploy
    const readmeContent = `# Sistema Objetivo Educacional - Deploy Discloud

Este é o pacote de deploy para o Discloud.

## Arquivos incluídos:
- dist/ - Aplicação React buildada
- index.js - Servidor Express
- package.json - Dependências de produção
- discloud.config - Configuração do Discloud

## Como usar:
1. Compacte todos os arquivos em um ZIP
2. Faça upload no painel do Discloud
3. O sistema estará disponível automaticamente

Versão: ${new Date().toISOString()}
`;

    writeFileSync(join(deployDir, 'README.md'), readmeContent);

    // 6. Criar arquivo .gitignore para o deploy
    writeFileSync(join(deployDir, '.gitignore'), 'node_modules/\n*.log\n.env\n');

    console.log('✅ Deploy preparado com sucesso!');
    console.log(`📦 Arquivos em: ${deployDir}`);
    console.log('');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. Comprima a pasta deploy-discloud em um arquivo ZIP');
    console.log('2. Acesse https://discloud.app');
    console.log('3. Faça upload do arquivo ZIP');
    console.log('4. Configure as variáveis de ambiente se necessário');
    console.log('');
    console.log('🌟 Sistema Objetivo pronto para deploy!');

  } catch (error) {
    console.error('❌ Erro no deploy:', error.message);
    process.exit(1);
  }
}

// Executar deploy
deployToDiscloud();