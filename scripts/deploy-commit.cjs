require('dotenv').config({ path: ['.env.local', '.env'] });
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { DiscloudAPI } = require('../src/lib/discloudAPI.js');

async function deployToDiscloudCommit() {
  console.log('🚀 Fazendo commit/update para aplicação existente...');
  
  const apiToken = process.env.DISCLOUD_TOKEN;
  const appId = process.env.DISCLOUD_APP_ID;
  
  if (!apiToken) {
    throw new Error('❌ DISCLOUD_TOKEN não encontrado no arquivo .env.local');
  }
  
  if (!appId) {
    throw new Error('❌ DISCLOUD_APP_ID não encontrado no arquivo .env.local');
  }

  console.log(`📦 App ID: ${appId}`);
  console.log(`🔑 Token: ${apiToken.substring(0, 10)}...`);
  
  const api = new DiscloudAPI(apiToken);
  
  try {
    // Criar ZIP da pasta dist
    const zip = new AdmZip();
    const distPath = path.join(__dirname, '..', 'dist');
    
    if (!fs.existsSync(distPath)) {
      throw new Error('❌ Pasta dist não encontrada. Execute npm run build primeiro.');
    }
    
    function addFolderToZip(folderPath, zipPath = '') {
      const items = fs.readdirSync(folderPath);
      
      for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          addFolderToZip(itemPath, zipPath ? `${zipPath}/${item}` : item);
        } else {
          const content = fs.readFileSync(itemPath);
          const fileName = zipPath ? `${zipPath}/${item}` : item;
          zip.addFile(fileName, content);
        }
      }
    }
    
    addFolderToZip(distPath);
    
    const zipPath = path.join(__dirname, 'deploy-commit.zip');
    zip.writeZip(zipPath);
    
    const stats = fs.statSync(zipPath);
    console.log(`📦 ZIP criado: ${(stats.size / 1024).toFixed(2)}KB`);
    
    // Fazer commit/upload
    console.log('📤 Enviando atualização...');
    const result = await api.commit(appId, zipPath);
    console.log('✅ Commit realizado com sucesso!', result);
    
    // Limpar arquivo temporário
    fs.unlinkSync(zipPath);
    
    // Verificar status
    console.log('📊 Verificando status...');
    const status = await api.getStatus(appId);
    console.log('📊 Status da aplicação:', status);
    
    console.log('🎉 Deploy concluído!');
    console.log(`🌐 Aplicação disponível em: https://${appId}.discloud.app`);
    
  } catch (error) {
    console.error('❌ Erro durante o commit:', error.message);
    throw error;
  }
}

if (require.main === module) {
  deployToDiscloudCommit().catch(console.error);
}

module.exports = { deployToDiscloudCommit };