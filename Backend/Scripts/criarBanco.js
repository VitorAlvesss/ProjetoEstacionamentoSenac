//criarBanco.js
// Cria o banco e as tabelas sem precisar abrir o Workbench.
//   npm run criar-banco              -> só as tabelas
//   npm run criar-banco -- exemplos  -> tabelas + dados de exemplo (usuários, vagas, carros)
// Não apaga nada: tabelas que já existem ficam como estão.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const PASTA_SQL = path.resolve(__dirname, '../Database');

async function main() {
    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        await conexao.query(fs.readFileSync(path.join(PASTA_SQL, 'estacionamentoSenac.sql'), 'utf8'));
        console.log('✅ Banco estacionamentoSenac e tabelas prontos.');

        if (process.argv[2] === 'exemplos') {
            const [jaTem] = await conexao.query(
                "SELECT id FROM estacionamentoSenac.tbl_usuario WHERE email = 'admin@goiabinha.com'"
            );
            if (jaTem.length > 0) {
                console.log('ℹ️  Dados de exemplo já estavam no banco (nada foi duplicado).');
            } else {
                await conexao.query(fs.readFileSync(path.join(PASTA_SQL, 'dadosExemplo.sql'), 'utf8'));
                console.log('✅ Dados de exemplo inseridos:');
                console.log('   Administrador: admin@goiabinha.com / Admin1234');
                console.log('   Usuário comum: maria@goiabinha.com / Usuario1234');
            }
        }
    } finally {
        await conexao.end();
    }
}

main().catch((erro) => {
    console.error(erro.code === 'ER_ACCESS_DENIED_ERROR'
        ? '❌ O MySQL recusou a senha. Confira DB_USER e DB_PASSWORD no .env.'
        : `❌ ${erro.message}`);
    process.exitCode = 1;
});
