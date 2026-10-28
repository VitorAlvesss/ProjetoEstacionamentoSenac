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
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
    : null;

async function enviarEmail({ para, assunto, texto, html }) {
    if (!transporter) {
        console.log('\n📧 [SMTP não configurado - e-mail exibido apenas no terminal]');
        console.log(`Para: ${para}\nAssunto: ${assunto}\n${texto}\n`);
        return;
    }
    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: para,
        subject: assunto,
        text: texto,
        html
    });
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
    })
};

function escaparHtml(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = emailService;
