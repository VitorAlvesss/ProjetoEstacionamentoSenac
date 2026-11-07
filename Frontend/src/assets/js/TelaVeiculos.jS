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


const STORAGE_KEY_VEICULOS = 'goiabinha:veiculos';

let vehiclesData = [];
let currentPage = 1;
let itemsPerPage = 10;

const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const paginationInfo = document.getElementById('paginationInfo');
const paginationButtons = document.getElementById('paginationButtons');
const cardTotalCount = document.getElementById('cardTotalCount');
const cardCadastradosCount = document.getElementById('cardCadastradosCount');
const registerForm = document.getElementById('registerForm');

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderTable() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  const filteredData = vehiclesData.filter(item => {
    return item.placa.toLowerCase().includes(searchTerm) ||
           item.nome.toLowerCase().includes(searchTerm) ||
           item.contato.toLowerCase().includes(searchTerm);
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const pageItems = filteredData.slice(startIndex, endIndex);

  tableBody.innerHTML = '';

  if (pageItems.length === 0) {
    const mensagem = vehiclesData.length === 0
      ? 'Nenhum veículo cadastrado ainda. Use o formulário "Cadastro rápido" ao lado.'
      : 'Nenhum resultado encontrado para a sua busca.';
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">
          ${mensagem}
        </td>
      </tr>
    `;
  } else {
    pageItems.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="badge-plate"><i class="fa-solid fa-car"></i> ${escapeHtml(item.placa)}</span></td>
        <td>
          <div class="user-cell">
            <div class="avatar-circle">${getInitials(item.nome)}</div>
            <div class="user-info-table">
              <span class="name">${escapeHtml(item.nome)}</span>
            </div>
          </div>
        </td>
        <td>${escapeHtml(item.contato)}</td>
        <td>${escapeHtml(item.data)}</td>
        <td class="actions-cell">
          <i class="fa-regular fa-eye" title="Visualizar" onclick="viewVehicle(${item.id})"></i>
          <i class="fa-solid fa-pen edit" title="Editar" onclick="editVehicle(${item.id})"></i>
          <i class="fa-solid fa-trash delete" title="Excluir" onclick="deleteVehicle(${item.id})"></i>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  if (totalItems === 0) {
    paginationInfo.innerText = `Exibindo 0 a 0 de 0 registros`;
  } else {
    paginationInfo.innerText = `Exibindo ${startIndex + 1} a ${endIndex} de ${totalItems} registros`;
  }

  cardTotalCount.innerText = vehiclesData.length;
  cardCadastradosCount.innerText = vehiclesData.length;

  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  paginationButtons.innerHTML = '';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { currentPage--; renderTable(); };
  paginationButtons.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.innerText = i;
    pageBtn.onclick = () => { currentPage = i; renderTable(); };
    paginationButtons.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { currentPage++; renderTable(); };
  paginationButtons.appendChild(nextBtn);
}

registerForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('formName').value.trim();
  const placa = document.getElementById('formPlate').value.trim().toUpperCase();
  const contato = document.getElementById('formContact').value.trim();

  // Validação: nenhum campo pode ficar vazio (mesmo que só com espaços)
  if (!nome || !placa || !contato) {
    alert('Preencha todos os campos antes de cadastrar.');
    return;
  }

  // Validação: não permite placa duplicada
  const placaJaExiste = vehiclesData.some(v => v.placa === placa);
  if (placaJaExiste) {
    alert(`A placa ${placa} já está cadastrada.`);
    return;
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR');

  const newItem = {
    id: Date.now(),
    nome,
    placa,
    contato,
    data: formattedDate
  };

  vehiclesData.unshift(newItem);
  registerForm.reset();
  currentPage = 1;
  renderTable();
  salvarVeiculos();
  //Usuario e Veiculo
  alert(`Usuario e Veiculo ${newItem.nome} cadastrado com sucesso!`);
});

window.viewVehicle = function (id) {
  const item = vehiclesData.find(v => v.id === id);
  if (item) {
    alert(`DETALHES DO REGISTRO:\n\nPlaca: ${item.placa}\nNome: ${item.nome}\nContato: ${item.contato}\nData Cadastro: ${item.data}`);
  }
};

window.editVehicle = function (id) {
  const item = vehiclesData.find(v => v.id === id);
  if (!item) return;

  const newName = prompt("Editar Nome:", item.nome);
  if (newName === null) return;

  const newPlate = prompt("Editar Placa:", item.placa);
  if (newPlate === null) return;

  const newContact = prompt("Editar E-mail / Telefone:", item.contato);
  if (newContact === null) return;

  const nomeTrim = newName.trim();
  const placaTrim = newPlate.trim().toUpperCase();
  const contatoTrim = newContact.trim();

  if (!nomeTrim || !placaTrim || !contatoTrim) {
    alert('Nenhum campo pode ficar vazio. Edição cancelada.');
    return;
  }

  const placaEmUso = vehiclesData.some(v => v.id !== id && v.placa === placaTrim);
  if (placaEmUso) {
    alert(`A placa ${placaTrim} já está em uso por outro cadastro.`);
    return;
  }

  item.nome = nomeTrim;
  item.placa = placaTrim;
  item.contato = contatoTrim;

  renderTable();
  salvarVeiculos();
  alert("Registro atualizado com sucesso!");
};

window.deleteVehicle = function (id) {
  const item = vehiclesData.find(v => v.id === id);
  if (item && confirm(`Tem certeza que deseja excluir o cadastro de "${item.nome}" (${item.placa})?`)) {
    vehiclesData = vehiclesData.filter(v => v.id !== id);
    renderTable();
    salvarVeiculos();
  }
};

searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });

document.getElementById('itemsPerPageSelect').addEventListener('change', function () {
  itemsPerPage = parseInt(this.value);
  currentPage = 1;
  renderTable();
});


//(localStorage do navegador)
function salvarVeiculos() {
  try {
    localStorage.setItem(STORAGE_KEY_VEICULOS, JSON.stringify(vehiclesData));
  } catch (err) {
    console.error('Não foi possível salvar os cadastros:', err);
  }
}

function carregarVeiculos() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY_VEICULOS);
    vehiclesData = salvo ? JSON.parse(salvo) : [];
  } catch (err) {
    vehiclesData = [];
  }
  renderTable();
}

// inicialização
carregarVeiculos();


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