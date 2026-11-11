// =========================================================
// esqueciSenha.js - RECUPERAÇÃO DE SENHA
// Dois jeitos de recuperar (os dois chegam no mesmo e-mail):
//   1. Clicar no link   -> abre esta tela com ?token=... e pede só a nova senha
//   2. Digitar o código -> código de 6 dígitos + nova senha
// =========================================================

const parametros = new URLSearchParams(location.search);
const tokenDoLink = parametros.get('token');

const msg = document.getElementById('recuperar-msg');
const titulo = document.getElementById('titulo-etapa');
const descricao = document.getElementById('descricao-etapa');
const formEmail = document.getElementById('form-email');
const formNovaSenha = document.getElementById('form-nova-senha');
const campoEmail = document.getElementById('email');
const campoCodigo = document.getElementById('codigo');
const grupoCodigo = document.getElementById('grupo-codigo');

function mostrarMensagem(texto, tipo) {
    msg.textContent = texto;
    msg.className = `form-msg ${tipo}`;
    msg.hidden = false;
}

function travarBotao(form, travar) {
    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = travar;
    botao.style.opacity = travar ? '0.6' : '';
}

function irParaEtapaEmail() {
    formNovaSenha.hidden = true;
    formEmail.hidden = false;
    titulo.textContent = 'Esqueceu sua senha?';
    descricao.textContent = 'Sem problemas! Digite seu e-mail abaixo para receber o link e o código de recuperação.';
    campoEmail.focus();
}

function irParaEtapaNovaSenha(usandoLink) {
    formEmail.hidden = true;
    formNovaSenha.hidden = false;
    grupoCodigo.hidden = usandoLink;
    document.getElementById('btn-reenviar').hidden = usandoLink;
    titulo.textContent = 'Crie uma nova senha';
    descricao.textContent = usandoLink
        ? 'Link confirmado! Agora escolha sua nova senha.'
        : `Digite o código de 6 dígitos que enviamos para ${campoEmail.value.trim()} e escolha a nova senha.`;
    (usandoLink ? document.getElementById('nova-senha') : campoCodigo).focus();
}

// Veio pelo link do e-mail
if (tokenDoLink) {
    campoEmail.value = parametros.get('email') || '';
    // Tira o token da barra de endereço (não fica no histórico do navegador)
    history.replaceState(null, '', location.pathname);
    irParaEtapaNovaSenha(true);
}

// ETAPA 1: pedir link + código
formEmail.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = campoEmail.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarMensagem('Digite um e-mail válido.', 'erro');
        return;
    }

    travarBotao(formEmail, true);
    try {
        const { ok, dados } = await Auth.postPublico('/auth/esqueci-senha', { email });
        if (!ok) {
            mostrarMensagem(dados.erro || 'Não foi possível enviar agora.', 'erro');
            return;
        }
        mostrarMensagem(dados.mensagem, 'sucesso');
        irParaEtapaNovaSenha(false);
    } catch (erro) {
        mostrarMensagem('Não foi possível conectar ao servidor.', 'erro');
    } finally {
        travarBotao(formEmail, false);
    }
});

document.getElementById('btn-ja-tenho-codigo').addEventListener('click', () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campoEmail.value.trim())) {
        mostrarMensagem('Digite primeiro o e-mail para o qual o código foi enviado.', 'erro');
        campoEmail.focus();
        return;
    }
    msg.hidden = true;
    irParaEtapaNovaSenha(false);
});

document.getElementById('btn-reenviar').addEventListener('click', () => {
    msg.hidden = true;
    irParaEtapaEmail();
});

// Só números no campo do código
campoCodigo.addEventListener('input', () => {
    campoCodigo.value = campoCodigo.value.replace(/\D/g, '').slice(0, 6);
});

// ETAPA 2: redefinir
formNovaSenha.addEventListener('submit', async (e) => {
    e.preventDefault();
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmar = document.getElementById('confirmar-senha').value;

    if (!tokenDoLink && !/^\d{6}$/.test(campoCodigo.value)) {
        mostrarMensagem('O código tem 6 números.', 'erro');
        return;
    }
    if (novaSenha.length < 8 || !/[A-Za-z]/.test(novaSenha) || !/\d/.test(novaSenha)) {
        mostrarMensagem('A senha precisa ter no mínimo 8 caracteres, com pelo menos uma letra e um número.', 'erro');
        return;
    }
    if (novaSenha !== confirmar) {
        mostrarMensagem('A confirmação não é igual à nova senha.', 'erro');
        return;
    }

    const corpo = tokenDoLink
        ? { token: tokenDoLink, novaSenha }
        : { email: campoEmail.value.trim(), codigo: campoCodigo.value, novaSenha };

    travarBotao(formNovaSenha, true);
    try {
        const { ok, dados } = await Auth.postPublico('/auth/redefinir-senha', corpo);
        if (!ok) {
            mostrarMensagem(dados.erro || 'Não foi possível redefinir a senha.', 'erro');
            return;
        }
        formNovaSenha.reset();
        location.replace(`/Frontend/Login/telaLogin.html?msg=${encodeURIComponent(dados.mensagem)}`);
    } catch (erro) {
        mostrarMensagem('Não foi possível conectar ao servidor.', 'erro');
    } finally {
        travarBotao(formNovaSenha, false);
    }
});
