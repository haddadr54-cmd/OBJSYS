import https from 'https';

const DISCLOUD_TOKEN = process.env.DISCLOUD_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY2NTgyMzE3OTkyNzkiLCJrZXkiOiIzYzkxNDg4YTk1MDE1ZmQxODI0NDY4ZGIwODg4In0.H5Hc232a1Lb8NPVc3aEWqm43JgPkCvOegwvRirAB9Xo';
const SUBDOMAIN = 'obj';
const INTERVAL = 60 * 1000; // 60s

function checkStatus() {
  const options = {
    hostname: 'api.discloud.app',
    port: 443,
    path: '/v2/app',
    method: 'GET',
    headers: {
      'api-token': DISCLOUD_TOKEN,
      'Accept': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (!json || !json.apps) {
          console.log('❌ Resposta inesperada:', data);
          return;
        }
        const site = json.apps.find(app => app.subdomain === SUBDOMAIN);
        if (!site) {
          console.log(`🔎 Subdomínio '${SUBDOMAIN}' ainda não encontrado. Tentando novamente em 60s...`);
          setTimeout(checkStatus, INTERVAL);
          return;
        }
        console.log(`📦 App: ${site.name || site.id}`);
        console.log(`🌐 Subdomínio: ${site.subdomain}`);
        console.log(`🔗 URL: https://${site.subdomain}.discloud.app`);
        console.log(`🟢 Status: ${site.status}`);
        if (site.status === 'online' && site.subdomain) {
          console.log('🎉 O site está online e disponível!');
        } else {
          console.log('⏳ Subdomínio encontrado, mas ainda não está online. Tentando novamente em 60s...');
          setTimeout(checkStatus, INTERVAL);
        }
      } catch (e) {
        console.log('❌ Erro ao processar resposta:', e.message);
        setTimeout(checkStatus, INTERVAL);
      }
    });
  });
  req.on('error', (err) => {
    console.log('❌ Erro na requisição:', err.message);
    setTimeout(checkStatus, INTERVAL);
  });
  req.end();
}

console.log('⏳ Monitorando status do subdomínio Discloud...');
checkStatus();
