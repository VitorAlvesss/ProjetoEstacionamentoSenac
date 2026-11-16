//emailService.js
// Envio de e-mails (recuperação de senha). Usa SMTP configurado no .env.
// Sem SMTP configurado, o e-mail é apenas mostrado no terminal (modo desenvolvimento).
const nodemailer = require('nodemailer');

const smtpConfigurado = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = smtpConfigurado
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        // Se a rede travar, falha em segundos (em vez de deixar a tela esperando 2 minutos)
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000
    })
    : null;

// Traduz os erros mais comuns do SMTP para algo que dá para resolver
function explicarErro(erro) {
    if (erro.code === 'EAUTH') {
        return 'o servidor de e-mail recusou o login. Confira SMTP_USER e SMTP_PASS no .env ' +
            '(no Gmail, SMTP_PASS é a "senha de app" de 16 letras, não a senha normal da conta).';
    }
    if (['ETIMEDOUT', 'ESOCKET', 'ECONNECTION', 'ECONNREFUSED', 'EDNS'].includes(erro.code)) {
        return `não consegui conectar em ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} (${erro.code}). ` +
            'Confira SMTP_HOST e SMTP_PORT, ou se a rede bloqueia e-mail (tente SMTP_PORT=587).';
    }
    return erro.message;
}

async function enviarEmail({ para, assunto, texto, html }) {
    if (!transporter) {
        console.log('\n📧 [SMTP não configurado - e-mail exibido apenas no terminal]');
        console.log(`Para: ${para}\nAssunto: ${assunto}\n${texto}\n`);
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: para,
            subject: assunto,
            text: texto,
            html
        });
        console.log(`📧 E-mail enviado para ${para}: "${assunto}"`);
    } catch (erro) {
        console.error(`❌ E-mail NÃO enviado para ${para}: ${explicarErro(erro)}`);
        throw erro;
    }
}

// Chamado quando o servidor liga: mostra no terminal se o envio de e-mail está funcionando
async function verificarConexao() {
    if (!transporter) {
        console.log('📧 E-mail: SMTP não configurado. Os e-mails de recuperação vão aparecer só aqui no terminal.');
        return false;
    }
    try {
        await transporter.verify();
        console.log(`📧 E-mail: pronto para enviar como ${process.env.SMTP_USER} (${process.env.SMTP_HOST}).`);
        return true;
    } catch (erro) {
        console.error(`❌ E-mail: ${explicarErro(erro)}`);
        return false;
    }
}

const emailService = {
    enviarRecuperacaoSenha: (para, nome, link, codigo, minutos) => enviarEmail({
        para,
        assunto: 'Goiabinha&CIA - Recuperação de senha',
        texto:
            `Olá, ${nome}!\n\n` +
            `Recebemos um pedido para redefinir sua senha.\n\n` +
            `Opção 1 - clique no link: ${link}\n` +
            `Opção 2 - digite este código na tela de recuperação: ${codigo}\n\n` +
            `O link e o código valem por ${minutos} minutos e só podem ser usados uma vez.\n` +
            `Se não foi você, ignore este e-mail. Sua senha continua a mesma.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px">
              <h2 style="color:#ff477e">Goiabinha&amp;CIA</h2>
              <p>Olá, <strong>${escaparHtml(nome)}</strong>!</p>
              <p>Recebemos um pedido para redefinir sua senha.</p>
              <p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#ff477e;color:#fff;border-radius:8px;text-decoration:none">Redefinir minha senha</a></p>
              <p>Ou digite este código na tela de recuperação:</p>
              <p style="font-size:28px;letter-spacing:6px;font-weight:bold">${codigo}</p>
              <p style="color:#64748b;font-size:13px">O link e o código valem por ${minutos} minutos e só podem ser usados uma vez.
              Se não foi você, ignore este e-mail. Sua senha continua a mesma.</p>
            </div>`
    }),

    enviarAvisoSenhaAlterada: (para, nome) => enviarEmail({
        para,
        assunto: 'Goiabinha&CIA - Sua senha foi alterada',
        texto:
            `Olá, ${nome}!\n\nA senha da sua conta foi alterada agora e todas as sessões abertas foram encerradas.\n` +
            `Se não foi você, procure a administração do estacionamento imediatamente.`
    }),

    verificarConexao
};

function escaparHtml(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = emailService;
