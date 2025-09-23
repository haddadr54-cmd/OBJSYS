## Sistema Escolar (React + Vite + Supabase)

[![CI](https://github.com/haddadr54-cmd/OBJSYS/actions/workflows/ci.yml/badge.svg)](https://github.com/haddadr54-cmd/OBJSYS/actions/workflows/ci.yml)
[![Latest Release](https://img.shields.io/github/v/release/haddadr54-cmd/OBJSYS?label=latest%20release&sort=semver)](https://github.com/haddadr54-cmd/OBJSYS/releases/latest)
[![Release](https://img.shields.io/github/v/tag/haddadr54-cmd/OBJSYS?label=latest%20tag)](https://github.com/haddadr54-cmd/OBJSYS/tags)

Portal escolar com suporte a operação offline, sincronização em tempo real e políticas de segurança (RLS) para entidades acadêmicas.

### Stack
- Frontend: React + Vite + TypeScript + Tailwind
- Backend Dev Helper: Express simples (`server/index.js`) para endpoints futuros privilegiados
- Banco/Dados: Supabase (Postgres + Realtime + Auth + RLS)
- Offline Fallback: `localDatabase.ts` (armazenamento localStorage + dataset mock)
- Orquestração Dev: `node scripts/dev-all.js` (inicia backend + frontend, restart controlado)

### Principais Recursos Implementados
- Perfis: admin, professor, pai (controle de visão e ações)
- Notas: criação, edição e exclusão (admin ou professor da disciplina)
- Recados: criação, deleção em massa e reconciliação realtime (fila + broadcast redundante)
- Materiais e Provas/Tarefas: CRUD com RLS aplicada
- Configurações de UI dinâmicas (login / sidebar) persistidas em `configuracoes_globais`
- Sincronização Realtime unificada por canal com fallback a refetch
- Auditoria de provisionamento (`scripts/provision-audit.cjs`) para vincular usuários → auth
- Health check (`scripts/health-check.cjs`) usado pelo orquestrador

### Segurança & RLS (Estado Atual)
Policies ativas nas tabelas (exemplos):
- notas: leitura restrita (admin + professor relacionado); mutação condicionada a papel
- recados: visibilidade contextual (fase 2) + broadcast de deleção
- materiais, provas_tarefas: RLS por papel/disciplina
- futuras (planejadas): presencas, horarios_aula, turma_disciplinas, visualizações de leitura

### Executar em Desenvolvimento
Crie `.env.local` na raiz `project/`:
```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY_AQUI
```

Instalar dependências e iniciar ambos (backend + frontend):
```
npm install
node scripts/dev-all.js
```
Ou apenas o frontend (Vite):
```
npm run dev
```

Executar checagens locais rápidas:
```
npm run typecheck
npm run lint
npm run build
```

### Estrutura de Pastas (resumida)
```
src/
	components/ (Dashboards, Pages, Modals, Auth)
	contexts/ (AuthContext, LogoContext)
	lib/ (supabase.ts, dataService.ts, localDatabase.ts, realtime util)
	utils/ (configManager.tsx)
server/ (Express dev helper)
supabase/migrations/ (SQL versionado / RLS)
scripts/ (dev-all, health-check, provision-audit)
```

### Scripts Principais
| Script | Descrição |
|--------|-----------|
| `node scripts/dev-all.js` | Sobe backend + frontend com health gating e restarts em falha |
| `npm run dev` | Apenas frontend (Vite) |
| `npm run server:watch` | Backend Express em watch (se definido) |
| `node scripts/provision-audit.cjs` | Auditoria de vínculo auth_user_id |
| `node scripts/health-check.cjs` | Verificação de disponibilidade |

### Modo Offline
`dataService` decide dinamicamente: se Supabase não disponível (variáveis ausentes) usa `localDatabase`. Divergências de schema são mapeadas e consolidadas gradualmente.

### Orquestrador (scripts/dev-all.js)
Implementa: lock `.devlock`, reinício limitado, detecção de porta ocupada (porta fixa 5173), debounce, readiness única e shutdown limpo.

### Roadmap (Prioritário)
1. Completar RLS para presenças / horários / turma_disciplinas
2. Remover autenticação legacy e migrar 100% para Supabase Auth
3. Testes (Vitest): permissões, realtime reconciliation, mapeadores offline
4. Auditoria estruturada (tabela log + triggers) e métricas básicas
5. Normalização completa dos mapeamentos offline ⇄ online
6. Otimizações de queries (reduzir N+1) e caching leve

### Boas Práticas Adotadas
- RLS antes de expor funcionalidades críticas
- Broadcast redundante para consistência de deleções em tempo real
- Orquestração Node pura sem dependência de shell específico
- Evitado hardcode de chaves (requere `.env.local`)

### Publicação / Deploy (Visão Geral)
Para produção recomenda-se:
1. Backend intermediário (service role) para ações administrativas
2. Build `npm run build` e servir `dist/` via CDN / edge
3. Políticas RLS revisadas + testes automáticos
4. Monitoração: logs estruturados + métricas de erros

### Deploy na Vercel
- Este projeto já inclui `vercel.json` para deploy estático da SPA (Vite) com fallback de rotas.
- Passos:
  1. Crie uma conta e um projeto em vercel.com, importando o repositório OBJSYS.
  2. Em Project Settings → Environment Variables, adicione as variáveis:
	  - `VITE_SUPABASE_URL`
	  - `VITE_SUPABASE_ANON_KEY`
  3. Nas configurações de Build & Output:
	  - Build Command: `npm run build`
	  - Output Directory: `dist`
  4. Deploy. A Vercel irá rodar o build e publicar `dist/` com o rewrite para `index.html`.

Opcional (CLI):
```
npm i -g vercel
vercel link
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

### Supabase no GitHub (Configuração de Repositório)
Defina os segredos do repositório (Settings → Secrets and variables → Actions → New repository secret):

- `VITE_SUPABASE_URL` (para pré-visualização/deploys que injetam env do repo)
- `VITE_SUPABASE_ANON_KEY` (chave anônima do projeto)
- `SUPABASE_URL` (para jobs Node/CI que não usam Vite env)
- `SUPABASE_SERVICE_ROLE_KEY` (apenas para jobs de auditoria/admin; NUNCA expor em frontend)

Workflows adicionados:
- `.github/workflows/ci.yml`: build/lint/typecheck em pushes e PRs da branch master.
- `.github/workflows/supabase-audit.yml`: execução manual (Actions → Supabase Audit) que roda `npm run provision:audit` usando `SUPABASE_SERVICE_ROLE_KEY` para verificar vínculos (somente backend/CI).

Observações de segurança:
- O arquivo `.env` local está em `.gitignore` (não é commitado). Use `.env.local` ou variáveis do provedor de deploy.
- Nunca injete `SUPABASE_SERVICE_ROLE_KEY` no frontend. Use apenas em ambiente seguro (CI/servidor).

### Licença
Definir antes de distribuição pública (atualmente uso interno).

---
Contribuições: abrir issues descrevendo contexto, risco e benefício. Pull requests com testes e descrição clara.
