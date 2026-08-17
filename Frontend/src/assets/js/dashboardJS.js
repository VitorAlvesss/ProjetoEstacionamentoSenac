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



/* Caso precisar adicionar uma nova tela: Adicione um novo objeto dentro do array SCREENS. */
const SCREENS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fa-house',
    subtitle: 'Visão geral do estacionamento'
  },
  {
    id: 'vagas',
    label: 'Vagas',
    icon: 'fa-square-parking',
    subtitle: 'Gerencie as vagas do estacionamento'
  },
  {
    id: 'veiculos',
    label: 'Veículos / Usuários',
    icon: 'fa-car',
    subtitle: 'Cadastre e gerencie veículos e usuários do estacionamento'
  },
  {
    id: 'entradas-saidas',
    label: 'Entradas e Saídas',
    icon: 'fa-right-to-bracket',
    subtitle: 'Controle o fluxo de entradas e saídas'
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: 'fa-dollar-sign',
    subtitle: 'Acompanhe o faturamento do estacionamento'
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: 'fa-file-lines',
    subtitle: 'Relatórios e estatísticas'
  },
  {
    id: 'dispositivos-iot',
    label: 'Dispositivos IoT',
    icon: 'fa-sitemap',
    subtitle: 'Gerencie os dispositivos conectados'
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: 'fa-gear',
    subtitle: 'Configurações do sistema'
  }
];

/* Tela padrão configurada para a sua página atual */
const DEFAULT_SCREEN = 'dashboard';

let currentScreen = DEFAULT_SCREEN;

function renderSidebarNav() {
  const nav = document.getElementById('sidebarNav');

  if (!nav) return;

  nav.innerHTML = SCREENS.map(s => `
    <li class="nav-item ${s.id === currentScreen ? 'active' : ''}">
      <a href="#" onclick="navigateTo('${s.id}'); return false;">
        <i class="fa-solid ${s.icon}"></i>
        ${s.label}
      </a>
    </li>
  `).join('');
}

/* Tornamos a função acessível para o onclick do HTML */
window.navigateTo = function(screenId) {
  const screenMeta = SCREENS.find(s => s.id === screenId);

  if (!screenMeta) return;

  currentScreen = screenId;

  document
    .querySelectorAll('.screen')
    .forEach(el => el.classList.remove('active'));

  const target = document.getElementById(`screen-${screenId}`);

  if (target) {
    target.classList.add('active');
  }

  const titleEl = document.getElementById('pageTitle');
  if (titleEl) {
    titleEl.innerText = screenMeta.label;
  }

  const subtitleEl = document.getElementById('pageSubtitle');
  if (subtitleEl) {
    subtitleEl.innerText = screenMeta.subtitle;
  }

  renderSidebarNav();

  if (
    window.innerWidth <= 768 &&
    sidebar &&
    !sidebar.classList.contains('collapsed')
  ) {
    sidebar.classList.add('collapsed');
  }
};

/* Elementos do Menu */
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const topHeaderToggleBtn = document.getElementById('topHeaderToggleBtn');

function toggleSidebar() {
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
  }
}

if (sidebarToggleBtn) {
  sidebarToggleBtn.addEventListener('click', toggleSidebar);
}

if (topHeaderToggleBtn) {
  topHeaderToggleBtn.addEventListener('click', toggleSidebar);
}

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