//authController.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { firebaseAuth, trocarCustomTokenPorIdToken, renovarIdToken, encerrarSessoes } = require('../Connection/firebase');
const usuarioRepository = require('../Repositories/usuarioRepository');
const recuperacaoSenhaRepository = require('../Repositories/recuperacaoSenhaRepository');
const emailService = require('../Services/emailService');

const CUSTO_BCRYPT = 12;
const MINUTOS_VALIDADE_RECUPERACAO = 15;
const MAX_TENTATIVAS_CODIGO = 5;

// Hash "falso" usado quando o e-mail não existe, para o tempo de resposta ser igual
// ao de um e-mail existente (assim ninguém descobre quais e-mails estão cadastrados).
const HASH_FALSO = bcrypt.hashSync('senha-que-nao-existe', CUSTO_BCRYPT);

// HMAC com segredo do servidor: mesmo com o banco vazado, não dá para testar códigos offline
function gerarHash(valor) {
    return crypto.createHmac('sha256', process.env.RESET_SECRET).update(String(valor)).digest('hex');
}

function hashesIguais(a, b) {
    return a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Regra de senha forte: 8+ caracteres, com letra e número
function validarSenha(senha) {
    if (typeof senha !== 'string' || senha.length < 8 || senha.length > 72) {
        return "A senha deve ter entre 8 e 72 caracteres.";
    }
    if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
        return "A senha deve ter pelo menos uma letra e um número.";
    }
    return null;
}

function dadosPublicos(usuario) {
    return {
        id: usuario.id,
        nome: usuario.nome_usuario,
        email: usuario.email,
        telefone: usuario.numero_usuario,
        cargo: usuario.cargo
    };
}

// Gera a sessão Firebase: Custom Token (com o cargo dentro) -> ID Token + Refresh Token
async function criarSessaoFirebase(usuario) {
    const customToken = await firebaseAuth.createCustomToken(String(usuario.id), { cargo: usuario.cargo });
    return trocarCustomTokenPorIdToken(customToken);
}

// Troca a senha, invalida links/códigos pendentes e derruba todas as sessões abertas
async function trocarSenhaEEncerrarSessoes(usuario, novaSenha) {
    const hash = await bcrypt.hash(novaSenha, CUSTO_BCRYPT);
    await usuarioRepository.atualizarSenha(usuario.id, hash);
    await recuperacaoSenhaRepository.invalidarTodosDoUsuario(usuario.id);
    await encerrarSessoes(usuario.id);
    emailService.enviarAvisoSenhaAlterada(usuario.email, usuario.nome_usuario)
        .catch((erro) => console.error("Erro ao enviar aviso de senha alterada:", erro.message));
}

