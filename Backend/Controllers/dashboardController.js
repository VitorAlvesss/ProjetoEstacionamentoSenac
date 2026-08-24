const dashboardRepository = require("../Repositories/dashboardRepository");

async function buscarDash(req, res) {

    try {

        const [vagas, registro, entradasHoje, saidasHoje, permanecem, dispositivos, financeiro, todosRegistros, listaVagas] = await Promise.all([

            dashboardRepository.buscarDashboard(),

            dashboardRepository.registro_ocupacao(),

            dashboardRepository.entradasHoje(),

            dashboardRepository.saidasHoje(),

            dashboardRepository.permanecem(),

            dashboardRepository.buscarDispositivoIOT(),

            dashboardRepository.financeiroHoje(),

            dashboardRepository.todos_registros(),

            dashboardRepository.registro_vagasOcupadas()

        ]);

        res.status(200).json({

            vagas: {
                total: vagas.total,
                livres: vagas.livres,
                ocupadas: vagas.ocupadas
            },

            movimentacao: {
                entradasHoje: entradasHoje,
                saidasHoje: saidasHoje,
                permanecem: permanecem,
                movimentacoes: registro
            },

            financeiro: {
                faturamento: financeiro.faturamento,
                veiculos: financeiro.veiculos,
                ticketMedio: financeiro.ticket_medio
            },

            dispositivos,

            todosRegistros,

            listaVagas

        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao carregar dashboard"
        });

    }

}

module.exports = {
    buscarDash
};