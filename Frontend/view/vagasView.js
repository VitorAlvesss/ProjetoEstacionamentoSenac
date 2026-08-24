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


    // ============================================================
    // MOVIMENTAÇÃO
    // ============================================================
    // Elementos responsáveis por mostrar:
    // - quantidade de entradas
    // - quantidade de saídas
    // - quantidade de veículos que ainda permanecem no estacionamento

    const entradasHoje =
        document.querySelector("#entradas-hoje");

    const saidasHoje =
        document.querySelector("#saidas-hoje");

    const permanecem =
        document.querySelector("#permanecem");


    // ============================================================
    // FINANCEIRO
    // ============================================================
    // Elementos responsáveis pelas informações financeiras
    // do estacionamento.

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
    // Elementos relacionados à tabela de movimentações.

    const btnTodasMovimentacoes =
        document.querySelector("#todasMovimentacoes");

    const tabelaMovimentacoes =
        document.querySelector("#corpo-tabela");

    const btnAtualizarMovimentacao =
        document.querySelector("#btnAtualizarMovimentacoes");


    // ============================================================
    // IOT
    // ============================================================
    // Elementos relacionados ao sistema IoT.

    const dataIOT =
        document.querySelector("#data-iot");

    const btnAtualizarIOT =
        document.querySelector("#btnAtualizarIot");


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

    btnTodasMovimentacoes.addEventListener("click", (event) => {

        event.preventDefault();

        todasMovimentacoes(todosRegistros);

    });


    // ============================================================
    // ATUALIZAR IOT
    // ============================================================
    // Quando o botão de atualizar IoT for clicado,
    // o dashboard será carregado novamente.
    //
    // Como carregarDashboard() chama carregarDispositivosIOT(),
    // os dados do Firebase também serão atualizados.

    btnAtualizarIOT.addEventListener("click", () => {

        carregarDashboard();

    });


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

            const resposta =
                await fetch("/dashboard");


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
                data.tempoUso;


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

            subFinanceiro.textContent =
                `${entradas} entradas hoje`;


            // ====================================================
            // DATA DE ATUALIZAÇÃO
            // ====================================================
            // Pega a data e hora atual do computador/navegador.

            const horario =
                new Date();


            // Converte para o formato brasileiro.
            //
            // Exemplo:
            // 24/08/2026, 15:30:20

            dataIOT.textContent =
                horario.toLocaleString("pt-BR");


            // ====================================================
            // VAGAS
            // ====================================================
            // Envia a lista de vagas recebida do backend
            // para a função responsável por montar a interface.

            carregarVagas(
                data.listaVagas || []
            );


            // ====================================================
            // MOVIMENTAÇÕES
            // ====================================================
            // Envia as movimentações para serem exibidas
            // na tabela.

            todasMovimentacoes(
                data.movimentacao?.movimentacoes || []
            );


            // ====================================================
            // DISPOSITIVOS IOT
            // ====================================================
            // Busca os dispositivos diretamente no Firebase
            // e monta a lista na interface.

            carregarDispositivosIOT();


        } catch (error) {

            // Caso alguma etapa do carregamento falhe,
            // o erro será exibido no console.

            console.error(
                "Erro ao carregar o dashboard:",
                error
            );

        }

    }


    // ============================================================
    // CARREGAR VAGAS
    // ============================================================
    // Recebe um array de vagas e cria os elementos HTML
    // dinamicamente.

    function carregarVagas(vagas) {

        const listaVagas =
            document.querySelector("#listaVagas");


        // Limpa os elementos antigos antes de criar os novos.

        listaVagas.innerHTML = "";


        // Percorre cada vaga recebida.

        vagas.forEach(vaga => {

            // Cria uma nova div.

            const itemVaga =
                document.createElement("div");


            // Adiciona a classe base.

            itemVaga.classList.add(
                "item-vaga"
            );


            // ====================================================
            // VAGA OCUPADA
            // ====================================================

            if (vaga.ocupada) {

                // Adiciona a classe que indica vaga ocupada.

                itemVaga.classList.add(
                    "status-ocupado"
                );


                // Monta o conteúdo da vaga.

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

                // =================================================
                // VAGA LIVRE
                // =================================================

                itemVaga.classList.add(
                    "status-livre"
                );


                // Monta o conteúdo da vaga livre.

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


            // Adiciona a vaga criada dentro da lista.

            listaVagas.appendChild(
                itemVaga
            );

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


            // Adiciona a linha dentro do tbody.

            tabelaMovimentacoes.appendChild(
                row
            );

        });

    }


    // ============================================================
    // CARREGAR DISPOSITIVOS IOT
    // ============================================================
    // Busca os dispositivos no Firebase e monta os elementos
    // dentro da div #lista-dispositivos.
    //
    // A função buscarDispositivoIOT() deve retornar somente
    // os documentos que possuem id_arduino.

    async function carregarDispositivosIOT() {

        try {

            // ----------------------------------------------------
            // BUSCA OS DISPOSITIVOS NO FIREBASE
            // ----------------------------------------------------

            const dispositivos =
                await buscarDispositivoIOT();


            // ----------------------------------------------------
            // LOCALIZA O CONTAINER DOS DISPOSITIVOS
            // ----------------------------------------------------

            const lista =
                document.querySelector("#lista-dispositivos");


            // ----------------------------------------------------
            // LIMPA OS DISPOSITIVOS ANTIGOS
            // ----------------------------------------------------
            // Isso evita que os dispositivos sejam duplicados
            // quando o usuário clicar em atualizar.

            lista.innerHTML = "";


            // ----------------------------------------------------
            // PERCORRE OS DISPOSITIVOS
            // ----------------------------------------------------

            dispositivos.forEach((dispositivo) => {


                // =================================================
                // VERIFICA SE ESTÁ ONLINE
                // =================================================
                // Como você já possui a variável "online" no
                // Firebase, podemos utilizá-la diretamente.
                //
                // true  -> Online
                // false -> Offline

                const online =
                    dispositivo.online;


                // =================================================
                // CLASSE DO LED
                // =================================================
                // Se estiver online:
                //     led-online
                //
                // Se estiver offline:
                //     led-offline

                const classeLed =
                    online
                        ? "led-online"
                        : "led-offline";


                // =================================================
                // CLASSE DO TEXTO
                // =================================================

                const classeTexto =
                    online
                        ? "txt-verde"
                        : "txt-vermelho";


                // =================================================
                // TEXTO DO STATUS
                // =================================================

                const status =
                    online
                        ? "Online"
                        : "Offline";


                // =================================================
                // CRIA O ITEM
                // =================================================
                // Como sua "lista" é uma div e não uma <ul>,
                // criamos outra div para cada dispositivo.

                lista.innerHTML += `

                    <div class="item-iot">

                        <span class="led-iot ${classeLed}">
                        </span>

                        <span class="nome-dispositivo">
                            ${dispositivo.nome_dispositivo}
                        </span>

                        <strong class="status-iot ${classeTexto}">
                            ${status}
                        </strong>

                    </div>

                `;

            });

        } catch (error) {

            // ----------------------------------------------------
            // ERRO AO BUSCAR OS DISPOSITIVOS
            // ----------------------------------------------------
            // Caso o Firebase não responda ou ocorra algum
            // problema na função buscarDispositivoIOT(),
            // o erro será mostrado no console.

            console.error(
                "Erro ao carregar dispositivos IoT:",
                error
            );

        }

    }


    // ============================================================
    // CARREGAMENTO INICIAL
    // ============================================================
    // Assim que o HTML terminar de carregar,
    // buscamos todos os dados do dashboard.

    carregarDashboard();

});