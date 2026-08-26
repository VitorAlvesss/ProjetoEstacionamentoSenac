/*
   entradassaidas.js
  
   Lógica específica da tela "Entradas e Saídas" (TelaEntradasSaidas.html).
*/

// Recupera do localStorage ou inicia com lista vazia
let movimentacoes = JSON.parse(localStorage.getItem('movimentacoes')) || [];

const elEstacionados   = document.getElementById('num-estacionados');
const elSaidas         = document.getElementById('num-saidas');
const elTotalEntradas  = document.getElementById('num-total-entradas');

const modal        = document.getElementById('modalEntrada');
const btnAbrirModal = document.getElementById('btnNovaEntrada');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnCancelar   = document.getElementById('btnCancelar');
const formEntrada   = document.getElementById('formNovaEntrada');
const tabela        = document.getElementById('listaMovimentacao');

// Abrir/fechar modal
const fecharModal = () => {
  modal.classList.remove('visivel');
  formEntrada.reset();
};

btnAbrirModal.addEventListener('click', () => modal.classList.add('visivel'));
btnFecharModal.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);

// Salva no localStorage e renderiza a tabela
function salvarERenderizar() {
  localStorage.setItem('movimentacoes', JSON.stringify(movimentacoes));
  renderizarTabela();
}

function renderizarTabela() {
  tabela.innerHTML = '';

  let estacionados = 0;
  let saidas = 0;

  movimentacoes.forEach((item, index) => {
    if (item.status === 'Estacionado') estacionados++;
    if (item.status === 'Finalizado')  saidas++;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.placa}</strong></td>
      <td>${item.vaga}</td>
      <td>${item.tipo}</td>
      <td>${item.entrada}</td>
      <td>${item.saida}</td>
      <td><span class="status-badge status-${item.status === 'Estacionado' ? 'estacionado' : 'saiu'}">${item.status}</span></td>
      <td>R$ ${item.valor}</td>
      <td>
        ${item.status === 'Estacionado'
          ? `<button class="btn-saida-acao" onclick="darSaida(${index})"><i class="fa-solid fa-right-from-bracket"></i> Dar Saída</button>`
          : `<i class="fa-solid fa-check-double" style="color:#00e676;"></i> Concluído`}
      </td>
    `;
    tabela.appendChild(tr);
  });

  elEstacionados.innerText  = String(estacionados).padStart(2, '0');
  elSaidas.innerText        = String(saidas).padStart(2, '0');
  elTotalEntradas.innerText = movimentacoes.length;
}

// Registrar nova entrada
formEntrada.addEventListener('submit', (event) => {
  event.preventDefault();

  const novaEntrada = {
    placa:   document.getElementById('placa').value.toUpperCase(),
    vaga:    document.getElementById('vaga').value,
    tipo:    document.getElementById('tipoCliente').value,
    entrada: `Hoje ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    saida:   '—',
    status:  'Estacionado',
    valor:   '0,00'
  };

  movimentacoes.unshift(novaEntrada);
  salvarERenderizar();
  fecharModal();
});

// Dar saída a um veículo
window.darSaida = function (index) {
  movimentacoes[index].saida  = `Hoje ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  movimentacoes[index].status = 'Finalizado';
  movimentacoes[index].valor  = '15,00';
  salvarERenderizar();
};

// Carrega os dados salvos ao abrir a página
renderizarTabela();