# 📱 WhatsApp Z-API Integration

> Produção (Vercel + Supabase)

1) Configure variáveis no Vercel (Project Settings → Environment Variables):
  - VITE_SUPABASE_URL = https://<your-project>.supabase.co
  - VITE_SUPABASE_ANON_KEY = <anon key>
  - Opcional: VITE_DEBUG_REALTIME = true (para logs de realtime no cliente)

2) Realtime no Supabase:
  - Garanta que a publicação `supabase_realtime` inclua as tabelas: recados, provas_tarefas, materiais, notas.
  - Este repo inclui um migration auxiliar: `supabase/migrations/20250924210000_enable_realtime.sql`.
  - Aplique com o CLI do Supabase (ou ajuste na UI):
    supabase db push

3) Deploy no Vercel:
  - O workflow `.github/workflows/vercel-deploy.yml` já puxa envs do Vercel; como fallback, usa secrets do GitHub para gerar `.env.production` (Vite).
  - As rotas SPA são servidas pelo Vercel automaticamente (Vite build SPA). 

Sistema de integração com WhatsApp usando Z-API para automação de mensagens.

## 🚀 Como Usar

### 1. Iniciar o Sistema
```bash
# No diretório raiz do projeto
npm run dev:full
```

### 2. Conectar Z-API
1. Acesse a página WhatsApp no sistema
2. Clique em "Conectar Z-API"
3. Sistema verifica automaticamente o status da instância
4. Certifique-se que o WhatsApp está conectado na sua instância Z-API
5. Aguarde confirmação de conexão

### 3. Enviar Mensagens
- **Individual:** Teste com um número primeiro
- **Em Massa:** Lista de até 50 números
- **Intervalo:** Configure delay entre mensagens

## 📡 Configuração da Instância

### 🔧 Dados da Instância Z-API
- **ID da Instância:** `3E77C41E18874016EF0E2676AA920B85`
- **Token:** `485FD874492F6CFAAC3069AD`
- **URL Base:** `https://api.z-api.io/instances/3E77C41E18874016EF0E2676AA920B85/token/485FD874492F6CFAAC3069AD`

## 📡 Endpoints Disponíveis

### 🔗 Conectar Z-API
```http
POST /api/whatsapp/connect
```

**Resposta:**
```json
{
  "success": true,
  "message": "Z-API conectado com sucesso",
  "connected": true,
  "status": "connected",
  "provider": "Z-API",
  "instanceId": "3E77C41E18874016EF0E2676AA920B85"
}
```

### 🔍 Status da Conexão
```http
GET /api/whatsapp/status
```

**Resposta:**
```json
{
  "success": true,
  "connected": true,
  "status": "connected",
  "provider": "Z-API",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "instanceId": "3E77C41E18874016EF0E2676AA920B85"
}
```

### 📤 Enviar Mensagem Individual
```http
POST /api/whatsapp/send-message
Content-Type: application/json

{
  "number": "5511999999999",
  "message": "Olá! Esta é uma mensagem de teste do Colégio Objetivo."
}
```

### 📢 Envio em Massa
```http
POST /api/whatsapp/send-bulk
Content-Type: application/json

{
  "numbers": [
    "5511999999999",
    "5511888888888",
    "5511777777777"
  ],
  "message": "Comunicado importante da escola!",
  "delay": 5000
}
```

### ✅ Validar Número
```http
POST /api/whatsapp/validate-number
Content-Type: application/json

{
  "number": "(11) 99999-9999"
}
```

### 🔄 Verificar Conexão
```http
POST /api/whatsapp/reconnect
```

### 🔌 Desconectar
```http
POST /api/whatsapp/disconnect
```

### 📋 Informações da Instância
```http
GET /api/whatsapp/device-info
```

## 🛡️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `ZAPI_INIT_ERROR` | Erro ao inicializar Z-API |
| `CONNECTION_ERROR` | Erro de conexão com Z-API |
| `NOT_CONNECTED` | Z-API não está conectado |
| `MISSING_PARAMETERS` | Parâmetros obrigatórios não fornecidos |
| `TOO_MANY_NUMBERS` | Muitos números (máximo 50) |
| `SEND_ERROR` | Erro ao enviar mensagem |
| `RATE_LIMIT_EXCEEDED` | Muitas requisições |
| `INTERNAL_ERROR` | Erro interno do servidor |

## 📝 Formatos de Número Aceitos

- `(11) 99999-9999`
- `11999999999`
- `5511999999999`
- `+55 11 99999-9999`

## ⚙️ Configurações

### API Z-API
- **Método:** REST API
- **Autenticação:** Token de instância
- **Timeout:** 30 segundos para requests
- **Rate Limit:** Conforme plano Z-API

### Limites de Segurança
- **Rate Limit:** 20 requests/minuto
- **Envio em Massa:** Máximo 50 números
- **Delay Mínimo:** 3 segundos entre mensagens
- **Timeout Request:** 30 segundos

## 🔧 Troubleshooting

### Instância não conecta
1. Verifique se a instância Z-API está ativa
2. Confirme que o WhatsApp está conectado na instância
3. Verifique se o token está correto
4. Teste a URL da instância diretamente

### Mensagens não são enviadas
1. Verifique se a instância está conectada
2. Confirme formato dos números (apenas dígitos)
3. Teste com envio individual primeiro
4. Verifique se não há bloqueios na instância

### Conexão perdida
1. Verifique status da instância Z-API
2. Reconecte se necessário
3. Verifique se o WhatsApp ainda está ativo na instância

## 📚 Exemplos de Uso

### JavaScript/Fetch
```javascript
// Conectar Z-API
await fetch('/api/whatsapp/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

// Enviar mensagem
const response = await fetch('/api/whatsapp/send-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    number: '5511999999999',
    message: 'Olá! Mensagem da escola.'
  })
});
```

### cURL
```bash
# Conectar
curl -X POST http://localhost:3001/api/whatsapp/connect

# Verificar status
curl http://localhost:3001/api/whatsapp/status

# Enviar mensagem
curl -X POST http://localhost:3001/api/whatsapp/send-message \
  -H "Content-Type: application/json" \
  -d '{"number":"5511999999999","message":"Teste"}'
```

## 🔒 Segurança

- ✅ Validação de números brasileiros
- ✅ Rate limiting automático (20 req/min)
- ✅ Sanitização de dados
- ✅ Logs de auditoria
- ✅ Tratamento de erros
- ✅ Token seguro da instância

## 💡 Funcionalidades

- ✅ **API REST:** Integração direta com Z-API
- ✅ **Sem Navegador:** Não precisa de Chrome/Puppeteer
- ✅ **Status em Tempo Real:** Verificação automática
- ✅ **Envio Individual:** Teste rápido
- ✅ **Envio em Massa:** Até 50 números
- ✅ **Delay Configurável:** Evita bloqueios
- ✅ **Validação de Números:** Formato brasileiro
- ✅ **Resultados Detalhados:** Sucesso/erro por número
- ✅ **Rate Limiting:** Proteção contra spam

## 📞 Suporte

Para dúvidas:
1. Verifique os logs do servidor
2. Teste endpoints individualmente
3. Confirme se a instância Z-API está ativa
4. Verifique se não há bloqueios de firewall
5. Consulte documentação oficial do Z-API