//authMiddleware.js
const { firebaseAuth } = require('../Connection/firebase');
const usuarioRepository = require('../Repositories/usuarioRepository');

// Protege as rotas: só passa quem mandar um ID Token válido do Firebase
// no cabeçalho "Authorization: Bearer <token>".
const verificarToken = async (req, res, next) => {
  const [tipo, tokenEnviado] = (req.headers.authorization || '').split(' ');

  if (tipo !== 'Bearer' || !tokenEnviado) {
    return res.status(401).json({ success: false, erro: "Você precisa estar logado para acessar." });
  }

  try {
    // true = também recusa tokens revogados (ex.: depois de trocar a senha)
    const usuarioFirebase = await firebaseAuth.verifyIdToken(tokenEnviado, true);

    // O uid do Firebase é o id do usuário no MySQL. Conferimos se ele ainda existe e está ativo.
    const usuario = await usuarioRepository.buscarPorId(usuarioFirebase.uid);
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ success: false, erro: "Conta desativada ou inexistente." });
    }

    req.usuarioLogado = usuarioFirebase;
    req.usuario = {
      id: usuario.id,
      nome: usuario.nome_usuario,
      email: usuario.email,
      cargo: usuario.cargo
    };
    next();

  } catch (erro) {
    // Nunca logar o token: quem tiver acesso ao terminal poderia usá-lo
    console.error("Falha na autenticação:", erro.code || erro.message);
    return res.status(401).json({ success: false, erro: "Sessão expirada ou token inválido." });
  }
};

// Use depois do verificarToken nas rotas que só o administrador pode acessar
const somenteAdmin = (req, res, next) => {
  if (req.usuario?.cargo !== 'administrador') {
    return res.status(403).json({ success: false, erro: "Acesso permitido apenas para administradores." });
  }
  next();
};

module.exports = verificarToken;
module.exports.verificarToken = verificarToken;
module.exports.somenteAdmin = somenteAdmin;
