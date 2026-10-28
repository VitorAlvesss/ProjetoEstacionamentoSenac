const btnTema = document.getElementById("btnTema");

// Carrega o tema salvo
if (localStorage.getItem("tema") === "light") {
  document.body.classList.add("light-theme");
}

// Se o botão existir na tela atual, adiciona o evento de clique
if (btnTema) {
  btnTema.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    localStorage.setItem("tema", isLight ? "light" : "dark");
  });
}




// Menu lateral (sidebar) abrir e fechar

(function () {
  // Executa com segurança assim que o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const topHeaderToggleBtn = document.getElementById('topHeaderToggleBtn');

    if (!sidebar) return;

    // 1. Restaura o estado salvo no localStorage
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
    }

    // 2. Função para alternar e salvar o estado
    function toggleSidebar() {
      sidebar.classList.toggle('collapsed');
      const novoEstado = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebarCollapsed', novoEstado);
    }

    // 3. Eventos dos botões hambúrguer
    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', toggleSidebar);
    if (topHeaderToggleBtn) topHeaderToggleBtn.addEventListener('click', toggleSidebar);

    // 4. Fecha automaticamente em telas menores ao clicar em um link
    document.querySelectorAll('.sidebar-nav .nav-item a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
          toggleSidebar();
        }
      });
    });
  });
})();

// MARCAR OPÇÃO SELECIONADA
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

// Executa automaticamente quando a página carrega
document.addEventListener('DOMContentLoaded', marcarLinkAtivo);





/* Atualização da Data e Hora no Cabeçalho */
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

/* Chama a hora imediatamente e depois a cada 1 segundo */
atualizarDataHora();
setInterval(atualizarDataHora, 1000);

/* Inicialização do Menu */
renderSidebarNav();
window.navigateTo(DEFAULT_SCREEN);
