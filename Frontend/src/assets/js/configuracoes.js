document.addEventListener("DOMContentLoaded", () => {
  // TEMA CLARO e ESCURO

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

// 2. MENU LATERAL (SIDEBAR) - ABRIR E FECHAR
  const sidebar = document.getElementById("sidebar");
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  const topHeaderToggleBtn = document.getElementById("topHeaderToggleBtn");

  if (sidebar) {
    const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    sidebar.classList.toggle("collapsed", isCollapsed);

    function toggleSidebar() {
      sidebar.classList.toggle("collapsed");
      const novoEstado = sidebar.classList.contains("collapsed");
      localStorage.setItem("sidebarCollapsed", novoEstado);
    }

    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener("click", toggleSidebar);
    if (topHeaderToggleBtn) topHeaderToggleBtn.addEventListener("click", toggleSidebar);

    document.querySelectorAll(".sidebar-nav .nav-item a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768 && !sidebar.classList.contains("collapsed")) {
          toggleSidebar();
        }
      });
    });
  }

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


  // 4. ATUALIZAÇÃO DA DATA E HORA
  function atualizarDataHora() {
    const horaEl = document.getElementById("hora-atual");
    const dataEl = document.getElementById("data-atual");
    const agora = new Date();

    if (horaEl) horaEl.innerText = agora.toLocaleTimeString("pt-BR");
    if (dataEl) dataEl.innerText = agora.toLocaleDateString("pt-BR");
  }

  atualizarDataHora();
  setInterval(atualizarDataHora, 1000);

  /* FUNÇOES DE CONFIGURAÇÕES */

  // A. CARREGAR CONFIGURAÇÕES SALVAS DO USUÁRIO
  carregarConfiguracoesSalvas();

  // B. GERENCIAMENTO DE NOTIFICAÇÕES (PERSISTÊNCIA VIA LOCALSTORAGE)
  const chkNotifEmail = document.getElementById("chkNotifEmail");
  const chkNotifSistema = document.getElementById("chkNotifSistema");

  if (chkNotifEmail) {
    chkNotifEmail.addEventListener("change", (e) => {
      localStorage.setItem("notifEmail", e.target.checked);
    });
  }
  if (chkNotifSistema) {
    chkNotifSistema.addEventListener("change", (e) => {
      localStorage.setItem("notifSistema", e.target.checked);
    });
  }

  // C. SALVAR PERFIL E FORMULÁRIO DE CONFIGURAÇÕES
  const formConfiguracoes = document.getElementById("formConfiguracoes");
  if (formConfiguracoes) {
    formConfiguracoes.addEventListener("submit", (e) => {
      e.preventDefault();

      const nomeUsuario = document.getElementById("inputNome")?.value;
      const emailUsuario = document.getElementById("inputEmail")?.value;

      if (nomeUsuario) localStorage.setItem("nomeUsuario", nomeUsuario);
      if (emailUsuario) localStorage.setItem("emailUsuario", emailUsuario);

      exibirMensagemFeedback("Configurações salvas com sucesso!", "sucesso");
    });
  }

  // D. PRÉ-VISUALIZAÇÃO DE FOTO DE PERFIL
  const inputFotoPerfil = document.getElementById("inputFotoPerfil");
  const imgPreview = document.getElementById("imgFotoPreview");

  if (inputFotoPerfil && imgPreview) {
    inputFotoPerfil.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          imgPreview.src = evt.target.result;
          localStorage.setItem("fotoPerfilData", evt.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // E. BOTÃO DE RESTAURAR PADRÕES
  const btnRestaurarPadroes = document.getElementById("btnRestaurarPadroes");
  if (btnRestaurarPadroes) {
    btnRestaurarPadroes.addEventListener("click", () => {
      if (confirm("Deseja realmente restaurar todas as configurações para o padrão?")) {
        localStorage.clear();
        location.reload();
      }
    });
  }
});

/* FUNÇÕES AUXILIARES DA TELA DE CONFIGURAÇÕES*/

function carregarConfiguracoesSalvas() {
  const inputNome = document.getElementById("inputNome");
  const inputEmail = document.getElementById("inputEmail");
  const chkNotifEmail = document.getElementById("chkNotifEmail");
  const chkNotifSistema = document.getElementById("chkNotifSistema");
  const imgPreview = document.getElementById("imgFotoPreview");

  if (inputNome) inputNome.value = localStorage.getItem("nomeUsuario") || "";
  if (inputEmail) inputEmail.value = localStorage.getItem("emailUsuario") || "";

  if (chkNotifEmail) {
    chkNotifEmail.checked = localStorage.getItem("notifEmail") !== "false";
  }
  if (chkNotifSistema) {
    chkNotifSistema.checked = localStorage.getItem("notifSistema") !== "false";
  }

  const fotoSalva = localStorage.getItem("fotoPerfilData");
  if (imgPreview && fotoSalva) {
    imgPreview.src = fotoSalva;
  }
}

function exibirMensagemFeedback(mensagem, tipo) {
  const containerFeedback = document.getElementById("mensagemFeedback");
  if (!containerFeedback) {
    alert(mensagem);
    return;
  }

  containerFeedback.innerText = mensagem;
  containerFeedback.className = `feedback-box ${tipo}`;
  containerFeedback.style.display = "block";

  setTimeout(() => {
    containerFeedback.style.display = "none";
  }, 3000);
}