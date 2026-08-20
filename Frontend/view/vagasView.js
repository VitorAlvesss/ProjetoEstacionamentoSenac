document.addEventListener("DOMContentLoaded", () => {

    const vagasTotais = document.querySelector("#vagas-totais");
    const vagasLivres = document.querySelector("#vagas-livres");
    const vagasOcupadas = document.querySelector("#vagas-ocupadas");
    const taxaOcupacao = document.querySelector("#taxa-ocupacao");
    const entradasHoje = document.querySelector("#entradas-hoje");
    const saidasHoje = document.querySelector("#saidas-hoje");
    const permanecem = document.querySelector("#permanecem");
    const detalheTaxa = document.querySelector("#detalhe-taxa");
    const subFinanceiro = document.querySelector("#sub-financeiro");
    const financeiroHoje = document.querySelector("#valor-financeiro");
    const ticketMedio = document.querySelector("#ticket-medio");
    const faturamentoHoje = document.querySelector("#faturamento-hoje");
    const qtdVeiculosHoje = document.querySelector("#qtd-veiculos-hoje");

    const btnAtualizarMovimentacao = document.querySelector("#btnAtualizarMovimentacoes");

    const btnAtualizarIOT = document.querySelector("#btnAtualizarIot");

    btnAtualizarMovimentacao.addEventListener("click", () => {
        carregarDashboard();
    });

    btnAtualizarIOT.addEventListener("click", () => {
        carregarDashboard();
    });

    async function carregarDashboard() {

        try {

            const resposta = await fetch("/dashboard");
            const data = await resposta.json();

            // VAGAS

            vagasTotais.textContent = data.vagas.total;

            vagasLivres.textContent = data.vagas.livres;

            vagasOcupadas.textContent = data.vagas.ocupadas;

            detalheTaxa.textContent = data.vagas.ocupadas + " de " + data.vagas.total + " vagas";

            // FINANCEIRO
            faturamentoHoje.textContent =
                `R$ ${Number(data.financeiro.faturamento).toFixed(2).replace(".", ",")}`;

            qtdVeiculosHoje.textContent =
                `${data.financeiro.veiculos} veículos`;

            financeiroHoje.textContent =
                "R$ " + data.financeiro.faturamento.toFixed(2);

            ticketMedio.textContent =
                `R$ ${Number(data.financeiro.ticketMedio).toFixed(2).replace(".", ",")}`;


            // TAXA DE OCUPAÇÃO

            let taxa;

            if (data.vagas.total > 0) {

                taxa =
                    (data.vagas.ocupadas / data.vagas.total) * 100;

            } else {

                taxa = 0;

            }

            taxaOcupacao.textContent =
                taxa.toFixed(2) + "%";


            // MOVIMENTAÇÃO

            subFinanceiro.textContent =
                data.movimentacao.entradasHoje;

            entradasHoje.textContent =
                data.movimentacao.entradasHoje;

            saidasHoje.textContent =
                data.movimentacao.saidasHoje;

            permanecem.textContent =
                data.movimentacao.permanecem;


            // VAGAS

            carregarVagas(data.vagasLista);

        } catch (error) {

            console.error(
                "Erro ao carregar o dashboard:",
                error
            );

        }
    }


    function carregarVagas(vagas) {

        const listaVagas =
            document.querySelector("#lista-vagas");

        listaVagas.innerHTML = "";


        vagas.forEach(vaga => {

            const itemVaga =
                document.createElement("div");

            itemVaga.classList.add("item-vaga");


            if (vaga.ocupada) {

                // VAGA OCUPADA

                itemVaga.classList.add("status-ocupado");

                itemVaga.innerHTML = `
                    <span class="led-status"></span>

                    <span class="texto-vaga">
                        ${vaga.codigo_vaga} -
                        <strong>${vaga.placa}</strong>
                    </span>
                `;

            } else {

                // VAGA LIVRE

                itemVaga.classList.add("status-livre");

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

            listaVagas.appendChild(itemVaga);

        });

    }

    carregarDashboard();

});