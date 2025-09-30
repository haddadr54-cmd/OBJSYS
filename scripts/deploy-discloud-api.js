import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Token da API do Discloud (preferencialmente via variável de ambiente)
const DISCLOUD_TOKEN = process.env.DISCLOUD_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY2NTgyMzE3OTkyNzkiLCJrZXkiOiIzYzkxNDg4YTk1MDE1ZmQxODI0NDY4ZGIwODg4In0.H5Hc232a1Lb8NPVc3aEWqm43JgPkCvOegwvRirAB9Xo';

// Caminho para o arquivo ZIP (aceita argumento de linha de comando)
const argFile = process.argv[2];
const ZIP_FILE = argFile
    ? path.isAbsolute(argFile) ? argFile : path.join(__dirname, '..', argFile)
    : path.join(__dirname, '..', 'sistema-objetivo-discloud.zip');

console.log('🚀 DEPLOY AUTOMÁTICO SISTEMA OBJETIVO - DISCLOUD API');
console.log('================================================');

// Verificar se o arquivo ZIP existe
if (!fs.existsSync(ZIP_FILE)) {
    console.error('❌ Arquivo ZIP não encontrado:', ZIP_FILE);
    console.log('💡 Execute primeiro: npm run deploy:zip');
    process.exit(1);
}

// Função para fazer o upload via API
async function uploadToDiscloud() {
    try {
        console.log('📦 Preparando upload do arquivo:', path.basename(ZIP_FILE));
        
        // Criar FormData
        const form = new FormData();
        form.append('file', fs.createReadStream(ZIP_FILE));
        
        // Opções da requisição
        const options = {
            hostname: 'api.discloud.app',
            port: 443,
            path: '/v2/upload',
            method: 'POST',
            headers: {
                'api-token': DISCLOUD_TOKEN,
                ...form.getHeaders()
            }
        };
        
    console.log('🌐 Enviando para Discloud...');
        
        // Fazer a requisição
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    const httpOk = res.statusCode === 200 || res.statusCode === 201;
                    const apiOk = response?.status && /^(success|ok)$/i.test(response.status);

                    if (httpOk && apiOk) {
                        console.log('✅ Deploy realizado com sucesso!');
                        console.log('📊 Resposta:', response);
                        if (response.url) console.log('🌐 URL da aplicação:', response.url);
                        console.log('\n🎉 Sistema Objetivo está online no Discloud!');
                        return;
                    }

                    // HTTP OK mas API retornou erro (ex.: sem subdomínio aprovado)
                    if (httpOk && !apiOk) {
                        console.warn('⚠️ Upload concluído, porém a API retornou status de erro.');
                        console.warn('📩 Mensagem:', response?.message ?? 'Sem mensagem.');
                        if (typeof response?.message === 'string' && response.message.includes('subdomínio')) {
                            console.warn('\nℹ️ Ação necessária no painel:');
                            console.warn('- Acesse o painel do Discloud, seção Sites.');
                            console.warn('- Solicite/ative um subdomínio gratuito para sua conta ou vincule um domínio próprio.');
                            console.warn('- Após aprovado, rode novamente o deploy.');
                        }
                        return;
                    }

                    // Erro HTTP ou resposta inválida
                    console.error('❌ Erro no deploy:', response);
                    console.error('📋 Status HTTP:', res.statusCode);
                } catch (error) {
                    console.error('❌ Erro ao processar resposta:', error.message);
                    console.log('📄 Resposta bruta:', data);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Erro na requisição:', error.message);
        });
        
        // Enviar o FormData
        form.pipe(req);
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

// Executar o upload
uploadToDiscloud();