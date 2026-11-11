//testarSistema.js
// TESTE AUTOMÁTICO DO MÓDULO DE LOGIN, PERFIL E NOTIFICAÇÕES
//   npm run testar
//
// Cria um usuário, um carro e uma vaga TEMPORÁRIOS, testa tudo pela API de verdade
// (MySQL + Firebase) e no final apaga tudo o que criou.
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const app = require('../Server/app');
const db = require('../Connection/db');
const { firebaseAuth } = require('../Connection/firebase');
const recuperacaoSenhaRepository = require('../Repositories/recuperacaoSenhaRepository');

const SENHA_INICIAL = 'Teste1234';
const SENHA_NOVA = 'NovaSenha567';
const SENHA_FINAL = 'OutraSenha890';
const sufixo = crypto.randomBytes(3).toString('hex').toUpperCase();
const EMAIL = `teste.automatico.${sufixo.toLowerCase()}@example.com`;
const PLACA = `T${sufixo}`;
const VAGA = `TST${sufixo.slice(0, 3)}`;

let servidor;
let base;
let idUsuario;
let idCarro;
let idVaga;
let idRegistro;
let passou = 0;
let falhou = 0;

function verificar(condicao, descricao, detalhe) {
    if (condicao) {
        passou++;
        console.log(`  ✅ ${descricao}`);
    } else {
        falhou++;
        console.log(`  ❌ ${descricao}${detalhe ? `  ->  ${JSON.stringify(detalhe)}` : ''}`);
    }
}

async function api(metodo, caminho, corpo, token) {
    const resposta = await fetch(base + caminho, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: corpo ? JSON.stringify(corpo) : undefined
    });
    return { status: resposta.status, dados: await resposta.json().catch(() => ({})) };
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const hmac = (valor) => crypto.createHmac('sha256', process.env.RESET_SECRET).update(String(valor)).digest('hex');

async function etapa(titulo, funcao) {
    console.log(`\n▶ ${titulo}`);
    try {
        await funcao();
    } catch (erro) {
        falhou++;
        console.log(`  ❌ Erro inesperado: ${erro.message}`);
    }
}

