# 🌐 Sistema Objetivo Educacional - Deploy Online

## 🎯 DEPLOY PARA PRODUÇÃO COM SUPABASE

Este é o pacote de deploy configurado para funcionar com banco de dados online.

### 📋 CONFIGURAÇÃO NECESSÁRIA

#### 1. **Criar Projeto Supabase**
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto: `sistema-objetivo-educacional`
4. Escolha região: `South America (São Paulo)`
5. Aguarde a criação (~2 minutos)

#### 2. **Executar Scripts SQL**
No painel do Supabase, vá em **SQL Editor** e execute na ordem:

1. **schema.sql** - Cria todas as tabelas e estrutura
2. **seed-data.sql** - Insere dados iniciais de demonstração

#### 3. **Obter Credenciais**
No painel do Supabase, vá em **Settings > API**:
- Project URL: `https://xxxxxxxx.supabase.co`
- Project API Key (anon public): `eyJhbGciOiJIUzI1NiIs...`

#### 4. **Configurar no Discloud**
No painel do Discloud, adicione as variáveis de ambiente:

```
VITE_SUPABASE_URL=https://SEU-PROJETO-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

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

**Versão**: 2025-09-29T14:14:31.876Z
**Modo**: Produção Online com Supabase
**Status**: ✅ Pronto para escola real