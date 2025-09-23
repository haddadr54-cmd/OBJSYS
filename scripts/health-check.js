#!/usr/bin/env node
/**
 * Simple health checker that waits for frontend (Vite) and backend Express.
 * Usage: node scripts/health-check.js
 */
const http = require('http');

const FRONTEND_PORTS = [5173,5174,5175,5176,5177];
const BACKEND_PORT = process.env.BACKEND_PORT || 4000;

function check(url){
  return new Promise(resolve=>{
    const req = http.get(url, res=>{res.resume(); resolve({url, status: res.statusCode});});
    req.on('error',()=>resolve({url, status: 'DOWN'}));
    req.setTimeout(3000, ()=>{req.destroy(); resolve({url, status:'TIMEOUT'});});
  });
}

(async()=>{
  console.log('[health-check] Iniciando verificação...');
  // Backend
  const backend = await check(`http://localhost:${BACKEND_PORT}/health`);
  console.log(' Backend:', backend);
  // Frontend (primeiro que responder 200)
  let frontendResult = null;
  for (const p of FRONTEND_PORTS){
    const r = await check(`http://localhost:${p}/`);
    if (r.status === 200){ frontendResult = r; break; }
    if (!frontendResult) frontendResult = r; // keep first attempt
  }
  console.log(' Frontend:', frontendResult);
  const ok = backend.status === 200 && frontendResult.status === 200;
  if (!ok){
    console.log('\n⚠️  Algum serviço ainda não respondeu com 200. Tente novamente em alguns segundos.');
    process.exitCode = 1;
  } else {
    console.log('\n✅ Sistema ativo (frontend + backend).');
  }
})();
