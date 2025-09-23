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