async function main() {
    console.log('==========================================================');
    console.log(' TESTE DO MÓDULO DE LOGIN / PERFIL / NOTIFICAÇÕES');
    console.log('==========================================================');

    // ---------------------------------------------------------------
    await etapa('1. Configuração e banco de dados', async () => {
        verificar(Boolean(process.env.FIREBASE_WEB_API_KEY), 'FIREBASE_WEB_API_KEY preenchida no .env');
        verificar(Boolean(process.env.RESET_SECRET), 'RESET_SECRET preenchido no .env');

        const [tabelas] = await db.query('SHOW TABLES');
        const nomes = tabelas.map((t) => Object.values(t)[0].toLowerCase());
        for (const tabela of ['tbl_usuario', 'tbl_carro', 'tbl_vaga', 'tbl_registro_ocupacao',
            'tbl_recuperacao_senha', 'tbl_notificacao_visualizacao']) {
            verificar(nomes.includes(tabela), `Tabela ${tabela} existe`);
        }
    });

    if (falhou > 0) {
        console.log('\n⚠️  Arrume a configuração/banco acima antes de continuar (rode o estacionamentoSenac.sql).');
        return;
    }

    // ---------------------------------------------------------------
    await etapa('2. Criando dados temporários de teste', async () => {
        const senhaHash = await bcrypt.hash(SENHA_INICIAL, 12);
        const [u] = await db.query(
            "INSERT INTO tbl_usuario (nome_usuario, email, senha, cargo) VALUES ('Usuário Teste Automático', ?, ?, 'usuario')",
            [EMAIL, senhaHash]
        );
        idUsuario = u.insertId;
        const [c] = await db.query(
            "INSERT INTO tbl_carro (id_usuario, placa, marca, modelo, cor, tipo_veiculo, ano) VALUES (?, ?, 'Fiat', 'Argo', 'Branco', 'carro', 2024)",
            [idUsuario, PLACA]
        );
        idCarro = c.insertId;
        const [v] = await db.query('INSERT INTO tbl_vaga (codigo_vaga) VALUES (?)', [VAGA]);
        idVaga = v.insertId;
        verificar(idUsuario && idCarro && idVaga, `Usuário ${EMAIL}, carro ${PLACA} e vaga ${VAGA} criados`);

        servidor = app.listen(0);
        await new Promise((resolve) => servidor.once('listening', resolve));
        base = `http://127.0.0.1:${servidor.address().port}/api`;
        verificar(true, `API de teste no ar em ${base}`);
    });

    let sessao;

    // ---------------------------------------------------------------
    await etapa('3. Login', async () => {
        let r = await api('POST', '/auth/login', { email: EMAIL, senha: 'senhaErrada1' });
        verificar(r.status === 401, 'Senha errada é recusada (401)', r);
        verificar(r.dados.erro === 'E-mail ou senha inválidos.', 'Mensagem não revela se o e-mail existe');

        r = await api('POST', '/auth/login', { email: 'nao.existe@example.com', senha: 'qualquer1' });
        verificar(r.status === 401 && r.dados.erro === 'E-mail ou senha inválidos.', 'E-mail inexistente dá a MESMA mensagem');

        r = await api('POST', '/auth/login', { email: EMAIL.toUpperCase(), senha: SENHA_INICIAL });
        verificar(r.status === 200 && r.dados.success, 'Login correto funciona (e-mail sem diferenciar maiúsculas)', r);
        verificar(typeof r.dados.idToken === 'string' && r.dados.idToken.split('.').length === 3, 'Firebase devolveu o ID Token (JWT)');
        verificar(typeof r.dados.refreshToken === 'string', 'Firebase devolveu o Refresh Token');
        verificar(r.dados.usuario?.id === idUsuario && r.dados.usuario?.cargo === 'usuario', 'Dados do usuário vieram junto');
        verificar(!('senha' in (r.dados.usuario || {})), 'A senha (hash) NÃO é enviada para o front');
        sessao = r.dados;

        const decodificado = await firebaseAuth.verifyIdToken(sessao.idToken);
        verificar(decodificado.uid === String(idUsuario), 'uid do token = id do usuário no MySQL');
        verificar(decodificado.cargo === 'usuario', 'Cargo está gravado dentro do token');
    });

    // ---------------------------------------------------------------
    await etapa('4. Rotas protegidas', async () => {
        let r = await api('GET', '/auth/me');
        verificar(r.status === 401 && r.dados.erro === 'Você precisa estar logado para acessar.', 'Sem token = bloqueado (401)');

        r = await api('GET', '/auth/me', null, 'token.falso.qualquer');
        verificar(r.status === 401, 'Token falso = bloqueado (401)');

        r = await api('GET', '/auth/me', null, sessao.idToken);
        verificar(r.status === 200 && r.dados.usuario?.email === EMAIL, 'Com token válido = liberado e sabe quem é', r);

        r = await api('POST', '/auth/refresh', { refreshToken: sessao.refreshToken });
        verificar(r.status === 200 && r.dados.idToken, 'Refresh Token gera um novo ID Token', r);
        const novo = await api('GET', '/auth/me', null, r.dados.idToken);
        verificar(novo.status === 200, 'O novo ID Token funciona');
    });

    // ---------------------------------------------------------------
    await etapa('5. Perfil', async () => {
        let r = await api('GET', '/usuarios/perfil', null, sessao.idToken);
        verificar(r.status === 200 && r.dados.data?.email === EMAIL, 'Perfil carrega os dados do usuário logado', r);
        const carro = r.dados.data?.carros?.[0];
        verificar(carro?.placa === PLACA && carro?.modelo === 'Argo', 'Perfil traz o carro do usuário');
        verificar(carro?.estacionado === null, 'Carro aparece como "fora do estacionamento"');

        r = await api('PUT', '/usuarios/perfil', { nome: 'Teste Editado', email: EMAIL, telefone: '(11) 98888-7777' }, sessao.idToken);
        verificar(r.status === 200 && r.dados.usuario?.telefone === '11988887777', 'Editar nome/telefone funciona', r);

        r = await api('PUT', '/usuarios/perfil', { nome: 'X', email: 'invalido', telefone: '' }, sessao.idToken);
        verificar(r.status === 400, 'Dados inválidos são recusados (400)');
    });

    // ---------------------------------------------------------------
    await etapa('6. Notificações (carro entrando e saindo)', async () => {
        let r = await api('GET', '/notificacoes', null, sessao.idToken);
        verificar(r.status === 200 && r.dados.unreadCount === 0, 'Começa sem notificações', r.dados);

        const [reg] = await db.query(
            "INSERT INTO tbl_registro_ocupacao (id_carro, id_vaga, valor_hora, data_entrada) VALUES (?, ?, 10.00, NOW())",
            [idCarro, idVaga]
        );
        idRegistro = reg.insertId;

        r = await api('GET', '/notificacoes', null, sessao.idToken);
        verificar(r.dados.unreadCount === 1, 'Carro ENTROU -> bolinha vai para 1', r.dados);
        verificar(r.dados.data?.[0]?.tipo === 'ENTRADA' && r.dados.data[0].mensagem.includes(PLACA), 'Mensagem de ENTRADA com a placa', r.dados.data?.[0]);

        const perfil = await api('GET', '/usuarios/perfil', null, sessao.idToken);
        verificar(perfil.dados.data?.carros?.[0]?.estacionado?.vaga === VAGA, `Perfil mostra o carro estacionado na vaga ${VAGA}`);

        r = await api('POST', '/notificacoes/marcar-lidas', null, sessao.idToken);
        verificar(r.status === 200, 'Abrir o sino marca como lidas');
        r = await api('GET', '/notificacoes', null, sessao.idToken);
        verificar(r.dados.unreadCount === 0, 'Bolinha volta para 0', r.dados);

        await esperar(1100);
        await db.query('UPDATE tbl_registro_ocupacao SET data_saida = NOW() WHERE id = ?', [idRegistro]);
        r = await api('GET', '/notificacoes', null, sessao.idToken);
        verificar(r.dados.unreadCount === 1 && r.dados.data?.[0]?.tipo === 'SAIDA', 'Carro SAIU -> nova notificação de SAÍDA', r.dados);

        // Outro usuário não pode ver as notificações deste
        const [outro] = await db.query(
            "INSERT INTO tbl_usuario (nome_usuario, email, senha, cargo) VALUES ('Outro Teste', ?, 'x', 'usuario')",
            [`outro.${EMAIL}`]
        );
        const { trocarCustomTokenPorIdToken } = require('../Connection/firebase');
        const tokenOutro = (await trocarCustomTokenPorIdToken(await firebaseAuth.createCustomToken(String(outro.insertId)))).idToken;
        r = await api('GET', '/notificacoes', null, tokenOutro);
        verificar(!r.dados.data?.some((n) => n.placa === PLACA), 'Outro usuário NÃO vê as notificações deste carro');
        await db.query('DELETE FROM tbl_usuario WHERE id = ?', [outro.insertId]);
        await firebaseAuth.deleteUser(String(outro.insertId)).catch(() => {});
    });

    // ---------------------------------------------------------------
    await etapa('7. Esqueci a senha - jeito 1: código de 6 dígitos', async () => {
        let r = await api('POST', '/auth/esqueci-senha', { email: 'nao.existe@example.com' });
        const respostaInexistente = r.dados.mensagem;
        r = await api('POST', '/auth/esqueci-senha', { email: EMAIL });
        verificar(r.status === 200 && r.dados.mensagem === respostaInexistente, 'Mesma resposta para e-mail existente e inexistente');

        const [pedidos] = await db.query('SELECT * FROM tbl_recuperacao_senha WHERE id_usuario = ?', [idUsuario]);
        verificar(pedidos.length === 1 && pedidos[0].token_hash.length === 64, 'Pedido salvo no banco só com HASH (não o código)');

        // Como o e-mail não é lido aqui, criamos um pedido com código conhecido
        const codigo = '123456';
        await recuperacaoSenhaRepository.criar(idUsuario, hmac(crypto.randomBytes(32).toString('hex')), hmac(codigo), 15);

        r = await api('POST', '/auth/redefinir-senha', { email: EMAIL, codigo: '000000', novaSenha: SENHA_NOVA });
        verificar(r.status === 400, 'Código errado é recusado');
        r = await api('POST', '/auth/redefinir-senha', { email: EMAIL, codigo, novaSenha: '123' });
        verificar(r.status === 400, 'Senha fraca é recusada');
        r = await api('POST', '/auth/redefinir-senha', { email: EMAIL, codigo, novaSenha: SENHA_NOVA });
        verificar(r.status === 200, 'Código certo redefine a senha', r);
        r = await api('POST', '/auth/redefinir-senha', { email: EMAIL, codigo, novaSenha: 'Mais1senha' });
        verificar(r.status === 400, 'O mesmo código NÃO funciona duas vezes');

        r = await api('POST', '/auth/login', { email: EMAIL, senha: SENHA_INICIAL });
        verificar(r.status === 401, 'Senha antiga não entra mais');
        r = await api('POST', '/auth/login', { email: EMAIL, senha: SENHA_NOVA });
        verificar(r.status === 200, 'Senha nova entra');

        r = await api('GET', '/auth/me', null, sessao.idToken);
        verificar(r.status === 401 && r.dados.erro === 'Sessão expirada ou token inválido.',
            'Sessão antiga foi DERRUBADA ao trocar a senha (token revogado)', r.dados);
    });

    // ---------------------------------------------------------------
    await etapa('8. Esqueci a senha - jeito 2: link do e-mail', async () => {
        const token = crypto.randomBytes(32).toString('hex');
        await recuperacaoSenhaRepository.criar(idUsuario, hmac(token), hmac('654321'), 15);

        let r = await api('POST', '/auth/redefinir-senha', { token: 'link-falso', novaSenha: SENHA_FINAL });
        verificar(r.status === 400, 'Link falso é recusado');
        r = await api('POST', '/auth/redefinir-senha', { token, novaSenha: SENHA_FINAL });
        verificar(r.status === 200, 'Link verdadeiro redefine a senha', r);
        r = await api('POST', '/auth/redefinir-senha', { token, novaSenha: 'Mais1senha' });
        verificar(r.status === 400, 'O mesmo link NÃO funciona duas vezes');

        // Link vencido
        const tokenVencido = crypto.randomBytes(32).toString('hex');
        await recuperacaoSenhaRepository.criar(idUsuario, hmac(tokenVencido), hmac('111111'), 15);
        await db.query('UPDATE tbl_recuperacao_senha SET expira_em = DATE_SUB(NOW(), INTERVAL 1 MINUTE) WHERE token_hash = ?', [hmac(tokenVencido)]);
        r = await api('POST', '/auth/redefinir-senha', { token: tokenVencido, novaSenha: 'Mais1senha' });
        verificar(r.status === 400, 'Link vencido (mais de 15 min) é recusado');
    });

    // ---------------------------------------------------------------
    await etapa('9. Alterar senha logado e conta desativada', async () => {
        // O Firebase revoga por segundo: espera para o novo login não cair no mesmo segundo da troca de senha
        await esperar(1100);
        let r = await api('POST', '/auth/login', { email: EMAIL, senha: SENHA_FINAL });
        verificar(r.status === 200, 'Login com a senha redefinida pelo link');
        const token = r.dados.idToken;

        r = await api('GET', '/auth/me', null, token);
        verificar(r.status === 200, 'A sessão nova (depois da troca de senha) funciona', r.dados);

        r = await api('PUT', '/auth/senha', { senhaAtual: 'errada123', novaSenha: 'Qualquer123' }, token);
        verificar(r.status === 401 && r.dados.erro === 'Senha atual incorreta.', 'Alterar senha exige a senha atual correta', r.dados);

        await db.query('UPDATE tbl_usuario SET ativo = FALSE WHERE id = ?', [idUsuario]);
        r = await api('POST', '/auth/login', { email: EMAIL, senha: SENHA_FINAL });
        verificar(r.status === 403, 'Conta desativada não consegue logar');
        r = await api('GET', '/auth/me', null, token);
        verificar(r.status === 401 && r.dados.erro === 'Conta desativada ou inexistente.',
            'Conta desativada perde o acesso na hora, mesmo com token', r.dados);
    });
}

