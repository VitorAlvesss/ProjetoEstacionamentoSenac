document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // ELEMENTOS DO HTML
    // ============================================================

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


    // ============================================================
    // MOVIMENTAÇÃO
    // ============================================================

    const entradasHoje =
        document.querySelector("#entradas-hoje");

    const saidasHoje =
        document.querySelector("#saidas-hoje");

    const permanecem =
        document.querySelector("#permanecem");


    // ============================================================
    // FINANCEIRO
    // ============================================================

    const subFinanceiro =
        document.querySelector("#sub-financeiro");

    const financeiroHoje =
        document.querySelector("#valor-financeiro");

    const ticketMedio =
        document.querySelector("#ticket-medio");

    const faturamentoHoje =
        document.querySelector("#faturamento-hoje");

    const qtdVeiculosHoje =
        document.querySelector("#qtd-veiculos-hoje");


    // ============================================================
    // TABELA
    // ============================================================

    const btnTodasMovimentacoes =
        document.querySelector("#todasMovimentacoes");

    const tabelaMovimentacoes =
        document.querySelector("#corpo-tabela");

    const btnAtualizarMovimentacao =
        document.querySelector("#btnAtualizarMovimentacoes");


    // ============================================================
    // IOT
    // ============================================================

    const dataIOT =
        document.querySelector("#data-iot");

    const btnAtualizarIOT =
        document.querySelector("#btnAtualizarIot");


    // ============================================================
    // REGISTROS
    // ============================================================

    let todosRegistros = [];


    // ============================================================
    // ATUALIZAR MOVIMENTAÇÕES
    // ============================================================

    btnAtualizarMovimentacao.addEventListener("click", () => {

        carregarDashboard();

    });


    // ============================================================
    // TODAS AS MOVIMENTAÇÕES
    // ============================================================

    btnTodasMovimentacoes.addEventListener("click", (event) => {

        event.preventDefault();

        todasMovimentacoes(todosRegistros);

    });


    // ============================================================
    // ATUALIZAR IOT
    // ============================================================

    btnAtualizarIOT.addEventListener("click", () => {

        carregarDashboard();

    });


    // ============================================================
    // CARREGAR DASHBOARD
    // ============================================================

    async function carregarDashboard() {

        try {

            const resposta =
                await fetch("/dashboard");


            if (!resposta.ok) {

                throw new Error(
                    `Erro HTTP: ${resposta.status}`
                );

            }


            const data =
                await resposta.json();


            // ====================================================
            // REGISTROS
            // ====================================================

            todosRegistros =
                data.todosRegistros || [];


            // ====================================================
            // VAGAS
            // ====================================================

            vagasTotais.textContent =
                data.vagas.total ?? 0;

            vagasLivres.textContent =
                data.vagas.livres ?? 0;

            vagasOcupadas.textContent =
                data.vagas.ocupadas ?? 0;


            detalheTaxa.textContent =
                `${data.vagas.ocupadas ?? 0} de ${data.vagas.total ?? 0} vagas`;

            tempoUso.textContent = data.tempoUso;

            // ====================================================
            // TAXA DE OCUPAÇÃO
            // ====================================================

            let taxa = 0;


            if (data.vagas.total > 0) {

                taxa =
                    (data.vagas.ocupadas /
                        data.vagas.total) * 100;

            }


            taxaOcupacao.textContent =
                `${taxa.toFixed(2)}%`;


            // ====================================================
            // FINANCEIRO
            // ====================================================

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


            faturamentoHoje.textContent =
                `R$ ${faturamento
                    .toFixed(2)
                    .replace(".", ",")}`;


            financeiroHoje.textContent =
                `R$ ${faturamento
                    .toFixed(2)
                    .replace(".", ",")}`;


            qtdVeiculosHoje.textContent =
                `${veiculos} veículos`;


            ticketMedio.textContent =
                `R$ ${ticket
                    .toFixed(2)
                    .replace(".", ",")}`;


            // ====================================================
            // MOVIMENTAÇÃO
            // ====================================================

            const entradas =
                data.movimentacao?.entradasHoje || 0;

            const saidas =
                data.movimentacao?.saidasHoje || 0;

            const permanecemAtual =
                data.movimentacao?.permanecem || 0;


            entradasHoje.textContent =
                entradas;

            saidasHoje.textContent =
                saidas;

            permanecem.textContent =
                permanecemAtual;


            // ====================================================
            // SUBTÍTULO FINANCEIRO
            // ====================================================

            subFinanceiro.textContent =
                `${entradas} entradas hoje`;


            // ====================================================
            // DATA DE ATUALIZAÇÃO
            // ====================================================

            const horario =
                new Date();


            dataIOT.textContent =
                horario.toLocaleString("pt-BR");


            // ====================================================
            // VAGAS
            // ====================================================

            carregarVagas(
                data.listaVagas || []
            );


            // ====================================================
            // MOVIMENTAÇÕES
            // ====================================================

            todasMovimentacoes(
                data.movimentacao?.movimentacoes || []
            );

            carregarDispositivosIOT();


        } catch (error) {

            console.error(
                "Erro ao carregar o dashboard:",
                error
            );

        }

    }


    // ============================================================
    // CARREGAR VAGAS
    // ============================================================

    function carregarVagas(vagas) {

        const listaVagas =
            document.querySelector("#listaVagas");


        listaVagas.innerHTML = "";


        vagas.forEach(vaga => {

            const itemVaga =
                document.createElement("div");


            itemVaga.classList.add(
                "item-vaga"
            );


            if (vaga.ocupada) {

                itemVaga.classList.add(
                    "status-ocupado"
                );


                itemVaga.innerHTML = `

                    <span class="led-status"></span>

                    <span class="texto-vaga">

                        ${vaga.codigo_vaga} -

                        <strong>
                            ${vaga.placa ?? "Ocupada"}
                        </strong>

                    </span>

                `;

            } else {

                itemVaga.classList.add(
                    "status-livre"
                );


                itemVaga.innerHTML = `

                    <span class="led-status"></span>

                    <span class="texto-vaga">

                        ${vaga.codigo_vaga} -

                        <strong class="info-status">
                            Livre
                        </strong>

                    </span>

                `;

            }


            listaVagas.appendChild(
                itemVaga
            );

        });

    }


    // ============================================================
    // MOVIMENTAÇÕES
    // ============================================================

    function todasMovimentacoes(registros) {

        tabelaMovimentacoes.innerHTML = "";


        registros.forEach(registro => {


            // ====================================================
            // STATUS
            // ====================================================

            const status =
                registro.pago
                    ? "Finalizado"
                    : "Em aberto";


            const classeStatus =
                registro.pago
                    ? "status-finalizado"
                    : "status-aberto";


            // ====================================================
            // LINHA
            // ====================================================

            const row =
                document.createElement("tr");


            // ====================================================
            // VALOR
            // ====================================================

            let valor = "---";


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
            // CONTEÚDO
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
                    ${registro.data_entrada ?? "---"}
                </td>


                <td>
                    ${registro.data_saida ?? "---"}
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


            tabelaMovimentacoes.appendChild(
                row
            );

        });

    }

    async function carregarDispositivosIOT() {

        const dispositivos = await buscarDispositivoIOT();

        const lista = document.querySelector("#lista-dispositivos");

        lista.innerHTML = "";

        dispositivos.forEach((dispositivo) => {

            const online = dispositivo.online;

            const classeLed = online
                ? "led-online"
                : "led-offline";

            const classeTexto = online
                ? "txt-verde"
                : "txt-vermelho";

            const status = online
                ? "Online"
                : "Offline";

            lista.innerHTML += `
            <div class="item-iot">

                <span class="led-iot ${classeLed}"></span>

                <span class="nome-dispositivo">
                    ${dispositivo.nome_dispositivo}
                </span>

                <strong class="status-iot ${classeTexto}">
                    ${status}
                </strong>

            </div>
        `;
        });
    }


    // ============================================================
    // CARREGAMENTO INICIAL
    // ============================================================

    carregarDashboard();

});