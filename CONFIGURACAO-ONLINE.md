# 🌐 SISTEMA OBJETIVO EDUCACIONAL - CONFIGURAÇÃO ONLINE

## ✅ **SITUAÇÃO ATUAL - DOIS DEPLOYS PREPARADOS**

Você tem duas opções de deploy preparadas:

### 📦 **1. MODO DEMO (Offline)**
- **Arquivo**: `sistema-objetivo-discloud.zip` (567 KB)
- **Funciona**: Imediatamente após upload
- **Dados**: LocalStorage (temporário)
- **Ideal para**: Testar funcionalidades

### 🌐 **2. MODO PRODUÇÃO (Online)**
- **Arquivo**: `sistema-objetivo-ONLINE.zip` (568 KB)  
- **Funciona**: Após configurar Supabase
- **Dados**: PostgreSQL na nuvem (persistente)
- **Ideal para**: Escola real com múltiplos usuários

---

## 🎯 **RECOMENDAÇÃO PARA SISTEMA EDUCACIONAL**

**Para um sistema educacional real, use o MODO PRODUÇÃO (Online)**

### **Por que Online é essencial:**

#### 🔄 **Sincronização em Tempo Real**
- Professor lança nota → Pai vê imediatamente
- Admin envia recado → Todos recebem na hora
- Presença marcada → Dados atualizados para todos

#### 👥 **Colaboração Multi-usuário**
- **Administradores**: Gerenciam escola completa
- **Professores**: Lançam notas, presença, recados  
- **Pais**: Acompanham filhos em tempo real
- **Todos compartilham os mesmos dados**

#### 💾 **Dados Persistentes**
- Informações nunca são perdidas
- Backup automático na nuvem
- Histórico completo de notas e presença
- Relatórios baseados em dados reais

---

## 🚀 **CONFIGURAÇÃO RÁPIDA - MODO ONLINE**

### **Passo 1: Upload no Discloud**
1. Acesse [https://discloud.app](https://discloud.app)
2. Faça upload do `sistema-objetivo-ONLINE.zip`
3. Aguarde o deploy (sistema ficará em modo offline temporariamente)

### **Passo 2: Criar Supabase (5 minutos)**
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie conta gratuita
3. "New Project" → Nome: `sistema-objetivo`
4. Região: `South America (São Paulo)`
5. Aguarde criação (~2 minutos)

### **Passo 3: Configurar Banco (3 minutos)**
1. No Supabase → **SQL Editor**
2. Cole e execute `schema.sql` (cria tabelas)
3. Cole e execute `seed-data.sql` (dados iniciais)

### **Passo 4: Conectar no Discloud (2 minutos)**
1. No Supabase → **Settings → API**
2. Copie:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJhbGci...`
3. No Discloud → **Painel → Variáveis de Ambiente**:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
4. **Redefine** o app no Discloud

### **✅ Pronto! Sistema online em 10 minutos**

---

## 👥 **DADOS INCLUSOS NO SISTEMA**

Após configurar, você terá um sistema completo com:

### **Usuários de Teste:**
| Tipo | Email | Senha | Acesso |
|------|-------|-------|---------|
| **Admin** | admin@objetivo.com | admin123 | Gestão completa |
| **Professor** | professor@objetivo.com | prof123 | Turmas e disciplinas |
| **Pai** | pai@objetivo.com | pai123 | Filhos e comunicação |

### **Dados Inclusos:**
- ✅ **7 alunos** em 4 turmas diferentes
- ✅ **8 disciplinas** (Matemática, Português, etc.)
- ✅ **Notas** de exemplo já lançadas
- ✅ **Presenças** registradas
- ✅ **Recados** para demonstração
- ✅ **Materiais** de estudo
- ✅ **Provas e tarefas** programadas

---

## 💰 **CUSTO TOTAL: GRATUITO**

### **Discloud:**
- Plano gratuito ou básico

### **Supabase:**
- **Gratuito**: 500MB + 50.000 requests/mês
- **Suficiente para**: Escola com até 200 alunos
- **Upgrade opcional**: R$ 100/mês para escolas grandes

---

## 🎉 **RESULTADO FINAL**

Terá um sistema educacional completo com:

- 🏫 **Gestão Escolar**: Alunos, turmas, disciplinas
- 📊 **Lançamento de Notas**: Professores lançam, pais veem
- 📅 **Controle de Presença**: Chamada digital
- 📨 **Comunicação**: Recados entre escola e família
- 📚 **Materiais**: Compartilhamento de conteúdo
- 📈 **Relatórios**: Dados em tempo real
- 👨‍👩‍👧‍👦 **Multi-perfil**: Admin, professores, pais
- 🔄 **Tempo Real**: Sincronização instantânea
- 💾 **Backup**: Dados seguros na nuvem

---

## 📞 **SUPORTE**

Os scripts SQL e configuração estão inclusos no ZIP.

**🎯 Sistema Objetivo Educacional - Pronto para sua escola!**