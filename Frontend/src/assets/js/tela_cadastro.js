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



// Renderização do gráfico do Financeiro Hoje

const ctxFaturamento = document.getElementById('graficoFaturamento');

if (ctxFaturamento) {
  new Chart(ctxFaturamento, {
    type: 'line',
    data: {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
      datasets: [{
        data: [150, 280, 200, 320, 290, 410, 380, 487.50],
        borderColor: '#22c55e',
        borderWidth: 2,
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: (context) => context.dataIndex === 7 ? 4 : 0,
        pointBackgroundColor: '#22c55e'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}



// ==================================================
// MODAL DE EDIÇÃO DA TARIFA
// ==================================================

document.addEventListener('DOMContentLoaded', () => {

  // ELEMENTOS DA MODAL

  const modalEditarTarifa = document.getElementById('modalEditarTarifa');

  const btnEditarTarifa = document.getElementById('btnEditarTarifa');

  const fecharModalTarifa = document.getElementById('fecharModalTarifa');

  const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');

  const btnSalvarEdicao = document.getElementById('btnSalvarEdicao');


  // CAMPOS DO CADASTRO

  const nomeTarifa = document.getElementById('nomeTarifa');

  const valorTarifa = document.getElementById('valorTarifa');

  const toleranciaTarifa = document.getElementById('toleranciaTarifa');


  // CAMPOS DA MODAL

  const editarNomeTarifa = document.getElementById('editarNomeTarifa');

  const editarValorTarifa = document.getElementById('editarValorTarifa');

  const editarToleranciaTarifa = document.getElementById('editarToleranciaTarifa');


  // VERIFICA SE TODOS OS ELEMENTOS EXISTEM

  if (
    !modalEditarTarifa ||
    !btnEditarTarifa ||
    !fecharModalTarifa ||
    !btnCancelarEdicao ||
    !btnSalvarEdicao ||
    !nomeTarifa ||
    !valorTarifa ||
    !toleranciaTarifa ||
    !editarNomeTarifa ||
    !editarValorTarifa ||
    !editarToleranciaTarifa
  ) {
    return;
  }


  // MÁSCARA DE MOEDA

  editarValorTarifa.addEventListener('input', () => {

    let valor = editarValorTarifa.value.replace(/\D/g, '');

    if (valor === '') {
      editarValorTarifa.value = '';
      return;
    }

    valor = (Number(valor) / 100).toFixed(2);

    editarValorTarifa.value = valor.replace('.', ',');

  });

  valorTarifa.addEventListener('input', () => {

    let valor = valorTarifa.value.replace(/\D/g, '');

    if (valor === '') {
      valorTarifa.value = '';
      return;
    }

    valor = (Number(valor) / 100).toFixed(2);

    valorTarifa.value = valor.replace('.', ',');
  });


  // ABRIR MODAL

  function abrirModalTarifa() {

    // Copia os valores atuais do cadastro para a modal
    editarNomeTarifa.value = nomeTarifa.value;

    // Converte o valor para o formato da máscara
    const valorAtual = valorTarifa.value.replace(/\D/g, '');

    if (valorAtual !== '') {
      editarValorTarifa.value = (Number(valorAtual) / 100)
        .toFixed(2)
        .replace('.', ',');
    } else {
      editarValorTarifa.value = '';
    }

    editarToleranciaTarifa.value = toleranciaTarifa.value;

    modalEditarTarifa.classList.add('ativo');

    document.body.style.overflow = 'hidden';

    editarNomeTarifa.focus();

  }


  // FECHAR MODAL

  function fecharModal() {

    modalEditarTarifa.classList.remove('ativo');

    document.body.style.overflow = '';

  }


  // BOTÃO EDITAR

  btnEditarTarifa.addEventListener('click', abrirModalTarifa);


  // BOTÃO X

  fecharModalTarifa.addEventListener('click', fecharModal);


  // BOTÃO CANCELAR

  btnCancelarEdicao.addEventListener('click', fecharModal);


  // FECHAR AO CLICAR FORA DA MODAL

  modalEditarTarifa.addEventListener('click', (event) => {

    if (event.target === modalEditarTarifa) {
      fecharModal();
    }

  });


  // FECHAR AO PRESSIONAR ESC

  document.addEventListener('keydown', (event) => {

    if (
      event.key === 'Escape' &&
      modalEditarTarifa.classList.contains('ativo')
    ) {
      fecharModal();
    }

  });


  // BOTÃO SALVAR

  btnSalvarEdicao.addEventListener('click', () => {

    const novoNome = editarNomeTarifa.value.trim();

    const novoValor = editarValorTarifa.value.trim();

    const novaTolerancia = editarToleranciaTarifa.value.trim();


    // VALIDAÇÃO DOS CAMPOS

    if (
      novoNome === '' ||
      novoValor === '' ||
      novaTolerancia === ''
    ) {

      alert('Preencha todos os campos antes de salvar.');

      return;

    }


    // CONVERTE O VALOR DA MÁSCARA PARA NÚMERO

    const valorNumerico = Number(novoValor.replace(',', '.'));


    // VALIDAÇÃO DOS VALORES NUMÉRICOS

    if (
      !Number.isFinite(valorNumerico) ||
      !Number.isFinite(Number(novaTolerancia)) ||
      valorNumerico < 0 ||
      Number(novaTolerancia) < 0
    ) {

      alert('Informe valores numéricos válidos.');

      return;

    }


    // ATUALIZA OS CAMPOS DO CADASTRO

    nomeTarifa.value = novoNome;

    valorTarifa.value = valorNumerico.toFixed(2).replace('.', ',');

    toleranciaTarifa.value = novaTolerancia;


    // LIMPA OS CAMPOS DA MODAL

    editarNomeTarifa.value = '';
    editarValorTarifa.value = '';
    editarToleranciaTarifa.value = '';

    // FECHA A MODAL

    fecharModal();
    alert('Tarifa atualizada com sucesso!');

  });

});
