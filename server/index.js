// Simple placeholder Express server (expand later for secure admin tasks / service role usage)
import express from 'express';
import cors from 'cors';

console.log('[server] Bootstrapping Express backend... Node', process.version, 'PID', process.pid);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// Dev stubs para endpoints de WhatsApp usados no frontend
// Mantém um estado em memória para simular conexão
const waState = {
  connected: false,
  status: 'disconnected', // 'connected' | 'connecting' | 'qr_code' | 'disconnected' | 'error'
  qrCode: undefined,
  lastError: undefined,
  provider: 'WhatsApp Web (Puppeteer)',
  timestamp: new Date().toISOString(),
};

app.get('/api/whatsapp/status', (_req, res) => {
  // Atualiza timestamp a cada consulta
  waState.timestamp = new Date().toISOString();
  res.json({ ...waState });
});

app.post('/api/whatsapp/connect', (_req, res) => {
  // Simula conexão imediata
  waState.connected = true;
  waState.status = 'connected';
  waState.qrCode = undefined;
  waState.lastError = undefined;
  waState.timestamp = new Date().toISOString();
  res.json({ ...waState });
});

app.post('/api/whatsapp/disconnect', (_req, res) => {
  waState.connected = false;
  waState.status = 'disconnected';
  waState.qrCode = undefined;
  waState.timestamp = new Date().toISOString();
  res.json({ ok: true });
});

app.post('/api/whatsapp/send-message', (req, res) => {
  const { phone, message } = req.body || {};
  if (!waState.connected) {
    return res.status(400).json({ success: false, error: 'WhatsApp não conectado' });
  }
  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'Parâmetros inválidos' });
  }
  // Simula envio com sucesso
  res.json({ success: true, number: String(phone), message: 'Enviado' });
});

app.post('/api/whatsapp/send-bulk', (req, res) => {
  const { numbers, message } = req.body || {};
  if (!waState.connected) {
    return res.status(400).json({ success: false, error: 'WhatsApp não conectado' });
  }
  if (!Array.isArray(numbers) || !message) {
    return res.status(400).json({ success: false, error: 'Parâmetros inválidos' });
  }

  const results = numbers.map((n) => {
    const num = String(n);
    // Regras de simulação: sucesso para números com último dígito par
    const lastDigit = parseInt(num[num.length - 1] || '0', 10);
    const success = !Number.isNaN(lastDigit) ? lastDigit % 2 === 0 : true;
    return success
      ? { success: true, number: num, message: 'Enviado' }
      : { success: false, number: num, error: 'Falha simulada' };
  });

  const sucessos = results.filter(r => r.success).length; // mantém grafia usada no frontend
  const falhas = results.length - sucessos;

  res.json({
    total: results.length,
    sucessos,
    falhas,
    results,
  });
});

const port = process.env.PORT || 4000;
const httpServer = app.listen(port, () => console.log(`[server] Listening on port ${port}`));

// Removido top-level await hack. Mantemos apenas um ping leve para diagnóstico opcional.
if (process.env.DEV_KEEP_ALIVE === 'interval') {
  setInterval(() => {
    if (!httpServer.listening) console.warn('[server] HTTP server não está mais escutando.');
  }, 5 * 60 * 1000);
}

process.on('uncaughtException', err => console.error('[server] uncaughtException', err));
process.on('unhandledRejection', reason => console.error('[server] unhandledRejection', reason));

// Graceful shutdown
function graceful(){
  console.log('[server] Recebido sinal de encerramento. Fechando HTTP server...');
  httpServer.close(() => {
    console.log('[server] HTTP server fechado.');
    process.exit(0);
  });
  setTimeout(() => {
    console.warn('[server] Forçando exit após timeout.');
    process.exit(1);
  }, 4000).unref();
}
process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
