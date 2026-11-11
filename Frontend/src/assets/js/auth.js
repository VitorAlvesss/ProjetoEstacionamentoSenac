// =========================================================
// auth.js - SESSÃO DO USUÁRIO NO FRONT
// Guarda os tokens do Firebase, renova o token antes de vencer (ele dura 1h)
// e oferece Auth.fetch() para chamar a API já autenticado.
//
// Use em qualquer tela:
//   const resposta = await Auth.fetch('/usuarios/perfil');
//   const usuario = Auth.getUsuario();   // { id, nome, email, telefone, cargo }
// =========================================================
(function () {
  const API_URL = 'http://localhost:3000/api';
  const PAGINA_LOGIN = '/Frontend/Login/telaLogin.html';
  const CHAVE_SESSAO = 'estacionamento_sessao';

  let renovacaoEmAndamento = null;

  // "Lembrar-me" marcado = localStorage (continua após fechar o navegador)
  // desmarcado = sessionStorage (some ao fechar a aba)
  function lerSessao() {
    try {
      const salvo = sessionStorage.getItem(CHAVE_SESSAO) || localStorage.getItem(CHAVE_SESSAO);
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  }

  function salvarSessao(sessao, lembrar) {
    const usarLocal = lembrar ?? localStorage.getItem(CHAVE_SESSAO) !== null;
    (usarLocal ? sessionStorage : localStorage).removeItem(CHAVE_SESSAO);
    (usarLocal ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  }

  function limparSessao() {
    localStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_SESSAO);
    // chaves usadas pela versão antiga do login
    localStorage.removeItem('estacionamento_token');
    localStorage.removeItem('estacionamento_user');
  }

  function montarSessao(dados) {
    return {
      idToken: dados.idToken,
      refreshToken: dados.refreshToken,
      // renova 1 minuto antes de vencer
      expiraEm: Date.now() + (dados.expiresIn - 60) * 1000,
      usuario: dados.usuario
    };
  }

  // POST sem token (login, esqueci a senha...). Devolve { ok, status, dados }
  async function postPublico(caminho, corpo) {
    const resposta = await fetch(API_URL + caminho, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo)
    });
    const dados = await resposta.json().catch(() => ({}));
    return { ok: resposta.ok && dados.success !== false, status: resposta.status, dados };
  }

  async function renovarToken() {
    // Se várias requisições pedirem ao mesmo tempo, renova uma vez só
    if (!renovacaoEmAndamento) {
      renovacaoEmAndamento = (async () => {
        const sessao = lerSessao();
        if (!sessao?.refreshToken) return null;

        const { ok, dados } = await postPublico('/auth/refresh', { refreshToken: sessao.refreshToken });
        if (!ok) return null;

        salvarSessao(montarSessao(dados));
        return dados.idToken;
      })().finally(() => { renovacaoEmAndamento = null; });
    }
    return renovacaoEmAndamento;
  }

  async function getToken() {
    const sessao = lerSessao();
    if (!sessao) return null;
    if (Date.now() < sessao.expiraEm) return sessao.idToken;
    return renovarToken();
  }

  function sair(mensagem) {
    limparSessao();
    const destino = mensagem ? `${PAGINA_LOGIN}?msg=${encodeURIComponent(mensagem)}` : PAGINA_LOGIN;
    window.location.replace(destino);
  }

  // fetch com "Authorization: Bearer <token>". Se o token expirou, renova e tenta de novo.
  async function fetchAutenticado(caminho, opcoes = {}) {
    const url = caminho.startsWith('http') ? caminho : API_URL + caminho;

    const enviar = (token) => fetch(url, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...(opcoes.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });

    let token = await getToken();
    if (!token) {
      sair('Sua sessão expirou. Faça login novamente.');
      throw new Error('Sessão expirada');
    }

    let resposta = await enviar(token);
    if (resposta.status === 401) {
      token = await renovarToken();
      if (token) resposta = await enviar(token);
    }
    if (resposta.status === 401) {
      sair('Sua sessão expirou. Faça login novamente.');
      throw new Error('Sessão expirada');
    }
    return resposta;
  }

  window.Auth = {
    API_URL,
    PAGINA_LOGIN,

    estaLogado: () => Boolean(lerSessao()?.refreshToken),

    getUsuario: () => lerSessao()?.usuario || null,

    atualizarUsuario(usuario) {
      const sessao = lerSessao();
      if (!sessao) return;
      sessao.usuario = { ...sessao.usuario, ...usuario };
      salvarSessao(sessao);
    },

    async login(email, senha, lembrar) {
      const resultado = await postPublico('/auth/login', { email, senha });
      if (resultado.ok) {
        limparSessao();
        salvarSessao(montarSessao(resultado.dados), lembrar);
      }
      return resultado;
    },

    postPublico,
    getToken,
    fetch: fetchAutenticado,
    sair
  };
})();
