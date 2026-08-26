/*IMPRESSÃO*/

document.getElementById("btnImprimir").addEventListener("click", function () {

    window.print();

});


/* GERAÇÃO DO PDF*/

document.getElementById("btnGerarPDF").addEventListener("click", function () {

    const relatorio = document.querySelector(".relatorio-container");

    const opcoes = {

        margin: 8,

        filename: "Relatorio-Mensal-Estacionamento.pdf",

        image: {
            type: "jpeg",
            quality: 0.98
        },

        html2canvas: {
            scale: 2,
            useCORS: true
        },

        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "landscape"
        }

    };

    html2pdf()
        .set(opcoes)
        .from(relatorio)
        .save();

});


/* DATA E HORA*/

function atualizarDataHora() {

    const agora = new Date();

    const hora = agora.toLocaleTimeString("pt-BR");

    const data = agora.toLocaleDateString("pt-BR");

    const elementoHora = document.getElementById("hora-atual");
    const elementoData = document.getElementById("data-atual");

    if (elementoHora) {
        elementoHora.textContent = hora;
    }

    if (elementoData) {
        elementoData.textContent = data;
    }

}

atualizarDataHora();

setInterval(atualizarDataHora, 1000);


/* DATA DE GERAÇÃO DO RELATÓRIO*/

function atualizarDataGeracao() {

    const agora = new Date();

    const data = agora.toLocaleDateString("pt-BR");

    const hora = agora.toLocaleTimeString("pt-BR");

    const elemento =
        document.getElementById("data-geracao");

    if (elemento) {

        elemento.textContent =
            data + " " + hora;

    }

}

atualizarDataGeracao();


/* TEMA CLARO / ESCURO*/

const btnTema =
    document.getElementById("btnTema");

if (btnTema) {

    btnTema.addEventListener("click", function () {

        document.body.classList.toggle("light-theme");

        const temaClaro =
            document.body.classList.contains("light-theme");

        localStorage.setItem(
            "theme",
            temaClaro ? "light" : "dark"
        );

    });

}


/* Recupera tema salvo */

if (
    localStorage.getItem("theme") === "light"
) {

    document.body.classList.add("light-theme");

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


