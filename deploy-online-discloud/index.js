import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// API endpoints básicos para funcionalidade offline
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'production',
    version: '1.0.0'
  });
});

// Fallback para SPA - todas as rotas não-API retornam index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Sistema Objetivo Educacional rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'production'}`);
});