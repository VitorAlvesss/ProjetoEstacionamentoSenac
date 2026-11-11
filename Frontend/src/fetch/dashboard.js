document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // ELEMENTOS DO HTML
    // ============================================================
    // Aqui buscamos os elementos da página que serão atualizados
    // com os dados vindos do backend.

    const vagasTotais =
        document.querySelector("#vagas-totais");

    const vagasLivres =
        document.querySelector("#vagas-livres");

    const vagasOcupadas =
        document.querySelector("#vagas-ocupadas");

    const taxaOcupacao =
        document.querySelector("#taxa-ocupacao");

    const detalheTaxa =
        document.querySelector("#detalhe-taxa");

    const tempoUso =
        document.querySelector("#tempoUso");

    const totalEntradasHoje = 
        document.querySelector("#totalEntradasHoje");

    // ============================================================
    // MOVIMENTAÇÃO
    // ============================================================
    // Elementos responsáveis por mostrar:
    // - quantidade de entradas
    // - quantidade de saídas
    // - quantidade de veículos que ainda permanecem no estacionamento

    const entradasHoje =
        document.querySelector("#entradasHoje");

    const saidasHoje =
        document.querySelector("#saidasHoje");

    const permanecem =
        document.querySelector("#permanecem");


    // ============================================================
    // FINANCEIRO
    // ============================================================
    // Elementos responsáveis pelas informações financeiras
    // do estacionamento.

    const financeiroHoje =
        document.querySelector("#valor-financeiro");

    const ticketMedio =
        document.querySelector("#ticketMedio");

    const faturamentoHoje =
        document.querySelector("#faturamento-hoje");

    const qtdVeiculosHoje =
        document.querySelector("#qtdVeiculosHoje");


    // ============================================================
    // TABELA
    // ============================================================
    // Elementos relacionados à tabela de movimentações.

    const btnTodasMovimentacoes =
        document.querySelector("#todasMovimentacoes");

    const tabelaMovimentacoes =
        document.querySelector("#corpo-tabela");

    const btnAtualizarMovimentacao =
        document.querySelector("#btnAtualizarMovimentacoes");

    // ============================================================
    // REGISTROS
    // ============================================================
    // Variável que guarda todos os registros recebidos do backend.
    //
    // Ela será utilizada quando o usuário clicar em
    // "Ver todas as movimentações".

    let todosRegistros = [];


    // ============================================================
    // ATUALIZAR MOVIMENTAÇÕES
    // ============================================================
    // Quando o botão de atualizar movimentações for clicado,
    // o dashboard inteiro será carregado novamente.

    btnAtualizarMovimentacao.addEventListener("click", () => {
        carregarDashboard();
    });


    // ============================================================
    // TODAS AS MOVIMENTAÇÕES
    // ============================================================
    // Impede que o link abra outra página.
    //
    // Depois chama a função que monta a tabela usando
    // todos os registros armazenados.

    if (btnTodasMovimentacoes) {
        btnTodasMovimentacoes.addEventListener("click", (event) => {

            event.preventDefault();

            todasMovimentacoes(todosRegistros);

        });
    };

    // ============================================================
    // CARREGAR DASHBOARD
    // ============================================================
    // Essa é a principal função do arquivo.
    //
    // Ela faz uma requisição para:
    //
    // GET /dashboard
    //
    // O backend retorna os dados do dashboard em JSON.

    async function carregarDashboard() {

        try {

            // ----------------------------------------------------
            // FAZ A REQUISIÇÃO PARA O BACKEND
            // ----------------------------------------------------

            const resposta = await fetch("http://localhost:3000/dashboard");


            // ----------------------------------------------------
            // VERIFICA SE A RESPOSTA FOI BEM-SUCEDIDA
            // ----------------------------------------------------
            // Caso o servidor retorne algo como 404, 500 etc.,
            // lançamos um erro.

            if (!resposta.ok) {

                throw new Error(
                    `Erro HTTP: ${resposta.status}`
                );

            }


            // ----------------------------------------------------
            // CONVERTE A RESPOSTA PARA JSON
            // ----------------------------------------------------

            const data =
                await resposta.json();

            console.log("Retorno completo do dashboard:", data);
            console.log("Tempo de uso recebido:", data.tempoUso);
            console.log("Elemento tempoUso:", tempoUso);


            // ====================================================
            // REGISTROS
            // ====================================================
            // Guarda todos os registros recebidos do backend.
            //
            // Se "todosRegistros" não existir, utiliza um array
            // vazio para evitar erro.

            todosRegistros =
                data.todosRegistros || [];


            // ====================================================
            // VAGAS
            // ====================================================
            // Atualiza os cards de vagas.

            vagasTotais.textContent =
                data.vagas.total ?? 0;

            vagasLivres.textContent =
                data.vagas.livres ?? 0;

            vagasOcupadas.textContent =
                data.vagas.ocupadas ?? 0;

            // Mostra algo como:
            //
            // 5 de 20 vagas

            detalheTaxa.textContent =
                `${data.vagas.ocupadas ?? 0} de ${data.vagas.total ?? 0} vagas`;


            // Atualiza o tempo médio de uso.

            tempoUso.textContent =
                data.tempoUso != null
                    ? `${data.tempoUso} min`
                    : "Sem dados";

            // ====================================================
            // TAXA DE OCUPAÇÃO
            // ====================================================
            // Calcula a porcentagem de vagas ocupadas.

            let taxa = 0;


            // Evita divisão por zero.

            if (data.vagas.total > 0) {

                taxa =
                    (data.vagas.ocupadas /
                        data.vagas.total) * 100;

            }


            // Exemplo:
            //
            // 50.00%

            taxaOcupacao.textContent =
                `${taxa.toFixed(2)}%`;

            // ====================================================
            // FINANCEIRO
            // ====================================================
            // Converte os valores recebidos do backend para Number.
            //
            // Caso não exista valor, utiliza 0.

            const faturamento =
                Number(
                    data.financeiro?.faturamento || 0
                );

            const ticket =
                Number(
                    data.financeiro?.ticketMedio || 0
                );


            const veiculos =
                Number(
                    data.financeiro?.veiculos || 0
                );


            // ----------------------------------------------------
            // FATURAMENTO DO CARD PRINCIPAL
            // ----------------------------------------------------

            faturamentoHoje.textContent =
                `R$ ${faturamento
                    .toFixed(2)
                    .replace(".", ",")}`;


            // ----------------------------------------------------
            // FATURAMENTO DO PAINEL FINANCEIRO
            // ----------------------------------------------------

            financeiroHoje.textContent =
                `R$ ${faturamento
                    .toFixed(2)
                    .replace(".", ",")}`;


            // ----------------------------------------------------
            // QUANTIDADE DE VEÍCULOS
            // ----------------------------------------------------

            qtdVeiculosHoje.textContent =
                `${veiculos} veículos`;


            // ----------------------------------------------------
            // TICKET MÉDIO
            // ----------------------------------------------------

            ticketMedio.textContent =
                `R$ ${ticket
                    .toFixed(2)
                    .replace(".", ",")}`;


            // ====================================================
            // MOVIMENTAÇÃO
            // ====================================================
            // Recupera os dados de movimentação.
            //
            // O "?." evita erro caso "movimentacao" não exista.

            const entradas =
                data.movimentacao?.entradasHoje || 0;

            const saidas =
                data.movimentacao?.saidasHoje || 0;

            const permanecemAtual =
                data.movimentacao?.permanecem || 0;


            // Atualiza os valores na tela.

            totalEntradasHoje.textContent =
                `${saidas} veículos`;

            entradasHoje.textContent =
                entradas;

            saidasHoje.textContent =
                saidas;

            permanecem.textContent =
                permanecemAtual;


            // ====================================================
            // SUBTÍTULO FINANCEIRO
            // ====================================================
            // Exibe a quantidade de entradas do dia.

            entradasHoje.textContent =
                `${entradas} entradas hoje`;

            // Converte para o formato brasileiro.
            //
            // Exemplo:
            // 24/08/2026, 15:30:20

            // ====================================================
            // MOVIMENTAÇÕES
            // ====================================================
            // Envia as movimentações para serem exibidas
            // na tabela.

            todasMovimentacoes(
                data.movimentacao?.movimentacoes || []
            );

        } catch (error) {

            // Caso alguma etapa do carregamento falhe,
            // o erro será exibido no console.

            console.error(
                "Erro ao carregar o dashboard:",
                error
            );

        }

    }

    function formatarData(dataString) {

        if (!dataString) {
            return "---";
        }

        const dataFormatada = new Date(dataString);

        if (isNaN(dataFormatada.getTime())) {
            return "---";
        }

        return dataFormatada.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
    }


    // ============================================================
    // MOVIMENTAÇÕES
    // ============================================================
    // Recebe os registros e monta cada linha da tabela.

    function todasMovimentacoes(registros) {

        // Remove as linhas antigas.

        tabelaMovimentacoes.innerHTML = "";


        // Percorre todos os registros.

        registros.forEach(registro => {


            // ====================================================
            // STATUS
            // ====================================================
            // Se o registro estiver pago, significa que foi
            // finalizado.
            //
            // Caso contrário, está em aberto.

            const status =
                registro.pago
                    ? "Finalizado"
                    : "Em aberto";


            // Define a classe CSS do status.

            const classeStatus =
                registro.pago
                    ? "status-finalizado"
                    : "status-aberto";


            // ====================================================
            // LINHA
            // ====================================================
            // Cria uma nova linha para a tabela.

            const row =
                document.createElement("tr");


            // ====================================================
            // VALOR
            // ====================================================
            // Por padrão, não existe valor.

            let valor = "---";


            // Se existir total_pago, converte para número
            // e formata como moeda brasileira.

            if (
                registro.total_pago !== null &&
                registro.total_pago !== undefined
            ) {

                valor =
                    `R$ ${Number(registro.total_pago)
                        .toFixed(2)
                        .replace(".", ",")}`;

            }


            // ====================================================
            // CONTEÚDO DA LINHA
            // ====================================================

            row.innerHTML = `

                <td class="txt-bold">
                    ${registro.placa ?? "---"}
                </td>


                <td>

                    <span class="badge-tipo">
                        Usuário
                    </span>

                </td>


                <td>
                    ${formatarData(registro.data_entrada)}
                </td>


                <td>
                    ${formatarData(registro.data_saida)}
                </td>


                <td>
                    ${registro.tempo_uso ?? "---"}
                </td>


                <td>
                    ${valor}
                </td>


                <td>

                    <span class="badge-status ${classeStatus}">
                        ${status}
                    </span>

                </td>

            `;


            // Adiciona a linha dentro do tbody.

            tabelaMovimentacoes.appendChild(
                row
            );

        });

    }

    // ============================================================
    // CARREGAMENTO INICIAL
    // ============================================================
    // Assim que o HTML terminar de carregar,
    // buscamos todos os dados do dashboard.

    carregarDashboard();

});