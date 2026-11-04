/* 
   menu.js

   Comportamento COMPARTILHADO do sistema Goiabinha&CIA: abrir e fechar o
   menu lateral, trocar o tema (NESSA PARTE TIRA E COLOCA O DO WILL), atualizar o relógio do
   cabeçalho e destacar automaticamente o item do menu da página atual.

   Esse arquivo é usado por TODAS as telas.
   Basta incluir no final do <body>:

     <script src="menu.js"></script>

   IMPORTANTE sobre o destaque do menu (marcarLinkAtivo):
   Ele funciona comparando o nome do arquivo atual (ex: "TelaVeiculos.html")
   com o "href" de cada link do menu lateral. Ou seja, se o nome do arquivo
   da tela bater com o href correspondente no menu, aquele item fica
   destacado sozinho.
 */

(function () {
  const STORAGE_KEY_TEMA = 'goiabinha:tema';


  // Menu lateral (sidebar) abrir e fechar
  const sidebar = document.getElementById('sidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const topHeaderToggleBtn = document.getElementById('topHeaderToggleBtn');

  function toggleSidebar() {
    if (sidebar) sidebar.classList.toggle('collapsed');
  }

  if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', toggleSidebar);
  if (topHeaderToggleBtn) topHeaderToggleBtn.addEventListener('click', toggleSidebar);

  // Em telas pequenas, fecha o menu automaticamente ao clicar em um link
  document.querySelectorAll('.sidebar-nav .nav-item a').forEach(link => {
    link.addEventListener('click', () => {
      if (sidebar && window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
        sidebar.classList.add('collapsed');
      }
    });
  });


  // destaca automaticamente o item do Meunu da página atual 
  function marcarLinkAtivo() {
    const paginaAtual = window.location.pathname.split('/').pop() || 'TelaDashboard.html';

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      const link = item.querySelector('a');
      if (!link) return;
      const hrefPagina = (link.getAttribute('href') || '').split('/').pop();
      item.classList.toggle('active', hrefPagina === paginaAtual);
    });
  }

  // TEMA (CLARO / ESCURO)
  //temporario
  function aplicarTema(tema) {
    if (tema === 'claro') {
      document.documentElement.style.setProperty('--bg-dark', '#f4f6f9');
      document.documentElement.style.setProperty('--card-bg', '#ffffff');
      document.documentElement.style.setProperty('--border-color', '#e2e8f0');
      document.documentElement.style.setProperty('--text-main', '#1e293b');
      document.documentElement.style.setProperty('--text-muted', '#64748b');
    } else {
      document.documentElement.style.setProperty('--bg-dark', '#070a12');
      document.documentElement.style.setProperty('--card-bg', '#0d121d');
      document.documentElement.style.setProperty('--border-color', '#1a202c');
      document.documentElement.style.setProperty('--text-main', '#ffffff');
      document.documentElement.style.setProperty('--text-muted', '#8c9ba5');
    }
  }

  // Chamada pelos botões "Tema Claro" / "Tema Escuro" no cabeçalho (onclick="mudarTema('claro')")
  //troca depois pelo do will
  window.mudarTema = function (tema) {
    aplicarTema(tema);
    const menuTema = document.getElementById('menuTema');
    if (menuTema) menuTema.classList.remove('show');
    try {
      localStorage.setItem(STORAGE_KEY_TEMA, tema);
    } catch (err) {
      console.error('Não foi possível salvar a preferência de tema:', err);
    }
  };

  function carregarTema() {
    let tema = 'escuro';
    try {
      tema = localStorage.getItem(STORAGE_KEY_TEMA) || 'escuro';
    } catch (err) {
      tema = 'escuro';
    }
    aplicarTema(tema);
  }

  const btnConfig = document.getElementById('btnConfig');
  const menuTema = document.getElementById('menuTema');

  if (btnConfig && menuTema) {
    btnConfig.addEventListener('click', (e) => {
      e.stopPropagation();
      menuTema.classList.toggle('show');
    });

    // Fecha o menu de tema ao clicar fora dele
    document.addEventListener('click', (e) => {
      if (!menuTema.contains(e.target) && e.target !== btnConfig) {
        menuTema.classList.remove('show');
      }
    });
  }


  // relogio do cabeçalhu
  function updateClock() {
    const now = new Date();
    const clockTime = document.getElementById('clockTime');
    const clockDate = document.getElementById('clockDate');
    if (clockTime) clockTime.innerText = now.toLocaleTimeString('pt-BR');
    if (clockDate) clockDate.innerText = now.toLocaleDateString('pt-BR');
  }

 
  // inicialização
  marcarLinkAtivo();
  carregarTema();
  updateClock();
  setInterval(updateClock, 1000);
})();