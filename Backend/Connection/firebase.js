//firebase.js
// Inicializa o Firebase Admin UMA vez só e exporta o "auth" para o resto do backend
const path = require('path');
const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

// Arquivo da conta de serviço baixado do console do Firebase
const caminhoCredenciais = path.resolve(
    __dirname,
    '../..',
    process.env.FIREBASE_CREDENTIALS || 'projectparkingtoken.json'
);

const credenciais = require(caminhoCredenciais);

if (getApps().length === 0) {
    initializeApp({ credential: cert(credenciais) });
}

const firebaseAuth = getAuth();

// Chave Web do Firebase (Configurações do projeto > Geral). Usada para trocar o
// Custom Token por um ID Token e para renovar a sessão com o Refresh Token.
const WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;

async function trocarCustomTokenPorIdToken(customToken) {
    const resposta = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${WEB_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: customToken, returnSecureToken: true })
        }
    );
    const dados = await resposta.json();
    if (!dados.idToken) {
        throw new Error(`Firebase recusou o custom token: ${dados.error?.message}`);
    }
    return { idToken: dados.idToken, refreshToken: dados.refreshToken, expiresIn: Number(dados.expiresIn) };
}

async function renovarIdToken(refreshToken) {
    const resposta = await fetch(`https://securetoken.googleapis.com/v1/token?key=${WEB_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken })
    });
    const dados = await resposta.json();
    if (!dados.id_token) return null;
    return {
        idToken: dados.id_token,
        refreshToken: dados.refresh_token,
        expiresIn: Number(dados.expires_in),
        uid: dados.user_id
    };
}

// Diferença (ms) entre o relógio deste computador e o do Google.
// O revokeRefreshTokens() do Firebase usa o relógio LOCAL: se o PC estiver adiantado,
// ele bloqueia também os logins feitos logo depois. Por isso medimos a diferença.
async function medirDiferencaRelogio() {
    const antes = Date.now();
    const resposta = await fetch('https://www.googleapis.com/', { method: 'HEAD' });
    const depois = Date.now();
    return (antes + depois) / 2 - new Date(resposta.headers.get('date')).getTime();
}

// Derruba TODAS as sessões do usuário (todos os tokens emitidos até agora param de valer).
// Faz o mesmo que firebaseAuth.revokeRefreshTokens(uid), mas usando a hora do Google.
async function encerrarSessoes(uid) {
    const diferenca = await medirDiferencaRelogio();
    const agoraNoGoogle = Math.floor((Date.now() - diferenca) / 1000);
    const { access_token } = await getApp().options.credential.getAccessToken();

    const resposta = await fetch(
        `https://identitytoolkit.googleapis.com/v1/projects/${credenciais.project_id}/accounts:update`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
            body: JSON.stringify({ localId: String(uid), validSince: String(agoraNoGoogle) })
        }
    );
    if (resposta.ok) return;

    const dados = await resposta.json().catch(() => ({}));
    // Usuário que nunca logou ainda não existe no Firebase: não há sessão para derrubar
    if (dados.error?.message === 'USER_NOT_FOUND') return;
    throw new Error(`Firebase não encerrou as sessões: ${dados.error?.message || resposta.status}`);
}

module.exports = { firebaseAuth, trocarCustomTokenPorIdToken, renovarIdToken, encerrarSessoes };
