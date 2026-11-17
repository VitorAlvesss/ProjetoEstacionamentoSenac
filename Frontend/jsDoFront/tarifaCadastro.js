const API_URL = 'http://localhost:3000/api';
let tarifaAtualId = null;

// 1. Puxa os dados do banco e preenche o card e a modal
async function carregarTarifaAtiva() {
    try {
        const response = await fetch(`${API_URL}/tarifas/ativa`);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const tarifa = await response.json();
        tarifaAtualId = tarifa.id;

        const primeiraHoraFormatada = Number(tarifa.valor_primeira_hora).toFixed(2).replace('.', ',');
        const horaAdicionalFormatada = Number(tarifa.valor_hora_adicional).toFixed(2).replace('.', ',');

        // Preenche o card principal
        document.getElementById('nomeTarifa').value = primeiraHoraFormatada;
        document.getElementById('valorTarifa').value = horaAdicionalFormatada;
        document.getElementById('toleranciaTarifa').value = tarifa.tolerancia_minutos;

        // Preenche a modal de edição
        document.getElementById('editarNomeTarifa').value = primeiraHoraFormatada;
        document.getElementById('editarValorTarifa').value = horaAdicionalFormatada;
        document.getElementById('editarToleranciaTarifa').value = tarifa.tolerancia_minutos;

    } catch (erro) {
        console.error('Erro ao carregar tarifa do banco:', erro);
    }
}

// 2. Abre a modal sincronizando os valores atuais do card
function abrirModalEdicao() {
    document.getElementById('editarNomeTarifa').value = document.getElementById('nomeTarifa').value;
    document.getElementById('editarValorTarifa').value = document.getElementById('valorTarifa').value;
    document.getElementById('editarToleranciaTarifa').value = document.getElementById('toleranciaTarifa').value;

    const modal = document.getElementById('modalEditarTarifa');
    if (modal) modal.style.display = 'flex';
}

function fecharModalEdicao() {
    const modal = document.getElementById('modalEditarTarifa');
    if (modal) modal.style.display = 'none';
}

// 3. Salva a edição no banco (PUT)
async function salvarEdicaoTarifa() {
    if (!tarifaAtualId) {
        alert('Nenhuma tarifa carregada para editar.');
        return;
    }

    const rawPrimeiraHora = document.getElementById('editarNomeTarifa').value.trim().replace(',', '.');
    const rawHoraAdicional = document.getElementById('editarValorTarifa').value.trim().replace(',', '.');
    const rawTolerancia = document.getElementById('editarToleranciaTarifa').value.trim();

    const valorPrimeiraHora = Number(rawPrimeiraHora);
    const valorHoraAdicional = Number(rawHoraAdicional);
    const toleranciaMinutos = Number(rawTolerancia);

    if (
        rawPrimeiraHora === '' || !Number.isFinite(valorPrimeiraHora) || valorPrimeiraHora < 0 ||
        rawHoraAdicional === '' || !Number.isFinite(valorHoraAdicional) || valorHoraAdicional < 0 ||
        rawTolerancia === '' || !Number.isInteger(toleranciaMinutos) || toleranciaMinutos < 0
    ) {
        alert('Preencha todos os campos com valores válidos (maiores ou iguais a 0).');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tarifas/${tarifaAtualId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                valor_primeira_hora: valorPrimeiraHora,
                valor_hora_adicional: valorHoraAdicional,
                tolerancia_minutos: toleranciaMinutos,
                ativo: 1
            })
        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(resultado.erro || 'Erro ao atualizar tarifa.');
        }

        alert('Tarifa atualizada com sucesso!');
        fecharModalEdicao();
        await carregarTarifaAtiva(); // Atualiza os valores na tela imediatamente

    } catch (erro) {
        console.error('Erro ao salvar edição:', erro);
        alert(erro.message || 'Erro ao salvar as alterações no banco.');
    }
}

// 4. Conecta os eventos assim que a página carrega
document.addEventListener('DOMContentLoaded', () => {
    carregarTarifaAtiva();

    document.getElementById('btnEditarTarifa')?.addEventListener('click', abrirModalEdicao);
    document.getElementById('fecharModalTarifa')?.addEventListener('click', fecharModalEdicao);
    document.getElementById('btnCancelarEdicao')?.addEventListener('click', fecharModalEdicao);
    document.getElementById('btnSalvarEdicao')?.addEventListener('click', salvarEdicaoTarifa);
});