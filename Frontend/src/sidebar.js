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



/* Caso precisar adicionar uma nova tela: Adicione um novo objeto dentro do array SCREENS.
   Estrutura:
   {
     id: 'ID-DA-TELA',
     label: 'NOME QUE APARECE NO MENU',
     icon: 'ICONE-FONT-AWESOME',
     subtitle: 'DESCRIÇÃO DA TELA'
   }
O "id" deve ser único.
O mesmo "id" será utilizado para localizar a tela no HTML: id="screen-usuarios"
*/

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


/* Define qual tela será aberta automaticamente quando o usuário carregar a página.
para alterar:
const DEFAULT_SCREEN = 'dashboard';
Basta colocar o "id" de outra tela que esteja no SCREENS.
*/

const DEFAULT_SCREEN = 'veiculos';


/*
Guarda qual tela está atualmente selecionada.
*/
let currentScreen = DEFAULT_SCREEN;


function renderSidebarNav() {

/*Vai procura no HTML o elemento:<ul id="sidebarNav"></ul>*/
    const nav = document.getElementById('sidebarNav');


/*Se o elemento não existir nesta página,simplesmente interrompe a função*/
  if (!nav) return;


/*Percorre todas as telas cadastradas no SCREENS e cria os itens do menu automaticamente*/
  nav.innerHTML = SCREENS.map(s => `

    <li class="nav-item ${s.id === currentScreen ? 'active' : ''}">

      <a href="#"
         onclick="navigateTo('${s.id}'); return false;">

        <i class="fa-solid ${s.icon}"></i>

        ${s.label}

      </a>

    </li>

  `).join('');
}


/* Esta função é chamada quando o usuário clica em um item do menu.
importante:Para que a navegação funcione em uma página que contém várias telas, o HTML precisa possuir elementos como:
<div id="screen-dashboard" class="screen">
</div>

<div id="screen-veiculos" class="screen">
</div>

O ID "screen-" + o "id" cadastrado no SCREENS precisa corresponder exatamente.
*/

function navigateTo(screenId) {

/*Procura os dados da tela dentro do SCREENS*/
  const screenMeta = SCREENS.find(
    s => s.id === screenId
  );


/*Se a tela não estiver cadastrada no SCREENS,não é para fazer nada*/
  if (!screenMeta) return;


/*Atualiza a tela atualmente selecionada*/
  currentScreen = screenId;


/*Remove a classe "active" de todas as telas.
importante:Caso sua página utilize esse sistema de navegação,as telas precisam possuir a classe "screen".
*/
  document
    .querySelectorAll('.screen')
    .forEach(el => el.classList.remove('active'));


/*Procura a tela correspondente.
Exemplo: screenId = "veiculos"
O JavaScript procura:id="screen-veiculos"
*/
  const target = document.getElementById(
    `screen-${screenId}`
  );

/*Ativa a tela encontrada.*/
  if (target) {
    target.classList.add('active');
  }


/*Titulo da tela
Se sua tela tiver: "<h1 id="pageTitle"></h1>" o js preenchera automaticamente o título.Se o elemento não exista,não é para acontecer nada.
*/

  const titleEl = document.getElementById('pageTitle');

  if (titleEl) {
    titleEl.innerText = screenMeta.label;
  }


/*Subtitulo da tela
Se sua tela tiver: "<p id="pageSubtitle"></p>" o js preenchera automaticamente o subtítulo.
*/

  const subtitleEl = document.getElementById(
    'pageSubtitle'
  );

  if (subtitleEl) {
    subtitleEl.innerText = screenMeta.subtitle;
  }


/*Atualiza o menu para destacar a tela atualmente ativa*/
  renderSidebarNav();


  if (
    window.innerWidth <= 768 &&
    sidebar &&
    !sidebar.classList.contains('collapsed')
  ) {
    sidebar.classList.add('collapsed');
  }
}


/*Elementos do Menu.Aqui o JavaScript procura os elementos que estão no HTML*/

const sidebar = document.getElementById('sidebar');

const sidebarToggleBtn =
  document.getElementById('sidebarToggleBtn');

const topHeaderToggleBtn =
  document.getElementById('topHeaderToggleBtn');


function toggleSidebar() {

  if (sidebar) {
    sidebar.classList.toggle('collapsed');
  }
}

if (sidebarToggleBtn) {

  sidebarToggleBtn.addEventListener(
    'click',
    toggleSidebar
  );

}


/*Botão do cabeçalho
Quando a sidebar estiver fechada, o botão localizado no cabeçalho poderá ser utilizado para abrir novamente o menu */

if (topHeaderToggleBtn) {

  topHeaderToggleBtn.addEventListener(
    'click',
    toggleSidebar
  );

}






/*Inicialização do Menu
Ao carregar a página:
1. Cria os itens do menu
2. Seleciona a tela padrão
Não é necessário chamar essas funções manualmente em cada tela.
*/
renderSidebarNav();

navigateTo(DEFAULT_SCREEN);