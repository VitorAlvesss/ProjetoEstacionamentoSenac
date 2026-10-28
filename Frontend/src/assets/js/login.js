// =========================================================
// login.js - TELA DE LOGIN
// Node valida e-mail/senha no MySQL -> gera token no Firebase -> salva a sessão
// =========================================================

const formLogin = document.getElementById('form-login');
const campoEmail = document.getElementById('username');
const campoSenha = document.getElementById('password');
const campoLembrar = formLogin.querySelector('input[name="remember"]');
const btn = document.getElementById('btn-submit');
const msg = document.getElementById('login-msg');
const parametros = new URLSearchParams(location.search);

// Só aceita voltar para páginas do próprio sistema
function destinoDepoisDoLogin() {
    const voltar = parametros.get('voltar');
    return voltar && voltar.startsWith('/Frontend/') && !voltar.startsWith('//')
        ? voltar
        : '/Frontend/index.html';
}

function mostrarMensagem(texto, tipo) {
    msg.textContent = texto;
    msg.className = `form-msg ${tipo}`;
    msg.hidden = false;
}

// Já está logado? Vai direto para o sistema
if (Auth.estaLogado()) {
    location.replace(destinoDepoisDoLogin());
}

// Mensagem vinda de outra tela (ex.: "Sua sessão expirou", "Senha alterada")
if (parametros.get('msg')) {
    mostrarMensagem(parametros.get('msg'), 'info');
}

// Mostrar / esconder senha
const botaoOlho = document.querySelector('.toggle-password');
botaoOlho.addEventListener('click', () => {
    const mostrando = campoSenha.type === 'text';
    campoSenha.type = mostrando ? 'password' : 'text';
    botaoOlho.setAttribute('aria-label', mostrando ? 'Mostrar senha' : 'Esconder senha');
});

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.hidden = true;

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    if (!email || !senha) {
        mostrarMensagem('Preencha e-mail e senha.', 'erro');
        return;
    }

    btn.innerHTML = '<span>⏳</span> Entrando...';
    btn.disabled = true;

    try {
        const { ok, dados } = await Auth.login(email, senha, campoLembrar.checked);

        if (!ok) {
            mostrarMensagem(dados.erro || 'Não foi possível fazer login.', 'erro');
            campoSenha.value = '';
            campoSenha.focus();
            return;
        }

        location.replace(destinoDepoisDoLogin());

    } catch (error) {
        console.error(error);
        mostrarMensagem('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 'erro');
    } finally {
        btn.innerHTML = '<span>➡️</span> Entrar no sistema';
        btn.disabled = false;
    }
});
