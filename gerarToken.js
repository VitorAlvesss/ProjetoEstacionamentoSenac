const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const credenciais = require('./projectparkingtoken.json');
// ⚠️ 1. COLOQUE SUA ID AQUI (Igual você já tinha feito)
const uidDoUsuario = "cu1UHsS9N1PGKVaXn1v4yqTggzo1"; 

// ⚠️ 2. COLOQUE A CHAVE WEB QUE VOCÊ ACABOU DE COPIAR LÁ DO SITE
const webApiKey = "AIzaSyD5qNk8BXdq-I8eCMDSh3PHvwtCeIUCaPk"; 

if (getApps().length === 0) {
    initializeApp({ credential: cert(credenciais) });
}

async function gerarIdTokenReal() {
    try {
        console.log("⏳ 1. Gerando voucher (Custom Token)...");
        const customToken = await getAuth().createCustomToken(uidDoUsuario);

        console.log("⏳ 2. Trocando voucher pelo Crachá Oficial (ID Token)...");
        // Usando o Node para simular um celular logando no Google
        const resposta = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${webApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: customToken, returnSecureToken: true })
        });



        const dados = await resposta.json();


        if (dados.idToken) {
            console.log("\n SUCESSO! AQUI ESTÁ SEU ID TOKEN REAL PARA O INSOMNIA:\n");
            console.log(dados.idToken);
            console.log("\n----------------------------------------\n");
        } else {
            console.error(" Erro na troca:", dados.error.message);
        }

    } catch (error) {
        console.error("Erro geral:", error);
    }
}

gerarIdTokenReal();