// gerarToken.js
// Gera um ID Token do Firebase para um usuário do banco, para testar a API
// no Insomnia/Postman sem precisar passar pela tela de login.
//
// Uso:
//   npm run gerar-token -- email@exemplo.com
//
// Depois, no Insomnia, mande o cabeçalho:
//   Authorization: Bearer <token que aparecer aqui>
const db = require('../Connection/db');
const { firebaseAuth, trocarCustomTokenPorIdToken } = require('../Connection/firebase');
const usuarioRepository = require('../Repositories/usuarioRepository');

async function gerarIdTokenReal() {
    const email = process.argv[2];
    if (!email) {
        console.log('Uso: npm run gerar-token -- email@exemplo.com');
        process.exitCode = 1;
        return;
    }

    const usuario = await usuarioRepository.buscarPorEmail(email.toLowerCase());
    if (!usuario) {
        console.log(`Nenhum usuário com o e-mail ${email} no banco.`);
        process.exitCode = 1;
        return;
    }

    console.log(`⏳ 1. Gerando Custom Token para ${usuario.nome_usuario} (id ${usuario.id}, ${usuario.cargo})...`);
    const customToken = await firebaseAuth.createCustomToken(String(usuario.id), { cargo: usuario.cargo });

    console.log('⏳ 2. Trocando o Custom Token pelo ID Token no Firebase...');
    const { idToken, expiresIn } = await trocarCustomTokenPorIdToken(customToken);

    console.log(`\n✅ SUCESSO! ID Token (vale ${expiresIn / 60} minutos):\n`);
    console.log(idToken);
    console.log('\nNo Insomnia: Authorization: Bearer <token acima>\n');
}

gerarIdTokenReal()
    .catch((erro) => {
        console.error('Erro:', erro.message);
        process.exitCode = 1;
    })
    .finally(() => db.end());