async function limpar() {
    console.log('\n▶ Limpando dados temporários');
    try {
        if (idRegistro) await db.query('DELETE FROM tbl_registro_ocupacao WHERE id = ?', [idRegistro]);
        if (idUsuario) {
            await db.query('DELETE FROM tbl_recuperacao_senha WHERE id_usuario = ?', [idUsuario]);
            await db.query('DELETE FROM tbl_notificacao_visualizacao WHERE id_usuario = ?', [idUsuario]);
        }
        if (idCarro) await db.query('DELETE FROM tbl_carro WHERE id = ?', [idCarro]);
        if (idVaga) await db.query('DELETE FROM tbl_vaga WHERE id = ?', [idVaga]);
        if (idUsuario) {
            await db.query('DELETE FROM tbl_usuario WHERE id = ?', [idUsuario]);
            await firebaseAuth.deleteUser(String(idUsuario)).catch(() => {});
        }
        console.log('  🧹 Tudo apagado (banco e Firebase)');
    } catch (erro) {
        console.log(`  ⚠️  Não consegui limpar tudo: ${erro.message}`);
    }
}

main()
    .catch((erro) => {
        falhou++;
        console.error(`\n❌ Erro: ${erro.code === 'ER_ACCESS_DENIED_ERROR'
            ? 'o MySQL recusou a senha. Confira DB_USER e DB_PASSWORD no .env.'
            : erro.code === 'ER_BAD_DB_ERROR'
                ? 'o banco não existe. Rode o Backend/Database/estacionamentoSenac.sql no Workbench.'
                : erro.message}`);
    })
    .finally(async () => {
        await limpar();
        if (servidor) servidor.close();
        await db.end();
        console.log('\n==========================================================');
        console.log(falhou === 0
            ? ` 🎉 TUDO FUNCIONANDO: ${passou} verificações passaram`
            : ` ⚠️  ${falhou} falharam, ${passou} passaram`);
        console.log('==========================================================');
        process.exitCode = falhou === 0 ? 0 : 1;
    });
