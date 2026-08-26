const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Ajuste o nome do arquivo aqui se for diferente no seu PC
const credenciais = require('../../../projectparkingtoken.json');

// CORRIGIDO AQUI: "length"
if (getApps().length === 0) {
  console.log("⏳ Inicializando o Firebase Admin...");
  initializeApp({
    credential: cert(credenciais)
  });
  console.log("🔥 Firebase Admin inicializado com sucesso!");
}

const verificarToken = async (req, res, next) => {
  console.log("\n--- 🛡️ Iniciando Verificação de Segurança ---");
  console.log("Cabeçalho recebido:", req.headers.authorization);

  const tokenEnviado = req.headers.authorization?.split(' ')[1];
  
  console.log("Token extraído:", tokenEnviado ? "Token recebido (oculto por segurança)" : "NENHUM TOKEN RECEBIDO");

  if (!tokenEnviado) {
    console.log("❌ Acesso Bloqueado: Usuário tentou acessar sem enviar o token.");
    return res.status(401).json({erro: "Você precisa estar logado para acessar."});
  }

  try {
    console.log("⏳ Consultando o Google para saber se o token é válido...");
    const usuarioFirebase = await getAuth().verifyIdToken(tokenEnviado);
    
    console.log("✅ Sucesso! Token válido. ID do Usuário:", usuarioFirebase.uid);
    req.usuarioLogado = usuarioFirebase;
    
    console.log("➡ Liberando acesso para a próxima etapa (controller)...");
    next();

  } catch(erro) {
    console.error("❌ Falha na Autenticação:", erro.message);
    return res.status(401).json({erro: "Sessão expirada ou token inválido" });
  }
};

module.exports = verificarToken;