const authController = {
    // POST /api/auth/login  { email, senha }
    login: async (req, res) => {
        const login = String(req.body?.email || '').trim().toLowerCase();
        const senha = String(req.body?.senha || '');

        if (!login || !senha) {
            return res.status(400).json({ success: false, erro: "Informe e-mail e senha." });
        }

        try {
            const usuario = await usuarioRepository.buscarPorLogin(login);
            const senhaCorreta = await bcrypt.compare(senha, usuario ? usuario.senha : HASH_FALSO);

            // Mesma mensagem para "não existe" e "senha errada"
            if (!usuario || !senhaCorreta) {
                return res.status(401).json({ success: false, erro: "E-mail ou senha inválidos." });
            }

            if (!usuario.ativo) {
                return res.status(403).json({ success: false, erro: "Conta desativada. Procure a administração." });
            }

            const sessao = await criarSessaoFirebase(usuario);

            return res.json({
                success: true,
                ...sessao,
                usuario: dadosPublicos(usuario)
            });

        } catch (error) {
            console.error("Erro no AuthController (login):", error);
            return res.status(500).json({ success: false, erro: "Erro interno no servidor." });
        }
    },

    // POST /api/auth/refresh  { refreshToken }  -> novo ID Token quando o atual (1h) expira
    refresh: async (req, res) => {
        const refreshToken = req.body?.refreshToken;
        if (typeof refreshToken !== 'string' || !refreshToken) {
            return res.status(400).json({ success: false, erro: "Refresh token ausente." });
        }

        try {
            const sessao = await renovarIdToken(refreshToken);
            if (!sessao) {
                return res.status(401).json({ success: false, erro: "Sessão expirada. Faça login novamente." });
            }

            const usuario = await usuarioRepository.buscarPorId(sessao.uid);
            if (!usuario || !usuario.ativo) {
                return res.status(401).json({ success: false, erro: "Conta desativada ou inexistente." });
            }

            return res.json({
                success: true,
                idToken: sessao.idToken,
                refreshToken: sessao.refreshToken,
                expiresIn: sessao.expiresIn,
                usuario: dadosPublicos(usuario)
            });
        } catch (error) {
            console.error("Erro no AuthController (refresh):", error);
            return res.status(500).json({ success: false, erro: "Erro interno no servidor." });
        }
    },

    // GET /api/auth/me  (rota protegida) -> quem está logado
    me: (req, res) => {
        return res.json({ success: true, usuario: req.usuario });
    },

    // POST /api/auth/esqueci-senha  { email }
    // Envia por e-mail UM link e UM código de 6 dígitos (o usuário escolhe qual usar).
    esqueciSenha: async (req, res) => {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const respostaPadrao = {
            success: true,
            mensagem: "Se este e-mail estiver cadastrado, você receberá um link e um código para redefinir a senha."
        };

        if (!email) {
            return res.status(400).json({ success: false, erro: "Informe o e-mail." });
        }

        try {
            const usuario = await usuarioRepository.buscarPorEmail(email);

            // Sempre a mesma resposta, exista ou não o e-mail
            if (!usuario || !usuario.ativo) {
                return res.json(respostaPadrao);
            }

            const token = crypto.randomBytes(32).toString('hex');
            const codigo = String(crypto.randomInt(0, 1000000)).padStart(6, '0');

            await recuperacaoSenhaRepository.criar(
                usuario.id, gerarHash(token), gerarHash(codigo), MINUTOS_VALIDADE_RECUPERACAO
            );

            const link = `${process.env.FRONTEND_URL}/Frontend/esqueciSenha/esqueci_senha.html` +
                `?token=${token}&email=${encodeURIComponent(usuario.email)}`;

            await emailService.enviarRecuperacaoSenha(
                usuario.email, usuario.nome_usuario, link, codigo, MINUTOS_VALIDADE_RECUPERACAO
            );

            return res.json(respostaPadrao);
        } catch (error) {
            console.error("Erro no AuthController (esqueciSenha):", error);
            return res.status(500).json({ success: false, erro: "Não foi possível enviar o e-mail agora. Tente mais tarde." });
        }
    },

    // POST /api/auth/redefinir-senha
    //   pelo link:   { token, novaSenha }
    //   pelo código: { email, codigo, novaSenha }
    redefinirSenha: async (req, res) => {
        const { token, codigo, novaSenha } = req.body || {};
        const email = String(req.body?.email || '').trim().toLowerCase();
        const erroInvalido = { success: false, erro: "Link ou código inválido ou expirado. Peça uma nova recuperação." };

        const erroSenha = validarSenha(novaSenha);
        if (erroSenha) {
            return res.status(400).json({ success: false, erro: erroSenha });
        }

        try {
            let pedido = null;
            let usuario = null;

            if (typeof token === 'string' && token) {
                pedido = await recuperacaoSenhaRepository.buscarAtivoPorToken(gerarHash(token));
                if (pedido) usuario = await usuarioRepository.buscarPorId(pedido.id_usuario);

            } else if (email && /^\d{6}$/.test(String(codigo))) {
                usuario = await usuarioRepository.buscarPorEmail(email);
                if (usuario) pedido = await recuperacaoSenhaRepository.buscarAtivoPorUsuario(usuario.id);

                // Limite de tentativas: depois de 5 erros o código morre
                if (pedido && pedido.tentativas >= MAX_TENTATIVAS_CODIGO) {
                    await recuperacaoSenhaRepository.invalidarTodosDoUsuario(usuario.id);
                    pedido = null;
                } else if (pedido && !hashesIguais(gerarHash(codigo), pedido.codigo_hash)) {
                    await recuperacaoSenhaRepository.registrarTentativaErrada(pedido.id);
                    pedido = null;
                }
            }

            if (!pedido || !usuario || !usuario.ativo) {
                return res.status(400).json(erroInvalido);
            }

            await trocarSenhaEEncerrarSessoes(usuario, novaSenha);

            return res.json({ success: true, mensagem: "Senha redefinida com sucesso! Faça login com a nova senha." });
        } catch (error) {
            console.error("Erro no AuthController (redefinirSenha):", error);
            return res.status(500).json({ success: false, erro: "Erro interno no servidor." });
        }
    },

    // PUT /api/auth/senha  (rota protegida)  { senhaAtual, novaSenha }
    alterarSenha: async (req, res) => {
        const { senhaAtual, novaSenha } = req.body || {};

        const erroSenha = validarSenha(novaSenha);
        if (erroSenha) {
            return res.status(400).json({ success: false, erro: erroSenha });
        }

        try {
            const usuario = await usuarioRepository.buscarPorId(req.usuario.id);
            const senhaCorreta = await bcrypt.compare(String(senhaAtual || ''), usuario.senha);
            if (!senhaCorreta) {
                return res.status(401).json({ success: false, erro: "Senha atual incorreta." });
            }

            await trocarSenhaEEncerrarSessoes(usuario, novaSenha);

            return res.json({ success: true, mensagem: "Senha alterada! Por segurança, faça login novamente." });
        } catch (error) {
            console.error("Erro no AuthController (alterarSenha):", error);
            return res.status(500).json({ success: false, erro: "Erro interno no servidor." });
        }
    }
};

authController.validarSenha = validarSenha;
authController.CUSTO_BCRYPT = CUSTO_BCRYPT;

module.exports = authController;
