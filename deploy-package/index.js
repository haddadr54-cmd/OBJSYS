// Express server híbrido - serve frontend + API
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[server] Iniciando servidor híbrido... Node', process.version, 'PID', process.pid);

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
const staticPath = path.join(__dirname, '../dist');
console.log('[server] Servindo arquivos estáticos de:', staticPath);
app.use(express.static(staticPath));

// API Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString(), server: 'hybrid' });
});

// API endpoints para WhatsApp
app.get('/api/whatsapp/status', (_req, res) => {
  res.json({ status: 'disconnected' });
});

app.post('/api/whatsapp/connect', (_req, res) => {
  res.json({ ok: true, message: 'Conexão simulada (dev stub)' });
});

app.post('/api/whatsapp/disconnect', (_req, res) => {
  res.json({ ok: true, message: 'Desconectado (dev stub)' });
});

app.post('/api/whatsapp/send-message', (_req, res) => {
  res.json({ ok: true, messageId: 'stub-' + Date.now() });
});

app.post('/api/whatsapp/send-bulk', (_req, res) => {
  res.json({ ok: true, sent: 0, failures: [] });
});

// SPA fallback - todas as rotas não-API servem o index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
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
