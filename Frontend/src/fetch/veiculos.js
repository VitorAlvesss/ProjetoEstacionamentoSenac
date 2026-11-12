import { alerta } from '../assets/js/sweetAlert.js';
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

const API_URL = 'http://localhost:3000';
const tabela = document.getElementById('tableBody');
const busca = document.getElementById('searchInput');
const infoPaginacao = document.getElementById('paginationInfo');
const botoesPaginacao = document.getElementById('paginationButtons');
const itensPorPaginaSelect = document.getElementById('itemsPerPageSelect');
const cardUsuarios = document.getElementById('cardTotalCount');
const cardVeiculos = document.getElementById('cardCadastradosCount');
const cardAtivos = document.getElementById('cardAtivos');
const cardEntradas = document.getElementById('cardEntradas');
const cardSaidas = document.getElementById('cardSaidas');
const cardFaturamento = document.getElementById('cardFaturamento');

let veiculos = [];
let paginaAtual = 1;
let itensPorPagina = Number(itensPorPaginaSelect?.value) || 10;

function adicionarCelula(linha, valor) {
    const celula = document.createElement('td');
    celula.textContent = valor ?? '';
    linha.appendChild(celula);
    return celula;
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(valor) || 0);
}

function desenharTabela() {
    if (!tabela) return;

    const termo = (busca?.value || '').trim().toLocaleLowerCase('pt-BR');
    const filtrados = veiculos.filter((veiculo) =>
        [veiculo.placa, veiculo.nome, veiculo.contato]
            .some((valor) => String(valor || '').toLocaleLowerCase('pt-BR').includes(termo))
    );

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    paginaAtual = Math.min(paginaAtual, totalPaginas);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const pagina = filtrados.slice(inicio, inicio + itensPorPagina);

    tabela.replaceChildren();
    if (pagina.length === 0) {
        const linha = document.createElement('tr');
        const celula = adicionarCelula(linha, 'Nenhum veículo encontrado.');
        celula.colSpan = 5;
        tabela.appendChild(linha);
    } else {
        pagina.forEach((veiculo) => {
            const linha = document.createElement('tr');
            adicionarCelula(linha, veiculo.placa);
            adicionarCelula(linha, veiculo.nome);
            adicionarCelula(linha, veiculo.contato);
            adicionarCelula(linha, veiculo.data_cadastro_usuario);
            adicionarCelula(linha, '—');
            tabela.appendChild(linha);
        });
    }

    if (infoPaginacao) {
        const primeiro = filtrados.length ? inicio + 1 : 0;
        const ultimo = Math.min(inicio + itensPorPagina, filtrados.length);
        infoPaginacao.textContent = `Exibindo ${primeiro} a ${ultimo} de ${filtrados.length} registros`;
    }

    desenharPaginacao(totalPaginas);
}

function desenharPaginacao(totalPaginas) {
    if (!botoesPaginacao) return;
    botoesPaginacao.replaceChildren();

    for (let numero = 1; numero <= totalPaginas; numero++) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = `page-btn ${numero === paginaAtual ? 'active' : ''}`;
        botao.textContent = numero;
        botao.addEventListener('click', () => {
            paginaAtual = numero;
            desenharTabela();
        });
        botoesPaginacao.appendChild(botao);
    }
}

async function carregarDashboard() {
    try {
        const resposta = await fetch(`${API_URL}/dashboard`);
        if (!resposta.ok) throw new Error('Não foi possível carregar os dados do dashboard.');

        const dashboard = await resposta.json();
        if (cardAtivos) cardAtivos.textContent = dashboard.movimentacao?.permanecem ?? 0;
        if (cardEntradas) cardEntradas.textContent = dashboard.movimentacao?.entradasHoje ?? 0;
        if (cardSaidas) cardSaidas.textContent = dashboard.movimentacao?.saidasHoje ?? 0;
        if (cardFaturamento) cardFaturamento.textContent = formatarMoeda(dashboard.financeiro?.faturamento);
    } catch (erro) {
        console.error('Não foi possível carregar os dados do dashboard:', erro);
    }
}

async function carregarVeiculos() {
    try {
        const resposta = await fetch(`${API_URL}/veiculo`);
        if (!resposta.ok) throw new Error('Não foi possível carregar os veículos.');

        const dados = await resposta.json();
        veiculos = dados.veiculos || [];
        if (cardUsuarios) cardUsuarios.textContent = dados.cards?.usuarios ?? 0;
        if (cardVeiculos) cardVeiculos.textContent = dados.cards?.veiculos ?? 0;
        desenharTabela();
        await carregarDashboard();
    } catch (erro) {
        console.error('Erro ao carregar a tela de veículos:', erro);
        await alerta('error', 'Erro ao carregar a tela', erro.message);
    }
}

busca?.addEventListener('input', () => {
    paginaAtual = 1;
    desenharTabela();
});

itensPorPaginaSelect?.addEventListener('change', () => {
    itensPorPagina = Number(itensPorPaginaSelect.value) || 10;
    paginaAtual = 1;
    desenharTabela();
});

async function deletarVeiculo(id) {
    const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Este veículo será excluído permanentemente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    });

    if (!confirmacao.isConfirmed) return;

    try {
        const resposta = await fetch(`${API_URL}/veiculo/${id}`, { method: 'DELETE' });
        if (!resposta.ok) throw new Error('Não foi possível excluir o veículo.');
        await carregarVeiculos();
        await Swal.fire('Excluído!', 'Veículo removido com sucesso.', 'success');
    } catch (erro) {
        await alerta('error', 'Erro ao excluir', erro.message);
    }
}

carregarVeiculos();
