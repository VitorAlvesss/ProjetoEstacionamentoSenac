(function () {
  const STORAGE_KEY_TEMA = 'goiabinha:tema';

  // 1. MENU LATERAL (SIDEBAR)
  const sidebar = document.getElementById('sidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const topHeaderToggleBtn = document.getElementById('topHeaderToggleBtn');

  function restoreSidebarState() {
    if (!sidebar) return;
    
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
    }
  }

  function toggleSidebar() {
    if (!sidebar) return;
    
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreSidebarState);
  } else {
    restoreSidebarState();
  }

  if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', toggleSidebar);
  if (topHeaderToggleBtn) topHeaderToggleBtn.addEventListener('click', toggleSidebar);

  document.querySelectorAll('.sidebar-nav .nav-item a').forEach(link => {
    link.addEventListener('click', () => {
      if (sidebar && window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
        toggleSidebar();
      }
    });
  });

  // 2. MARCAR LINK ATIVO
  function marcarLinkAtivo() {
    const caminhoAtual = window.location.pathname.toLowerCase();
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.remove('active');

      const link = item.querySelector('a');
      if (!link) return;
      const hrefLink = (link.getAttribute('href') || '').toLowerCase();

      if (hrefLink && (caminhoAtual.endsWith(hrefLink) || hrefLink.endsWith(caminhoAtual))) {
        item.classList.add('active');
      }
    });
  }

  // 3. TEMA (CLARO / ESCURO)
  const btnTema = document.getElementById("btnConfig");
  const menuTema = document.getElementById("menuTema"); // Elemento do menu drop-down de temas

  if (localStorage.getItem("tema") === "light") {
    document.body.classList.add("light-theme");
  }

  if (btnTema) {
    btnTema.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      localStorage.setItem("tema", isLight ? "light" : "dark");
    });
  }

  // Fecha o menu de tema ao clicar fora dele (com validação de existência)
  document.addEventListener('click', (e) => {
    if (menuTema && btnTema && !menuTema.contains(e.target) && e.target !== btnTema) {
      menuTema.classList.remove('show');
    }
  });

  // 4. ATUALIZAÇÃO DE DATA E HORA
  function atualizarDataHora() {
    const horaEl = document.getElementById('hora-atual');
    const dataEl = document.getElementById('data-atual');

    const agora = new Date();

    if (horaEl) {
      horaEl.innerText = agora.toLocaleTimeString('pt-BR');
    }
    if (dataEl) {
      dataEl.innerText = agora.toLocaleDateString('pt-BR');
    }
  }

  // 5. FORMA DE PAGAMENTO (OPÇÕES RADIO)
  const opcoesPagamento = document.querySelectorAll('.opcao-pagamento');

  opcoesPagamento.forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    if (!radio) return;

    radio.addEventListener('change', () => {
      opcoesPagamento.forEach(l => l.classList.remove('selecionado'));

      if (radio.checked) {
        label.classList.add('selecionado');
      }
    });
  });

  // 6. INICIALIZAÇÃO
  document.addEventListener('DOMContentLoaded', () => {
    marcarLinkAtivo();
    atualizarDataHora();
    setInterval(atualizarDataHora, 1000);
  });

})();