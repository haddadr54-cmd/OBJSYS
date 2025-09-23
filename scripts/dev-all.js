#!/usr/bin/env node
// Orquestrador de desenvolvimento (A–F):
// A. Evitar processos duplicados (remoção de spawns redundantes + map de processos)
// B. Restart somente em falha (exit code != 0) até MAX_RESTARTS
// C. Porta fixa para frontend (abort se ocupada) — evita Vite mudar para 5174 silenciosamente
// D. Logs claros e únicos de readiness (uma linha "✅ Sistema pronto")
// E. Shutdown limpo removendo lock e enviando SIGTERM sequencialmente; SIGKILL após timeout
// F. Debounce de restart (grace period) para evitar loops rápidos
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync, writeFileSync, rmSync } from 'node:fs';
import http from 'node:http';

const LOCK_PATH = '.devlock';
if (existsSync(LOCK_PATH)) {
  console.error('[dev-all] Outra instância detectada (.devlock existe). Se for zumbi, apague o arquivo e reexecute.');
  process.exit(1);
}
writeFileSync(LOCK_PATH, String(Date.now()));

const processes = new Map(); // name -> child process
let shuttingDown = false;
const restartCounts = { api: 0, web: 0 };
const MAX_RESTARTS = 3;
const RESTART_DEBOUNCE_MS = 1200;
const lastStart = { api: 0, web: 0 };
let readinessPrinted = false;

function log(name, chunk, isErr=false){
  const prefix = isErr ? `[${name}][err]` : `[${name}]`;
  process[isErr ? 'stderr' : 'stdout'].write(`${prefix} ${chunk}`);
}

function spawnProcess(name, cmd, args, opts={}){
  if (processes.has(name)) {
    log('dev-all', `Ignorando tentativa de duplicar processo ${name}.\n`);
    return;
  }
  lastStart[name] = Date.now();
  const child = spawn(cmd, args, { stdio: 'pipe', env: process.env, shell: false, ...opts });
  processes.set(name, child);
  child.stdout.on('data', d => log(name, d));
  child.stderr.on('data', d => log(name, d, true));
  child.on('exit', (code, signal) => {
    processes.delete(name);
    if (shuttingDown) return;
    log('dev-all', `Processo ${name} saiu (code=${code} signal=${signal}).\n`);
    const failed = code !== 0;
    if (!failed) {
      // Encerramento voluntário — derruba todo ambiente para não ficar inconsistente.
      log('dev-all', `Encerramento limpo de ${name}; desligando orquestrador.\n`);
      shutdown(0);
      return;
    }
    if (restartCounts[name] >= MAX_RESTARTS) {
      log('dev-all', `Limite de reinícios atingido para ${name}. Encerrando tudo.\n`);
      shutdown(code || 1);
      return;
    }
    // Debounce
    const since = Date.now() - lastStart[name];
    const waitExtra = since < RESTART_DEBOUNCE_MS ? (RESTART_DEBOUNCE_MS - since) : 0;
    restartCounts[name]++;
    log('dev-all', `Reiniciando ${name} em ${waitExtra}ms (tentativa ${restartCounts[name]}/${MAX_RESTARTS}).\n`);
    setTimeout(() => {
      if (name === 'api') startApi(); else startWeb();
    }, waitExtra);
  });
}

function shutdown(exitCode=0){
  if (shuttingDown) return;
  shuttingDown = true;
  log('dev-all', 'Iniciando shutdown...\n');
  for (const [name, proc] of processes.entries()){
    if (!proc.killed){
      log('dev-all', `Enviando SIGTERM para ${name}...\n`);
      try { proc.kill('SIGTERM'); } catch {}
    }
  }
  setTimeout(() => {
    for (const [name, proc] of processes.entries()){
      if (!proc.killed){
        log('dev-all', `Forçando SIGKILL em ${name}...\n`);
        try { proc.kill('SIGKILL'); } catch {}
      }
    }
    try { rmSync(LOCK_PATH); } catch {}
    process.exit(exitCode);
  }, 1500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function waitFor(url, attempts=40, delay=500){
  for (let i=0;i<attempts;i++) {
    const ok = await new Promise(res => {
      const req = http.get(url, r => { r.resume(); res(r.statusCode === 200); });
      req.on('error', () => res(false));
      req.setTimeout(2500, () => { req.destroy(); res(false); });
    });
    if (ok) return true;
    await new Promise(r => setTimeout(r, delay));
  }
  return false;
}

function portCheck(port){
  return new Promise(resolve => {
    const srv = http.createServer(()=>{});
    srv.listen(port, () => {
      srv.close(() => resolve(true));
    });
    srv.on('error', () => resolve(false));
  });
}

async function startApi(){
  spawnProcess('api', 'node', ['server/index.js']);
}

async function startWeb(){
  const desiredPort = 5173;
  const free = await portCheck(desiredPort);
  if (!free){
    log('dev-all', `Porta ${desiredPort} já está em uso. Aborte a outra instância ou libere a porta (evitando fallback automático).\n`);
    return; // não iniciar duplicado em outra porta silenciosa
  }
  const viteCmdPath = process.platform === 'win32'
    ? resolve(process.cwd(), 'node_modules/.bin/vite.cmd')
    : resolve(process.cwd(), 'node_modules/.bin/vite');
  if (process.platform === 'win32') spawnProcess('web', `"${viteCmdPath}"`, []); else spawnProcess('web', viteCmdPath, []);
}

(async () => {
  startApi();
  startWeb();
  log('dev-all', 'Aguardando readiness (backend /health e frontend /)...\n');
  const apiOk = await waitFor('http://localhost:4000/health');
  if (!apiOk) log('dev-all', 'Backend não respondeu dentro do tempo limite.\n');
  const webOk = await waitFor('http://localhost:5173/');
  if (!webOk) log('dev-all', 'Frontend não respondeu dentro do tempo limite.\n');
  if (apiOk && webOk && !readinessPrinted){
    readinessPrinted = true;
    log('dev-all', '✅ Sistema pronto (backend + frontend).\n');
  }
})();

// Fail-safe: remove lock no exit inesperado
process.on('exit', () => { try { rmSync(LOCK_PATH); } catch {} });

