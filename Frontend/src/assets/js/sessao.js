// =========================================================
// sessao.js - RODA EM TODAS AS TELAS PROTEGIDAS
// 1. Bloqueia quem não está logado (manda para o login)
// 2. Mostra o nome do usuário logado no cabeçalho
// 3. Menu do usuário (perfil, veículos, alterar senha, sair)
// 4. Sino de notificações: entradas/saídas dos carros do usuário
//
// Precisa do auth.js carregado antes. No HTML:
//   <script src="/Frontend/src/assets/js/auth.js"></script>
//   <script src="/Frontend/src/assets/js/sessao.js" defer></script>
// =========================================================
(function () {
  // =========================================================
  // 1. VERIFICAÇÃO DE SESSÃO
  // =========================================================
  if (!window.Auth || !Auth.estaLogado()) {
    const voltar = encodeURIComponent(location.pathname + location.search);
    location.replace(`/Frontend/Login/telaLogin.html?voltar=${voltar}`);
    return;
  }

  const INTERVALO_NOTIFICACOES = 15000;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/Frontend/src/styles/sessao.css';
  document.head.appendChild(link);

  // =========================================================
  // FUNÇÕES AUXILIARES
  // =========================================================
  function iniciais(nome) {
    const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    return ((partes[0][0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  function primeiroEUltimoNome(nome) {
    const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1]}` : (partes[0] || '');
  }

  function nomeCargo(cargo) {
    return cargo === 'administrador' ? 'Administrador' : 'Usuário';
  }

  function formatarTelefone(tel) {
    const d = String(tel || '').replace(/\D/g, '');
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return d;
  }

  function tempoRelativo(data) {
    const segundos = Math.floor((Date.now() - new Date(data).getTime()) / 1000);
    if (segundos < 60) return 'agora mesmo';
    if (segundos < 3600) return `há ${Math.floor(segundos / 60)} min`;
    if (segundos < 86400) return `há ${Math.floor(segundos / 3600)} h`;
    return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  function criar(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function mostrarMensagem(el, texto, tipo) {
    el.textContent = texto;
    el.className = `sessao-msg ${tipo}`;
    el.hidden = false;
  }

  // Abre um painel flutuante logo abaixo do botão que foi clicado
  function posicionar(painel, ancora) {
    const r = ancora.getBoundingClientRect();
    painel.style.top = `${r.bottom + 8}px`;
    painel.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
  }

  const paineisAbertos = new Set();
  function fecharPaineis() {
    paineisAbertos.forEach((painel) => { painel.hidden = true; });
    paineisAbertos.clear();
  }
  document.addEventListener('click', fecharPaineis);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { fecharPaineis(); fecharPerfil(); } });
  window.addEventListener('resize', fecharPaineis);

  // =========================================================
  // 2. DADOS DO USUÁRIO NO CABEÇALHO
  // =========================================================
  function preencherCabecalho(usuario) {
    document.querySelectorAll('#nome-usuario, .nome-usuario').forEach((el) => {
      el.textContent = primeiroEUltimoNome(usuario.nome);
      el.title = `${usuario.nome} (${nomeCargo(usuario.cargo)})`;
    });

    // Elementos marcados com data-somente-admin somem para usuário comum
    document.querySelectorAll('[data-somente-admin]').forEach((el) => {
      el.hidden = usuario.cargo !== 'administrador';
    });

    // Campos de qualquer tela marcados com data-conta-campo="nome|email|telefone|cargo"
    document.querySelectorAll('[data-conta-campo]').forEach((el) => {
      const campo = el.dataset.contaCampo;
      const valor = campo === 'cargo' ? nomeCargo(usuario.cargo)
        : campo === 'telefone' ? formatarTelefone(usuario.telefone)
        : (usuario[campo] || '');
      if ('value' in el) el.value = valor; else el.textContent = valor;
    });

    menuNome.textContent = usuario.nome;
    menuEmail.textContent = usuario.email || '';
    menuCargo.textContent = nomeCargo(usuario.cargo);
  }

  // =========================================================
  // 3. MENU DO USUÁRIO (clique no avatar / nome)
  // =========================================================
  const menu = criar('div', 'sessao-dropdown sessao-menu');
  menu.hidden = true;
  menu.innerHTML = `
    <div class="sessao-menu-info">
      <strong></strong>
      <small></small>
      <span class="sessao-cargo"></span>
    </div>
    <button type="button" data-acao="dados"><i class="fa-solid fa-user"></i> Meu perfil</button>
    <button type="button" data-acao="veiculos"><i class="fa-solid fa-car"></i> Meus veículos</button>
    <button type="button" data-acao="senha"><i class="fa-solid fa-lock"></i> Alterar senha</button>
    <button type="button" data-acao="sair" class="perigo"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
  `;
  menu.addEventListener('click', (e) => e.stopPropagation());
  document.body.appendChild(menu);

  const menuNome = menu.querySelector('strong');
  const menuEmail = menu.querySelector('small');
  const menuCargo = menu.querySelector('.sessao-cargo');

  menu.querySelectorAll('button').forEach((botao) => {
    botao.addEventListener('click', () => {
      fecharPaineis();
      if (botao.dataset.acao === 'sair') {
        if (confirm('Deseja sair do sistema?')) Auth.sair();
      } else {
        abrirPerfil(botao.dataset.acao);
      }
    });
  });

  const areaUsuario = document.getElementById('usuario-logado');
  if (areaUsuario) {
    areaUsuario.style.cursor = 'pointer';
    areaUsuario.title = 'Meu perfil';
    areaUsuario.addEventListener('click', (e) => {
      e.stopPropagation();
      const estavaAberto = !menu.hidden;
      fecharPaineis();
      if (!estavaAberto) {
        posicionar(menu, areaUsuario);
        menu.hidden = false;
        paineisAbertos.add(menu);
      }
    });
  }

  // =========================================================
  // PERFIL (janela com dados, veículos e troca de senha)
  // =========================================================
  const perfil = criar('div', 'sessao-overlay');
  perfil.hidden = true;
  perfil.innerHTML = `
    <div class="sessao-modal" role="dialog" aria-modal="true" aria-labelledby="sessao-perfil-titulo">
      <header class="sessao-modal-topo">
        <div class="sessao-avatar-grande"></div>
        <div class="sessao-modal-titulo">
          <h2 id="sessao-perfil-titulo"></h2>
          <span class="sessao-cargo"></span>
        </div>
        <button type="button" class="sessao-fechar" aria-label="Fechar">&times;</button>
      </header>

      <nav class="sessao-abas">
        <button type="button" data-aba="dados">Meus dados</button>
        <button type="button" data-aba="veiculos">Meus veículos</button>
        <button type="button" data-aba="senha">Alterar senha</button>
      </nav>

      <section data-painel="dados">
        <form class="sessao-form" id="sessao-form-perfil" novalidate>
          <label>Nome completo<input name="nome" required maxlength="120" autocomplete="name"></label>
          <label>E-mail<input name="email" type="email" required maxlength="120" autocomplete="email"></label>
          <label>Telefone (com DDD)<input name="telefone" inputmode="numeric" maxlength="15" placeholder="(11) 99999-9999" autocomplete="tel"></label>
          <p class="sessao-info" data-campo="desde"></p>
          <p class="sessao-msg" role="alert" hidden></p>
          <button type="submit" class="sessao-btn">Salvar dados</button>
        </form>
      </section>

      <section data-painel="veiculos" hidden>
        <ul class="sessao-carros"></ul>
      </section>

      <section data-painel="senha" hidden>
        <form class="sessao-form" id="sessao-form-senha" novalidate>
          <label>Senha atual<input name="senhaAtual" type="password" required autocomplete="current-password"></label>
          <label>Nova senha<input name="novaSenha" type="password" required minlength="8" maxlength="72" autocomplete="new-password"></label>
          <label>Confirmar nova senha<input name="confirmar" type="password" required autocomplete="new-password"></label>
          <small class="sessao-info">Mínimo de 8 caracteres, com pelo menos uma letra e um número. Ao trocar, você sai de todos os dispositivos.</small>
          <p class="sessao-msg" role="alert" hidden></p>
          <button type="submit" class="sessao-btn">Alterar senha</button>
        </form>
      </section>
    </div>
  `;
  document.body.appendChild(perfil);

  const formPerfil = perfil.querySelector('#sessao-form-perfil');
  const formSenha = perfil.querySelector('#sessao-form-senha');
  const listaCarros = perfil.querySelector('.sessao-carros');

  perfil.addEventListener('click', (e) => { if (e.target === perfil) fecharPerfil(); });
  perfil.querySelector('.sessao-fechar').addEventListener('click', fecharPerfil);
  perfil.querySelectorAll('.sessao-abas button').forEach((botao) => {
    botao.addEventListener('click', () => trocarAba(botao.dataset.aba));
  });

  function trocarAba(aba) {
    perfil.querySelectorAll('.sessao-abas button').forEach((b) => b.classList.toggle('ativa', b.dataset.aba === aba));
    perfil.querySelectorAll('[data-painel]').forEach((p) => { p.hidden = p.dataset.painel !== aba; });
  }

  function fecharPerfil() {
    perfil.hidden = true;
    formSenha.reset();
    perfil.querySelectorAll('.sessao-msg').forEach((m) => { m.hidden = true; });
  }

  function preencherPerfil(dados) {
    perfil.querySelector('.sessao-avatar-grande').textContent = iniciais(dados.nome);
    perfil.querySelector('#sessao-perfil-titulo').textContent = dados.nome;
    perfil.querySelector('.sessao-modal-titulo .sessao-cargo').textContent = nomeCargo(dados.cargo);

    formPerfil.nome.value = dados.nome || '';
    formPerfil.email.value = dados.email || '';
    formPerfil.telefone.value = formatarTelefone(dados.telefone);
    perfil.querySelector('[data-campo="desde"]').textContent = dados.dataCadastro
      ? `Cliente desde ${new Date(dados.dataCadastro).toLocaleDateString('pt-BR')}`
      : '';

    listaCarros.replaceChildren();
    if (!dados.carros || dados.carros.length === 0) {
      listaCarros.appendChild(criar('li', 'sessao-vazio', 'Nenhum veículo cadastrado no seu nome.'));
      return;
    }
    dados.carros.forEach((carro) => {
      const item = criar('li', 'sessao-carro');
      const icone = criar('i', `fa-solid ${carro.tipo === 'MOTO' ? 'fa-motorcycle' : 'fa-car'} sessao-carro-icone`);
      const info = criar('div', 'sessao-carro-info');
      info.appendChild(criar('strong', '', `${carro.marca} ${carro.modelo}`));
      info.appendChild(criar('span', 'sessao-placa', carro.placa));
      const detalhes = [carro.cor, carro.ano].filter(Boolean).join(' • ');
      if (detalhes) info.appendChild(criar('small', '', detalhes));

      const status = carro.estacionado
        ? criar('span', 'sessao-status dentro',
            `Na vaga ${carro.estacionado.vaga} desde ${new Date(carro.estacionado.desde).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`)
        : criar('span', 'sessao-status fora', 'Fora do estacionamento');

      item.append(icone, info, status);
      listaCarros.appendChild(item);
    });
  }

  async function abrirPerfil(aba = 'dados') {
    const usuario = Auth.getUsuario();
    preencherPerfil({ ...usuario, carros: [] });
    listaCarros.replaceChildren(criar('li', 'sessao-vazio', 'Carregando veículos...'));
    trocarAba(aba);
    perfil.hidden = false;

    try {
      const resposta = await Auth.fetch('/usuarios/perfil');
      const dados = await resposta.json();
      if (dados.success) preencherPerfil(dados.data);
    } catch (erro) {
      console.error('Erro ao carregar perfil:', erro);
      listaCarros.replaceChildren(criar('li', 'sessao-vazio', 'Não foi possível carregar os veículos.'));
    }
  }

  formPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = formPerfil.querySelector('.sessao-msg');
    const botao = formPerfil.querySelector('button[type="submit"]');
    botao.disabled = true;

    try {
      const resposta = await Auth.fetch('/usuarios/perfil', {
        method: 'PUT',
        body: JSON.stringify({
          nome: formPerfil.nome.value,
          email: formPerfil.email.value,
          telefone: formPerfil.telefone.value
        })
      });
      const dados = await resposta.json();
      if (!dados.success) {
        mostrarMensagem(msg, dados.erro, 'erro');
        return;
      }
      Auth.atualizarUsuario(dados.usuario);
      preencherCabecalho(Auth.getUsuario());
      perfil.querySelector('#sessao-perfil-titulo').textContent = dados.usuario.nome;
      perfil.querySelector('.sessao-avatar-grande').textContent = iniciais(dados.usuario.nome);
      mostrarMensagem(msg, dados.mensagem, 'sucesso');
      document.dispatchEvent(new CustomEvent('sessao:usuario-atualizado', { detail: Auth.getUsuario() }));
    } catch (erro) {
      mostrarMensagem(msg, 'Não foi possível conectar ao servidor.', 'erro');
    } finally {
      botao.disabled = false;
    }
  });

  formSenha.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = formSenha.querySelector('.sessao-msg');
    const botao = formSenha.querySelector('button[type="submit"]');

    if (formSenha.novaSenha.value !== formSenha.confirmar.value) {
      mostrarMensagem(msg, 'A confirmação não é igual à nova senha.', 'erro');
      return;
    }

    botao.disabled = true;
    try {
      const resposta = await Auth.fetch('/auth/senha', {
        method: 'PUT',
        body: JSON.stringify({ senhaAtual: formSenha.senhaAtual.value, novaSenha: formSenha.novaSenha.value })
      });
      const dados = await resposta.json();
      if (!dados.success) {
        mostrarMensagem(msg, dados.erro, 'erro');
        return;
      }
      // Todas as sessões foram derrubadas no servidor: volta para o login
      Auth.sair(dados.mensagem);
    } catch (erro) {
      if (erro.message !== 'Sessão expirada') mostrarMensagem(msg, 'Não foi possível conectar ao servidor.', 'erro');
    } finally {
      botao.disabled = false;
    }
  });

  // =========================================================
  // 4. NOTIFICAÇÕES (sino)
  // =========================================================
  const sino = document.getElementById('notificacao');
  const badge = document.getElementById('qtd-notificacoes');

  const painelNotif = criar('div', 'sessao-dropdown sessao-notif');
  painelNotif.hidden = true;
  painelNotif.innerHTML = `
    <div class="sessao-dropdown-topo">
      <strong>Notificações</strong>
      <small>Entradas e saídas dos veículos</small>
    </div>
    <ul class="sessao-notif-lista"></ul>
  `;
  painelNotif.addEventListener('click', (e) => e.stopPropagation());
  document.body.appendChild(painelNotif);
  const listaNotif = painelNotif.querySelector('.sessao-notif-lista');

  const avisos = criar('div', 'sessao-avisos');
  avisos.setAttribute('aria-live', 'polite');
  document.body.appendChild(avisos);

  let notificacoes = [];
  let idsConhecidos = null;

  function atualizarBadge(qtd) {
    if (!badge) return;
    badge.textContent = qtd > 99 ? '99+' : String(qtd);
    badge.style.display = qtd > 0 ? 'flex' : 'none';
  }

  function renderizarNotificacoes() {
    listaNotif.replaceChildren();
    if (notificacoes.length === 0) {
      listaNotif.appendChild(criar('li', 'sessao-vazio', 'Nenhuma movimentação por enquanto.'));
      return;
    }
    notificacoes.forEach((n) => {
      const item = criar('li', `sessao-notif-item ${n.naoLida ? 'nao-lida' : ''}`);
      const entrada = n.tipo === 'ENTRADA';
      item.appendChild(criar('i', `fa-solid ${entrada ? 'fa-right-to-bracket entrada' : 'fa-right-from-bracket saida'}`));
      const texto = criar('div');
      texto.appendChild(criar('p', '', n.mensagem));
      texto.appendChild(criar('small', '', tempoRelativo(n.data_evento)));
      item.appendChild(texto);
      listaNotif.appendChild(item);
    });
  }

  function mostrarAviso(n) {
    const aviso = criar('div', `sessao-aviso ${n.tipo === 'ENTRADA' ? 'entrada' : 'saida'}`);
    aviso.appendChild(criar('i', `fa-solid ${n.tipo === 'ENTRADA' ? 'fa-right-to-bracket' : 'fa-right-from-bracket'}`));
    aviso.appendChild(criar('span', '', n.mensagem));
    avisos.appendChild(aviso);
    setTimeout(() => aviso.remove(), 6000);
  }

  async function buscarNotificacoes() {
    try {
      const resposta = await Auth.fetch('/notificacoes');
      const dados = await resposta.json();
      if (!dados.success) return;

      notificacoes = dados.data;
      atualizarBadge(painelNotif.hidden ? dados.unreadCount : 0);

      // Aviso na tela para cada movimentação nova desde a última consulta
      if (idsConhecidos) {
        notificacoes
          .filter((n) => n.naoLida && !idsConhecidos.has(n.id_notificacao))
          .reverse()
          .forEach(mostrarAviso);
      }
      idsConhecidos = new Set(notificacoes.map((n) => n.id_notificacao));

      if (!painelNotif.hidden) renderizarNotificacoes();
    } catch (erro) {
      console.warn('Não foi possível buscar notificações:', erro.message);
    }
  }

  async function marcarComoLidas() {
    try {
      await Auth.fetch('/notificacoes/marcar-lidas', { method: 'POST' });
    } catch (erro) {
      console.warn('Não foi possível marcar notificações como lidas:', erro.message);
    }
  }

  if (sino) {
    sino.style.cursor = 'pointer';
    sino.addEventListener('click', async (e) => {
      e.stopPropagation();
      const estavaAberto = !painelNotif.hidden;
      fecharPaineis();
      if (estavaAberto) return;

      posicionar(painelNotif, sino);
      renderizarNotificacoes();
      painelNotif.hidden = false;
      paineisAbertos.add(painelNotif);

      await buscarNotificacoes();
      atualizarBadge(0);
      marcarComoLidas();
    });
  }

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================
  preencherCabecalho(Auth.getUsuario());

  // Confere no servidor se a sessão ainda vale e pega os dados mais recentes
  Auth.fetch('/auth/me')
    .then((resposta) => resposta.json())
    .then((dados) => {
      if (!dados.success) return;
      Auth.atualizarUsuario(dados.usuario);
      preencherCabecalho(Auth.getUsuario());
    })
    .catch((erro) => console.warn('Não foi possível validar a sessão:', erro.message));

  atualizarBadge(0);
  buscarNotificacoes();
  setInterval(() => { if (!document.hidden) buscarNotificacoes(); }, INTERVALO_NOTIFICACOES);

  // Botões de qualquer tela com data-abrir-perfil="dados|veiculos|senha" abrem o perfil
  document.querySelectorAll('[data-abrir-perfil]').forEach((botao) => {
    botao.addEventListener('click', (e) => {
      e.preventDefault();
      abrirPerfil(botao.dataset.abrirPerfil);
    });
  });

  // Outras telas podem abrir o perfil pelo JS também: Sessao.abrirPerfil('senha')
  window.Sessao = { abrirPerfil };
})();
