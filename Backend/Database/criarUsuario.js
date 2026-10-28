//criarUsuario.js
// Cria um usuário com a senha já criptografada (bcrypt).
// Uso:
//   npm run criar-usuario -- "Nome Completo" email@exemplo.com SenhaForte123 administrador
//   (o último argumento é opcional: usuario | administrador. Padrão: usuario)
const bcrypt = require('bcrypt');
const db = require('../Connection/db');
const usuarioRepository = require('../Repositories/usuarioRepository');
const { validarSenha, CUSTO_BCRYPT } = require('../Controllers/authController');

async function main() {
    const [nome, email, senha, cargo = 'usuario'] = process.argv.slice(2);

    if (!nome || !email || !senha) {
        console.log('Uso: npm run criar-usuario -- "Nome Completo" email@exemplo.com SenhaForte123 [usuario|administrador]');
        process.exitCode = 1;
        return;
    }
    if (!['usuario', 'administrador'].includes(cargo)) {
        console.log('Cargo deve ser "usuario" ou "administrador".');
        process.exitCode = 1;
        return;
    }
    const erroSenha = validarSenha(senha);
    if (erroSenha) {
        console.log(erroSenha);
        process.exitCode = 1;
        return;
    }

    const senhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);
    const id = await usuarioRepository.criar({ nome, email: email.toLowerCase(), senhaHash, cargo });
    console.log(`✅ Usuário criado! id=${id}  e-mail=${email.toLowerCase()}  cargo=${cargo}`);
}

main()
    .catch((erro) => {
        console.error(erro.code === 'ER_DUP_ENTRY' ? 'Esse e-mail já está cadastrado.' : erro);
        process.exitCode = 1;
    })
    .finally(() => db.end());
